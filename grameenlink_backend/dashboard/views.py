from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Count, Sum, Avg, Q
from datetime import timedelta, date
from django.utils import timezone
from django.shortcuts import get_object_or_404
import logging
import json
from decimal import Decimal
from django.core.serializers.json import DjangoJSONEncoder
from rest_framework import permissions

from .models import DashboardAnalytics, UserDashboard, KPI, Notification
from .serializers import (
    DashboardAnalyticsSerializer, UserDashboardSerializer,
    KPISerializer, NotificationSerializer
)
from ai_integration.utils import GeminiAI, AIResponseParser
from users.models import User
from marketplace.models import Order, Product, RetailerDemand
from nodes.models import Node, NodeInventory, NodePerformance, RouteOptimization
from rest_framework.pagination import PageNumberPagination

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class DecimalEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, date):
            return obj.isoformat()
        return super().default(obj)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_admin)

class DashboardAnalyticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        try:
            time_range = request.query_params.get('time_range', 'daily')
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            
            queryset = DashboardAnalytics.objects.all().order_by('-date', '-time_range')
            
            if time_range:
                queryset = queryset.filter(time_range=time_range)
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            serializer = DashboardAnalyticsSerializer(page, many=True)
            
            return paginator.get_paginated_response({
                "status": "success",
                "message": "Analytics data retrieved successfully",
                "data": serializer.data
            })
        except Exception as e:
            logger.error(f"Error in DashboardAnalyticsView: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "Failed to retrieve analytics",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class GenerateDashboardAnalyticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        try:
            time_range = request.data.get('time_range', 'weekly')
            reference_date = request.data.get('date', date.today().isoformat())
            
            if time_range == 'daily':
                start_date = reference_date
                end_date = reference_date
            elif time_range == 'weekly':
                start_date = (date.fromisoformat(reference_date) - timedelta(days=6))
                end_date = reference_date
            else:  # monthly
                start_date = (date.fromisoformat(reference_date) - timedelta(days=29))
                end_date = reference_date
            
            orders = Order.objects.filter(
                order_date__date__range=(start_date, end_date)
            ).aggregate(
                total_orders=Count('id'),
                total_revenue=Sum('total_amount'),
                avg_order_value=Avg('total_amount')
            )
            
            fulfilled_orders = Order.objects.filter(
                order_date__date__range=(start_date, end_date),
                status='delivered'
            ).count()
            fulfillment_rate = (fulfilled_orders / orders['total_orders']) * 100 if orders['total_orders'] > 0 else 0
            
            # Get active users count by type
            active_users = {
                user_type: User.objects.filter(
                    user_type=user_type,
                    is_active=True,
                    last_login__date__range=(start_date, end_date)
                ).count()
                for user_type, _ in User.USER_TYPES
            }
            
            active_nodes = Node.objects.filter(
                status='active',
                performance_records__date__range=(start_date, end_date)
            ).distinct().count()
            
            top_products = Product.objects.filter(
                order_items__order__order_date__date__range=(start_date, end_date)
            ).annotate(
                order_count=Count('order_items'),
                total_quantity=Sum('order_items__quantity')
            ).order_by('-order_count')[:5].values(
                'id', 'name', 'order_count', 'total_quantity'
            )
            
            node_performance = NodePerformance.objects.filter(
                date__range=(start_date, end_date)
            ).values('node__operator__name').annotate(
                total_orders=Sum('orders_processed'),
                total_revenue=Sum('revenue_generated'),
                avg_fulfillment=Avg('fulfillment_rate')
            ).order_by('-total_orders')[:5]
            
            analytics, created = DashboardAnalytics.objects.update_or_create(
                date=end_date,
                time_range=time_range,
                defaults={
                    'total_orders': orders['total_orders'] or 0,
                    'total_revenue': orders['total_revenue'] or 0,
                    'active_users': active_users,  # This requires JSONField in model
                    'active_nodes': active_nodes,
                    'products_available': Product.objects.filter(is_active=True).count(),
                    'order_fulfillment_rate': fulfillment_rate,
                    'avg_order_value': orders['avg_order_value'] or 0,
                    'top_products': list(top_products),
                    'node_performance': list(node_performance)
                }
            )
            
            serializer = DashboardAnalyticsSerializer(analytics)
            return Response({
                "status": "success",
                "message": f"{time_range.capitalize()} analytics generated successfully",
                "data": serializer.data
            })
            
        except Exception as e:
            logger.error(f"Failed to generate dashboard analytics: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "Failed to generate analytics",
                "data": {'error': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class GenerateAIAnalyticsInsightsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        try:
            time_range = request.data.get('time_range', 'weekly')
            days = 7 if time_range == 'weekly' else 30
            
            analytics = DashboardAnalytics.objects.filter(
                time_range=time_range
            ).order_by('-date')[:4]
            
            if not analytics.exists():
                return Response({
                    "status": "error",
                    "message": "No analytics data available to generate insights",
                    "data": None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            recent_orders = Order.objects.filter(
                order_date__gte=timezone.now() - timedelta(days=days)
            ).values('order_date__date').annotate(
                count=Count('id'),
                revenue=Sum('total_amount')
            ).order_by('order_date__date')
            
            recent_demands = RetailerDemand.objects.filter(
                recorded_at__gte=timezone.now() - timedelta(days=days)
            ).values('product__name').annotate(
                total_demand=Sum('quantity')
            ).order_by('-total_demand')[:10]
            
            # Convert QuerySets to lists so they can be serialized
            recent_orders_list = list(recent_orders)
            recent_demands_list = list(recent_demands)
            
            # Convert date objects to strings in the recent_orders data
            for order in recent_orders_list:
                if isinstance(order['order_date__date'], date):
                    order['order_date__date'] = order['order_date__date'].isoformat()
            
            # Use the DecimalEncoder for proper serialization
            prompt = f"""
            Analyze this rural supply chain platform data and provide business insights:
            
            Time Range: {time_range.capitalize()} (last {days} days)
            
            Recent Analytics:
            {json.dumps(DashboardAnalyticsSerializer(analytics, many=True).data, cls=DecimalEncoder, indent=2)}
            
            Order Trends:
            {json.dumps(recent_orders_list, cls=DecimalEncoder, indent=2)}
            
            Top Demands:
            {json.dumps(recent_demands_list, cls=DecimalEncoder, indent=2)}
            
            Provide comprehensive insights in JSON format with these sections:
            1. performance_summary (key metrics, trends)
            2. strengths (what's working well)
            3. weaknesses (areas needing improvement)
            4. opportunities (potential growth areas)
            5. threats (risks to monitor)
            6. recommendations (actionable suggestions)
            7. forecast (next period predictions)
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            latest_analytics = analytics.first()
            latest_analytics.ai_generated_insights = parsed_response
            latest_analytics.generated_at = timezone.now()
            latest_analytics.save()
            
            return Response({
                "status": "success",
                "message": "AI insights generated successfully",
                "data": {
                    'insights': parsed_response,
                    'generated_at': response['timestamp'],
                    'analytics_id': latest_analytics.id
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to generate AI analytics insights: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "Failed to generate insights",
                "data": {'error': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class UserDashboardView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        dashboard, created = UserDashboard.objects.get_or_create(user=user)
        
        if created or not dashboard.recent_orders.exists():
            recent_orders = Order.objects.filter(
                retailer=user
            ).order_by('-order_date')[:5] if user.user_type == 'retailer' else None
            
            if recent_orders:
                dashboard.recent_orders.set(recent_orders)
                dashboard.save()
        
        serializer = UserDashboardSerializer(dashboard)
        return Response({
            "status": "success",
            "message": "User dashboard retrieved successfully",
            "data": serializer.data
        })
    
    def patch(self, request):
        user = request.user
        dashboard = get_object_or_404(UserDashboard, user=user)
        
        serializer = UserDashboardSerializer(dashboard, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "Dashboard preferences updated successfully",
                "data": serializer.data
            })
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
class GeneratePersonalizedInsightsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            dashboard = UserDashboard.objects.get(user=user)
            
            if user.user_type == 'retailer':
                orders = Order.objects.filter(
                    retailer=user
                ).order_by('-order_date')[:10].values(
                    'id', 'order_date', 'total_amount', 'status'
                )
                
                spending = Order.objects.filter(
                    retailer=user
                ).values('order_date__date').annotate(
                    total=Sum('total_amount')
                ).order_by('order_date__date')
                
                products = Product.objects.filter(
                    order_items__order__retailer=user
                ).annotate(
                    order_count=Count('order_items'),
                    total_quantity=Sum('order_items__quantity')
                ).order_by('-order_count')[:10].values(
                    'name', 'order_count', 'total_quantity'
                )
                
                # Convert QuerySets to lists and serialize with DecimalEncoder
                orders_json = json.dumps(list(orders), cls=DecimalEncoder, indent=2)
                spending_json = json.dumps(list(spending), cls=DecimalEncoder, indent=2)
                products_json = json.dumps(list(products), cls=DecimalEncoder, indent=2)
                
                prompt_context = f"""
                Generate personalized insights for retailer {user.name}:
                
                Recent Orders:
                {orders_json}
                
                Spending Trends:
                {spending_json}
                
                Top Products:
                {products_json}
                """
            
            elif user.user_type == 'node':
                node = Node.objects.get(operator=user)
                performance = NodePerformance.objects.filter(
                    node=node
                ).order_by('-date')[:10].values(
                    'date', 'orders_processed', 'revenue_generated', 'fulfillment_rate'
                )
                
                inventory = NodeInventory.objects.filter(
                    node=node
                ).values(
                    'product__name', 'quantity', 'threshold'
                )
                
                routes = RouteOptimization.objects.filter(
                    node=node
                ).order_by('-optimization_date')[:5].values(
                    'optimization_date', 'estimated_savings', 'actual_savings'
                )
                
                # Convert QuerySets to lists and serialize with DecimalEncoder
                performance_json = json.dumps(list(performance), cls=DecimalEncoder, indent=2)
                inventory_json = json.dumps(list(inventory), cls=DecimalEncoder, indent=2)
                routes_json = json.dumps(list(routes), cls=DecimalEncoder, indent=2)
                
                prompt_context = f"""
                Generate operational insights for node operator {user.name}:
                
                Recent Performance:
                {performance_json}
                
                Current Inventory:
                {inventory_json}
                
                Route Optimizations:
                {routes_json}
                """
            
            elif user.user_type == 'distributor':
                products = Product.objects.filter(
                    distributor=user
                ).annotate(
                    order_count=Count('order_items'),
                    total_quantity=Sum('order_items__quantity')
                ).order_by('-order_count')[:10].values(
                    'name', 'price_per_unit', 'order_count', 'total_quantity'
                )
                
                demands = RetailerDemand.objects.filter(
                    product__distributor=user,
                    fulfilled=False
                ).values('product__name').annotate(
                    total_demand=Sum('quantity')
                ).order_by('-total_demand')[:10]
                
                # Convert QuerySets to lists and serialize with DecimalEncoder
                products_json = json.dumps(list(products), cls=DecimalEncoder, indent=2)
                demands_json = json.dumps(list(demands), cls=DecimalEncoder, indent=2)
                
                prompt_context = f"""
                Generate sales insights for distributor {user.name}:
                
                Top Products:
                {products_json}
                
                Pending Demands:
                {demands_json}
                """
            
            else:
                return Response({
                    "status": "error",
                    "message": "Use the admin analytics endpoint for insights",
                    "data": None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            prompt = f"""
            Analyze this user's data and provide personalized insights:
            
            User Type: {user.get_user_type_display()}
            Location: {user.location or 'N/A'}
            
            {prompt_context}
            
            Provide insights in JSON format with these sections:
            1. performance_summary
            2. key_metrics
            3. improvement_opportunities
            4. recommendations
            5. next_steps
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            dashboard.ai_insights = parsed_response
            dashboard.ai_insights_generated_at = timezone.now()
            dashboard.save()
            
            return Response({
                "status": "success",
                "message": "Personalized insights generated successfully",
                "data": {
                    'insights': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to generate personalized insights: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "Failed to generate insights",
                "data": {'error': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class KPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        queryset = KPI.objects.filter(is_active=True).order_by('kpi_type', '-updated_at')
        
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = KPISerializer(page, many=True)
        
        return paginator.get_paginated_response({
            "status": "success",
            "message": "KPIs retrieved successfully",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = KPISerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "KPI created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class KPIDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_object(self, pk):
        return get_object_or_404(KPI, pk=pk)
    
    def get(self, request, pk):
        kpi = self.get_object(pk)
        serializer = KPISerializer(kpi)
        return Response({
            "status": "success",
            "message": "KPI retrieved successfully",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        kpi = self.get_object(pk)
        serializer = KPISerializer(kpi, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "KPI updated successfully",
                "data": serializer.data
            })
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        kpi = self.get_object(pk)
        kpi.delete()
        return Response({
            "status": "success",
            "message": "KPI deleted successfully",
            "data": None
        }, status=status.HTTP_204_NO_CONTENT)
class UpdateKPIsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        try:
            # For orders KPI
            try:
                orders_kpi = KPI.objects.get(kpi_type='orders')
                orders_kpi.name = 'Total Orders'
                orders_kpi.target_value = 1000
                orders_kpi.current_value = Order.objects.count()
                orders_kpi.timeframe = 'Monthly'
                orders_kpi.save()
            except KPI.DoesNotExist:
                orders_kpi = KPI.objects.create(
                    kpi_type='orders',
                    name='Total Orders',
                    target_value=1000,
                    current_value=Order.objects.count(),
                    timeframe='Monthly'
                )
            except KPI.MultipleObjectsReturned:
                # Handle duplicate KPIs - keep one and delete the rest
                kpis = KPI.objects.filter(kpi_type='orders').order_by('-updated_at')
                orders_kpi = kpis.first()
                orders_kpi.name = 'Total Orders'
                orders_kpi.target_value = 1000
                orders_kpi.current_value = Order.objects.count()
                orders_kpi.timeframe = 'Monthly'
                orders_kpi.save()
                kpis.exclude(id=orders_kpi.id).delete()
            
            # For revenue KPI
            total_revenue = Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            try:
                revenue_kpi = KPI.objects.get(kpi_type='revenue')
                revenue_kpi.name = 'Total Revenue'
                revenue_kpi.target_value = 500000
                revenue_kpi.current_value = total_revenue
                revenue_kpi.timeframe = 'Monthly'
                revenue_kpi.save()
            except KPI.DoesNotExist:
                revenue_kpi = KPI.objects.create(
                    kpi_type='revenue',
                    name='Total Revenue',
                    target_value=500000,
                    current_value=total_revenue,
                    timeframe='Monthly'
                )
            except KPI.MultipleObjectsReturned:
                kpis = KPI.objects.filter(kpi_type='revenue').order_by('-updated_at')
                revenue_kpi = kpis.first()
                revenue_kpi.name = 'Total Revenue'
                revenue_kpi.target_value = 500000
                revenue_kpi.current_value = total_revenue
                revenue_kpi.timeframe = 'Monthly'
                revenue_kpi.save()
                kpis.exclude(id=revenue_kpi.id).delete()
            
            # For fulfillment KPI
            fulfilled_orders = Order.objects.filter(status='delivered').count()
            total_orders = Order.objects.count()
            fulfillment_rate = (fulfilled_orders / total_orders * 100) if total_orders > 0 else 0
            try:
                fulfillment_kpi = KPI.objects.get(kpi_type='fulfillment')
                fulfillment_kpi.name = 'Order Fulfillment Rate'
                fulfillment_kpi.target_value = 95
                fulfillment_kpi.current_value = fulfillment_rate
                fulfillment_kpi.timeframe = 'Weekly'
                fulfillment_kpi.save()
            except KPI.DoesNotExist:
                fulfillment_kpi = KPI.objects.create(
                    kpi_type='fulfillment',
                    name='Order Fulfillment Rate',
                    target_value=95,
                    current_value=fulfillment_rate,
                    timeframe='Weekly'
                )
            except KPI.MultipleObjectsReturned:
                kpis = KPI.objects.filter(kpi_type='fulfillment').order_by('-updated_at')
                fulfillment_kpi = kpis.first()
                fulfillment_kpi.name = 'Order Fulfillment Rate'
                fulfillment_kpi.target_value = 95
                fulfillment_kpi.current_value = fulfillment_rate
                fulfillment_kpi.timeframe = 'Weekly'
                fulfillment_kpi.save()
                kpis.exclude(id=fulfillment_kpi.id).delete()
            
            # For users KPI
            active_users = User.objects.filter(
                is_active=True,
                last_login__gte=timezone.now() - timedelta(days=30)
            ).count()
            try:
                users_kpi = KPI.objects.get(kpi_type='users')
                users_kpi.name = 'Active Users'
                users_kpi.target_value = 200
                users_kpi.current_value = active_users
                users_kpi.timeframe = 'Monthly'
                users_kpi.save()
            except KPI.DoesNotExist:
                users_kpi = KPI.objects.create(
                    kpi_type='users',
                    name='Active Users',
                    target_value=200,
                    current_value=active_users,
                    timeframe='Monthly'
                )
            except KPI.MultipleObjectsReturned:
                kpis = KPI.objects.filter(kpi_type='users').order_by('-updated_at')
                users_kpi = kpis.first()
                users_kpi.name = 'Active Users'
                users_kpi.target_value = 200
                users_kpi.current_value = active_users
                users_kpi.timeframe = 'Monthly'
                users_kpi.save()
                kpis.exclude(id=users_kpi.id).delete()
            
            # For nodes KPI
            avg_fulfillment = NodePerformance.objects.aggregate(Avg('fulfillment_rate'))['fulfillment_rate__avg'] or 0
            try:
                nodes_kpi = KPI.objects.get(kpi_type='nodes')
                nodes_kpi.name = 'Average Node Fulfillment Rate'
                nodes_kpi.target_value = 90
                nodes_kpi.current_value = avg_fulfillment
                nodes_kpi.timeframe = 'Weekly'
                nodes_kpi.save()
            except KPI.DoesNotExist:
                nodes_kpi = KPI.objects.create(
                    kpi_type='nodes',
                    name='Average Node Fulfillment Rate',
                    target_value=90,
                    current_value=avg_fulfillment,
                    timeframe='Weekly'
                )
            except KPI.MultipleObjectsReturned:
                kpis = KPI.objects.filter(kpi_type='nodes').order_by('-updated_at')
                nodes_kpi = kpis.first()
                nodes_kpi.name = 'Average Node Fulfillment Rate'
                nodes_kpi.target_value = 90
                nodes_kpi.current_value = avg_fulfillment
                nodes_kpi.timeframe = 'Weekly'
                nodes_kpi.save()
                kpis.exclude(id=nodes_kpi.id).delete()
            
            return Response({
                "status": "success",
                "message": "KPIs updated successfully",
                "data": {
                    'updated_kpis': [
                        orders_kpi.name,
                        revenue_kpi.name,
                        fulfillment_kpi.name,
                        users_kpi.name,
                        nodes_kpi.name
                    ]
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to update KPIs: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "Failed to update KPIs",
                "data": {'error': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NotificationView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        mark_read = request.query_params.get('mark_read', '').lower() == 'true'
        if mark_read and notifications.filter(is_read=False).exists():
            notifications.filter(is_read=False).update(is_read=True)
        
        notification_type = request.query_params.get('type')
        if notification_type:
            notifications = notifications.filter(notification_type=notification_type)
        
        is_read = request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            notifications = notifications.filter(is_read=is_read_bool)
        
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(notifications, request)
        serializer = NotificationSerializer(page, many=True)
        
        return paginator.get_paginated_response({
            "status": "success",
            "message": "Notifications retrieved successfully",
            "data": serializer.data
        })

class NotificationDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        return get_object_or_404(Notification, pk=pk, user=user)
    
    def get(self, request, pk):
        notification = self.get_object(pk, request.user)
        
        if not notification.is_read:
            notification.is_read = True
            notification.save()
        
        serializer = NotificationSerializer(notification)
        return Response({
            "status": "success",
            "message": "Notification retrieved successfully",
            "data": serializer.data
        })
    
    def delete(self, request, pk):
        notification = self.get_object(pk, request.user)
        notification.delete()
        return Response({
            "status": "success",
            "message": "Notification deleted successfully",
            "data": None
        }, status=status.HTTP_204_NO_CONTENT)

class MarkAllNotificationsReadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        updated = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            "status": "success",
            "message": f"Marked {updated} notifications as read",
            "data": {'marked_read': updated}
        })

class UnreadNotificationCountView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        return Response({
            "status": "success",
            "message": "Unread notification count retrieved",
            "data": {'count': count}
        })