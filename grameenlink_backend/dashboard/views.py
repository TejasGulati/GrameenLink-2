from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, F, Q, Avg
from datetime import timedelta, date
from django.utils import timezone
import logging
import json
from decimal import Decimal
from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import get_object_or_404

from .models import DashboardAnalytics, UserDashboard
from .serializers import DashboardAnalyticsSerializer, UserDashboardSerializer
from ai_integration.utils import GeminiAI, AIResponseParser
from users.models import User
from marketplace.models import Order, Product, RetailerDemand
from nodes.models import Node, NodePerformance, NodeInventory, RouteOptimization
from marketplace.serializers import ProductSerializer

logger = logging.getLogger(__name__)

class DecimalEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, date):
            return obj.isoformat()
        return super().default(obj)

class DashboardAnalyticsListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        analytics = DashboardAnalytics.objects.all().order_by('-date')[:30]
        serializer = DashboardAnalyticsSerializer(analytics, many=True)
        return Response({
            "status": 200,
            "message": "Dashboard analytics retrieved successfully",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = DashboardAnalyticsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 201,
                "message": "Dashboard analytics created successfully",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided",
            "data": serializer.errors
        })

class DashboardAnalyticsDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        analytics = get_object_or_404(DashboardAnalytics, pk=pk)
        serializer = DashboardAnalyticsSerializer(analytics)
        return Response({
            "status": 200,
            "message": "Dashboard analytics retrieved successfully",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        analytics = get_object_or_404(DashboardAnalytics, pk=pk)
        serializer = DashboardAnalyticsSerializer(analytics, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Dashboard analytics updated successfully",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided",
            "data": serializer.errors
        })
    
    def delete(self, request, pk):
        analytics = get_object_or_404(DashboardAnalytics, pk=pk)
        analytics.delete()
        return Response({
            "status": 204,
            "message": "Dashboard analytics deleted successfully",
            "data": {}
        })

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        data = {}
        
        if user.user_type == 'admin':
            data['total_orders'] = Order.objects.count()
            total_revenue = Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0')
            data['total_revenue'] = float(total_revenue)
            data['active_retailers'] = User.objects.filter(user_type='retailer', is_active=True).count()
            data['active_nodes'] = Node.objects.filter(is_active=True).count()
            data['products_available'] = Product.objects.count()
        
        elif user.user_type == 'node':
            node = Node.objects.get(operator=user)
            data['orders_processed'] = Order.objects.filter(node=user).count()
            revenue = Order.objects.filter(node=user).aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0')
            data['revenue_generated'] = float(revenue)
            data['retailers_served'] = Order.objects.filter(node=user).values('retailer').distinct().count()
            data['inventory_items'] = NodeInventory.objects.filter(node=node).count()
        
        elif user.user_type == 'retailer':
            data['total_orders'] = Order.objects.filter(retailer=user).count()
            total_spent = Order.objects.filter(retailer=user).aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0')
            data['total_spent'] = float(total_spent)
            data['favorite_products'] = Product.objects.filter(order__retailer=user).distinct().count()
            data['nodes_used'] = Order.objects.filter(retailer=user).values('node').distinct().count()
        
        return Response({
            "status": 200,
            "message": "Dashboard summary retrieved successfully",
            "data": data
        })

class GenerateAIAnalysisView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            time_range = request.data.get('time_range', '30d')
            
            if time_range == '7d':
                start_date = timezone.now() - timedelta(days=7)
            elif time_range == '30d':
                start_date = timezone.now() - timedelta(days=30)
            elif time_range == '90d':
                start_date = timezone.now() - timedelta(days=90)
            else:
                start_date = timezone.now() - timedelta(days=30)
            
            prompt_context = ""
            
            if user.user_type == 'admin':
                orders = Order.objects.filter(order_date__gte=start_date)
                nodes = Node.objects.all()
                retailers = User.objects.filter(user_type='retailer')
                
                order_trends = list(orders.values('order_date__date').annotate(
                    count=Count('id'),
                    revenue=Sum('total_amount')
                ).order_by('order_date__date'))
                
                node_performance = list(NodePerformance.objects.filter(
                    date__gte=start_date
                ).values('node__operator__name', 'date').annotate(
                    orders=Sum('orders_processed'),
                    revenue=Sum('revenue_generated')
                ).order_by('node__operator__name', 'date'))
                
                avg_order_value = orders.aggregate(avg=Avg('total_amount'))['avg'] or Decimal('0')
                
                prompt_context = f"""
                Platform Overview (last {time_range}):
                
                Orders:
                {json.dumps(order_trends, cls=DecimalEncoder, indent=2)}
                
                Node Performance:
                {json.dumps(node_performance, cls=DecimalEncoder, indent=2)}
                
                Key Metrics:
                - Total Retailers: {retailers.count()}
                - Active Nodes: {nodes.filter(is_active=True).count()}
                - Average Order Value: {float(avg_order_value)}
                """
            
            elif user.user_type == 'node':
                node = Node.objects.get(operator=user)
                node_perf = list(NodePerformance.objects.filter(
                    node=node,
                    date__gte=start_date
                ).order_by('date').values())
                
                inventory = list(NodeInventory.objects.filter(node=node).values(
                    'product__name',
                    'quantity'
                ))
                
                prompt_context = f"""
                Node Performance Analysis for {node.operator.name}:
                
                Performance Metrics:
                {json.dumps(node_perf, cls=DecimalEncoder, indent=2)}
                
                Current Inventory:
                {json.dumps(inventory, cls=DecimalEncoder, indent=2)}
                """
            
            elif user.user_type == 'retailer':
                orders = list(Order.objects.filter(
                    retailer=user,
                    order_date__gte=start_date
                ).order_by('order_date').values('id', 'order_date', 'total_amount', 'status'))
                
                spending = list(Order.objects.filter(
                    retailer=user,
                    order_date__gte=start_date
                ).values('order_date__date').annotate(
                    total=Sum('total_amount')
                ).order_by('order_date__date'))
                
                products = list(Product.objects.filter(
                    order__retailer=user,
                    order__order_date__gte=start_date
                ).annotate(
                    order_count=Count('order'),
                    total_quantity=Sum('order__items__quantity')
                ).order_by('-order_count')[:10].values('name', 'order_count', 'total_quantity'))
                
                prompt_context = f"""
                Retailer Activity Analysis for {user.name}:
                
                Order History:
                {json.dumps(orders, cls=DecimalEncoder, indent=2)}
                
                Spending Trends:
                {json.dumps(spending, cls=DecimalEncoder, indent=2)}
                
                Top Products:
                {json.dumps(products, cls=DecimalEncoder, indent=2)}
                """
            
            if not prompt_context:
                return Response({
                    "status": 400,
                    "message": "No analytics data available for this user type",
                    "data": {}
                })
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt_context)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "status": 200,
                "message": "AI analysis generated successfully",
                "data": {
                    'analysis': parsed_response,
                    'time_range': time_range,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to generate AI analysis: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to generate analysis",
                "data": {"error": str(e)}
            })

class UserDashboardListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        dashboards = UserDashboard.objects.filter(user=request.user)
        serializer = UserDashboardSerializer(dashboards, many=True)
        return Response({
            "status": 200,
            "message": "User dashboards retrieved successfully",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = UserDashboardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({
                "status": 201,
                "message": "User dashboard created successfully",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided",
            "data": serializer.errors
        })

class UserDashboardDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        dashboard = get_object_or_404(UserDashboard, pk=pk, user=request.user)
        serializer = UserDashboardSerializer(dashboard)
        return Response({
            "status": 200,
            "message": "User dashboard retrieved successfully",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        dashboard = get_object_or_404(UserDashboard, pk=pk, user=request.user)
        serializer = UserDashboardSerializer(dashboard, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "User dashboard updated successfully",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided",
            "data": serializer.errors
        })
    
    def delete(self, request, pk):
        dashboard = get_object_or_404(UserDashboard, pk=pk, user=request.user)
        dashboard.delete()
        return Response({
            "status": 204,
            "message": "User dashboard deleted successfully",
            "data": {}
        })

class UserRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        recommendations = {}
        
        if user.user_type == 'retailer':
            popular_products = Product.objects.filter(
                order__retailer__location=user.location
            ).annotate(
                order_count=Count('order')
            ).order_by('-order_count')[:5]
            
            recommendations['products'] = ProductSerializer(popular_products, many=True).data
        
        elif user.user_type == 'node':
            nearby_demand = RetailerDemand.objects.filter(
                retailer__location=user.location,
                fulfilled=False
            ).values('product').annotate(
                total_demand=Sum('quantity')
            ).order_by('-total_demand')[:5]
            
            product_ids = [item['product'] for item in nearby_demand]
            products = Product.objects.filter(id__in=product_ids)
            recommendations['products_to_stock'] = ProductSerializer(products, many=True).data
        
        return Response({
            "status": 200,
            "message": "Recommendations retrieved successfully",
            "data": recommendations
        })

class GeneratePersonalizedInsightsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            dashboard = get_object_or_404(UserDashboard, pk=pk, user=request.user)
            user = dashboard.user
            
            if user.user_type == 'retailer':
                orders = list(Order.objects.filter(retailer=user)
                    .order_by('-order_date')[:10]
                    .values('id', 'order_date', 'total_amount', 'status'))
                
                products = list(dashboard.preferred_products.all()
                    .values('name', 'price_per_unit'))
                
                nodes = list(dashboard.favorite_nodes.all()
                    .values('operator__name', 'coverage_area'))
                
                prompt_context = f"""
                Generate personalized insights for retailer {user.name}:
                
                Recent Orders:
                {json.dumps(orders, cls=DecimalEncoder, indent=2)}
                
                Preferred Products:
                {json.dumps(products, cls=DecimalEncoder, indent=2)}
                
                Favorite Nodes:
                {json.dumps(nodes, cls=DecimalEncoder, indent=2)}
                """
            
            elif user.user_type == 'node':
                node = Node.objects.get(operator=user)
                performance = list(NodePerformance.objects.filter(node=node)
                    .order_by('-date')[:10]
                    .values('date', 'orders_processed', 'revenue_generated'))
                
                inventory = list(NodeInventory.objects.filter(node=node)
                    .values('product__name', 'quantity'))
                
                routes = list(RouteOptimization.objects.filter(node=node)
                    .order_by('-optimization_date')[:5]
                    .values('optimization_date', 'estimated_savings'))
                
                prompt_context = f"""
                Generate operational insights for node operator {user.name}:
                
                Recent Performance:
                {json.dumps(performance, cls=DecimalEncoder, indent=2)}
                
                Current Inventory:
                {json.dumps(inventory, cls=DecimalEncoder, indent=2)}
                
                Route Optimizations:
                {json.dumps(routes, cls=DecimalEncoder, indent=2)}
                """
            
            else:
                return Response({
                    "status": 400,
                    "message": "Personalized insights not available for this user type",
                    "data": {}
                })
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt_context)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            dashboard.ai_insights = parsed_response
            dashboard.ai_insights_generated_at = timezone.now()
            dashboard.save()
            
            return Response({
                "status": 200,
                "message": "Personalized insights generated successfully",
                "data": {
                    'insights': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to generate personalized insights: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to generate insights",
                "data": {"error": str(e)}
            })