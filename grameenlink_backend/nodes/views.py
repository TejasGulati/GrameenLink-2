import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, F, Q, Avg
from datetime import timedelta, date
from django.utils import timezone
from django.shortcuts import get_object_or_404
import logging
from decimal import Decimal
from django.core.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination

from users.views import IsAdminUser

from .models import (
    Node, NodeInventory, NodePerformance, 
    RouteOptimization, NodeMaintenanceLog
)
from .serializers import (
    NodeSerializer, NodeInventorySerializer,
    NodePerformanceSerializer, RouteOptimizationSerializer,
    NodeMaintenanceLogSerializer
)
from ai_integration.utils import GeminiAI, AIResponseParser
from marketplace.models import Order, OrderItem
from users.models import User

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class NodeListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        user = request.user
        queryset = Node.objects.all().select_related('operator', 'parent_node')
        
        if user.user_type == 'node':
            queryset = queryset.filter(operator=user)
            
        # Apply filters
        node_type = request.query_params.get('node_type')
        status = request.query_params.get('status')
        parent_node = request.query_params.get('parent_node')
        coverage_area = request.query_params.get('coverage_area')
        
        if node_type:
            queryset = queryset.filter(node_type=node_type)
        if status:
            queryset = queryset.filter(status=status)
        if parent_node:
            queryset = queryset.filter(parent_node=parent_node)
        if coverage_area:
            queryset = queryset.filter(coverage_area__icontains=coverage_area)
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = NodeSerializer(page, many=True)
        
        return paginator.get_paginated_response(serializer.data)
    
    def post(self, request):
        if not request.user.is_admin:
            return Response(
                {"error": "Only admin users can create nodes"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = NodeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            node = serializer.save()
            return Response(
                NodeSerializer(node).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NodeDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def get_object(self, pk):
        node = get_object_or_404(Node.objects.select_related('operator', 'parent_node'), pk=pk)
        
        # Node operators can only access their own node
        if self.request.user.user_type == 'node' and node.operator != self.request.user:
            raise PermissionDenied("You can only access your own node")
            
        return node
    
    def get(self, request, pk):
        node = self.get_object(pk)
        serializer = NodeSerializer(node)
        return Response(serializer.data)
    
    def put(self, request, pk):
        node = self.get_object(pk)
        serializer = NodeSerializer(node, data=request.data, partial=False, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        node = self.get_object(pk)
        serializer = NodeSerializer(node, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        node = self.get_object(pk)
        node.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class NodeInventoryListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = NodeInventory.objects.select_related('node', 'product')
        
        if self.request.user.user_type == 'node':
            queryset = queryset.filter(node__operator=self.request.user)
        
        return queryset
    
    def get(self, request):
        queryset = self.get_queryset()
        
        # Apply filters
        node_id = request.query_params.get('node')
        product_id = request.query_params.get('product')
        needs_restock = request.query_params.get('needs_restock')
        
        if node_id:
            queryset = queryset.filter(node_id=node_id)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        if needs_restock == 'true':
            queryset = queryset.filter(quantity__lte=F('threshold'))
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = NodeInventorySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def post(self, request):
        serializer = NodeInventorySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Check permissions
            if request.user.user_type == 'node':
                node_id = serializer.validated_data['node'].id
                if not Node.objects.filter(id=node_id, operator=request.user).exists():
                    return Response(
                        {"error": "You can only add inventory to your own node"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            inventory = serializer.save()
            return Response(
                NodeInventorySerializer(inventory).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NodeInventoryDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        inventory = get_object_or_404(
            NodeInventory.objects.select_related('node', 'product'), 
            pk=pk
        )
        
        # Node operators can only access their own inventory
        if self.request.user.user_type == 'node' and inventory.node.operator != self.request.user:
            raise PermissionDenied("You can only access inventory for your own node")
            
        return inventory
    
    def get(self, request, pk):
        inventory = self.get_object(pk)
        serializer = NodeInventorySerializer(inventory)
        return Response(serializer.data)
    
    def put(self, request, pk):
        inventory = self.get_object(pk)
        serializer = NodeInventorySerializer(
            inventory, 
            data=request.data, 
            partial=False, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        inventory = self.get_object(pk)
        inventory.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class NodePerformanceView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self, node=None):
        queryset = NodePerformance.objects.select_related('node')
        
        if node:
            queryset = queryset.filter(node=node)
        elif self.request.user.user_type == 'node':
            node = get_object_or_404(Node, operator=self.request.user)
            queryset = queryset.filter(node=node)
            
        return queryset
    
    def get(self, request, pk=None):
        queryset = self.get_queryset(
            node=get_object_or_404(Node, pk=pk) if pk else None
        )
        
        # Apply filters
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = NodePerformanceSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
class NodeGenerateAIInsightsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        node = get_object_or_404(Node, pk=pk)
        
        # Check permissions
        if request.user.user_type == 'node' and node.operator != request.user:
            return Response(
                {"error": "You can only generate insights for your own node."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Get performance data (last 90 days)
            performance = NodePerformance.objects.filter(
                node=node,
                date__gte=timezone.now() - timedelta(days=90)
            )

            # Get inventory data
            inventory = NodeInventory.objects.filter(node=node)

            # Get recent orders (last 30 days)
            orders = Order.objects.filter(
                node=node.operator,
                order_date__gte=timezone.now() - timedelta(days=30)
            )

            # Get recent route optimizations (last 5 entries)
            routes = RouteOptimization.objects.filter(
                node=node
            ).order_by('-optimization_date')[:5]
            
            # Construct the AI prompt
            prompt = f"""
            Analyze this node's performance and provide actionable insights:

            Node Information:
            - Type: {node.node_type}
            - Status: {node.status}
            - Coverage Area: {node.coverage_area}
            - Capacity: {node.capacity}
            - Established: {node.established_date}

            Performance Metrics (last 90 days):
            {list(performance.values())}

            Current Inventory:
            {list(inventory.values())}

            Recent Orders (last 30 days):
            {list(orders.values())}

            Recent Route Optimizations:
            {list(routes.values())}

            Provide comprehensive insights in JSON format.
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "insights": parsed_response,
                "generated_at": timezone.now()
            })
        
        except Exception as e:
            logger.error(f"Failed to generate AI insights: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to generate insights."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RouteOptimizationView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = RouteOptimization.objects.select_related('node')
        
        if self.request.user.user_type == 'node':
            queryset = queryset.filter(node__operator=self.request.user)
            
        return queryset
    
    def get(self, request):
        queryset = self.get_queryset()
        
        # Apply filters
        node_id = request.query_params.get('node')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if node_id:
            queryset = queryset.filter(node_id=node_id)
        if date_from:
            queryset = queryset.filter(optimization_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(optimization_date__lte=date_to)
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = RouteOptimizationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def post(self, request):
        serializer = RouteOptimizationSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Check permissions
            if request.user.user_type == 'node':
                node_id = serializer.validated_data['node'].id
                if not Node.objects.filter(id=node_id, operator=request.user).exists():
                    return Response(
                        {"error": "You can only create routes for your own node"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            route = serializer.save()
            return Response(
                RouteOptimizationSerializer(route).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RouteOptimizationGenerateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            if request.user.user_type != 'node':
                return Response(
                    {"error": "Only node operators can generate routes"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            node = get_object_or_404(Node, operator=request.user)
            
            # Get pending orders with delivery addresses
            pending_orders = Order.objects.filter(
                node=request.user,
                status__in=['confirmed', 'processing'],
                delivery_address__isnull=False
            ).select_related('retailer')
            
            if not pending_orders.exists():
                return Response(
                    {"error": "No pending orders with delivery addresses"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prepare data for AI
            order_data = [{
                'id': order.id,
                'retailer': order.retailer.name,
                'address': order.delivery_address,
                'latitude': float(order.retailer.latitude) if order.retailer.latitude else None,
                'longitude': float(order.retailer.longitude) if order.retailer.longitude else None,
                'items': order.items.count(),
                'weight': float(order.items.aggregate(Sum('quantity'))['quantity__sum'] or 0)
            } for order in pending_orders]
            
            prompt = f"""
            Optimize delivery routes for node {node.id} with these orders:
            {order_data}
            
            Provide optimized routes in JSON format.
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            optimized_routes = AIResponseParser.parse_to_json(response['content'])
            
            # Create route record
            route = RouteOptimization.objects.create(
                node=node,
                optimized_route=optimized_routes,
                estimated_savings=Decimal(optimized_routes.get('estimated_savings', 0)),
                route_distance=Decimal(optimized_routes.get('total_distance', 0))
            )
            
            return Response(
                RouteOptimizationSerializer(route).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Route optimization failed: {str(e)}")
            return Response(
                {"error": "Failed to generate optimized route"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class NodeMaintenanceLogView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self, node_id=None):
        queryset = NodeMaintenanceLog.objects.select_related('node', 'performed_by')
        
        if node_id:
            queryset = queryset.filter(node_id=node_id)
        elif self.request.user.user_type == 'node':
            node = get_object_or_404(Node, operator=self.request.user)
            queryset = queryset.filter(node=node)
            
        return queryset
    
    def get(self, request, node_id=None):
        queryset = self.get_queryset(node_id)
        
        # Apply filters
        maintenance_type = request.query_params.get('maintenance_type')
        resolved = request.query_params.get('resolved')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if maintenance_type:
            queryset = queryset.filter(maintenance_type__icontains=maintenance_type)
        if resolved is not None:
            resolved_bool = resolved.lower() == 'true'
            queryset = queryset.filter(resolved=resolved_bool)
        if date_from:
            queryset = queryset.filter(start_time__gte=date_from)
        if date_to:
            queryset = queryset.filter(start_time__lte=date_to)
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = NodeMaintenanceLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def post(self, request):
        serializer = NodeMaintenanceLogSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Check permissions
            if request.user.user_type == 'node':
                node_id = serializer.validated_data['node'].id
                if not Node.objects.filter(id=node_id, operator=request.user).exists():
                    return Response(
                        {"error": "You can only create logs for your own node"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Set performed_by to current user if not specified
            if 'performed_by' not in serializer.validated_data:
                serializer.validated_data['performed_by'] = request.user
            
            log = serializer.save()
            return Response(
                NodeMaintenanceLogSerializer(log).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NodeMaintenanceLogDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        log = get_object_or_404(
            NodeMaintenanceLog.objects.select_related('node', 'performed_by'),
            pk=pk
        )
        
        # Check permissions
        if self.request.user.user_type == 'node' and log.node.operator != self.request.user:
            raise PermissionDenied("You can only access logs for your own node")
            
        return log
    
    def get(self, request, pk):
        log = self.get_object(pk)
        serializer = NodeMaintenanceLogSerializer(log)
        return Response(serializer.data)
    
    def put(self, request, pk):
        log = self.get_object(pk)
        serializer = NodeMaintenanceLogSerializer(
            log, 
            data=request.data, 
            partial=False,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        if not request.user.is_admin:
            return Response(
                {"error": "Only admins can delete maintenance logs"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        log = self.get_object(pk)
        log.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)