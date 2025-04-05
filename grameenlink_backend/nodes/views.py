import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, F, Q
from datetime import timedelta, date
from django.utils import timezone
from django.shortcuts import get_object_or_404
import logging

from .models import Node, NodeInventory, NodePerformance, RouteOptimization
from .serializers import (
    NodeSerializer, NodeInventorySerializer,
    NodePerformanceSerializer, RouteOptimizationSerializer
)
from ai_integration.utils import GeminiAI, AIResponseParser
from marketplace.models import Order, RetailerDemand
from users.models import User

logger = logging.getLogger(__name__)

# Node Views
class NodeListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.user_type == 'node':
            nodes = Node.objects.filter(operator=user)
        else:
            nodes = Node.objects.all()
            
        # Handle filtering
        node_type = request.query_params.get('node_type')
        is_active = request.query_params.get('is_active')
        parent_node = request.query_params.get('parent_node')
        
        if node_type:
            nodes = nodes.filter(node_type=node_type)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            nodes = nodes.filter(is_active=is_active_bool)
        if parent_node:
            nodes = nodes.filter(parent_node=parent_node)
            
        serializer = NodeSerializer(nodes, many=True)
        return Response({
            "status": 200,
            "message": "Nodes retrieved successfully.",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = NodeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 201,
                "message": "Node created successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })

class NodeDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        user = self.request.user
        if user.user_type == 'node':
            return get_object_or_404(Node, id=pk, operator=user)
        return get_object_or_404(Node, id=pk)
    
    def get(self, request, pk):
        node = self.get_object(pk)
        serializer = NodeSerializer(node)
        return Response({
            "status": 200,
            "message": "Node retrieved successfully.",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        node = self.get_object(pk)
        serializer = NodeSerializer(node, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Node updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def patch(self, request, pk):
        node = self.get_object(pk)
        serializer = NodeSerializer(node, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Node partially updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def delete(self, request, pk):
        node = self.get_object(pk)
        node.delete()
        return Response({
            "status": 204,
            "message": "Node deleted successfully.",
            "data": None
        })

class NodePerformanceView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        user = self.request.user
        if user.user_type == 'node':
            return get_object_or_404(Node, id=pk, operator=user)
        return get_object_or_404(Node, id=pk)
    
    def get(self, request, pk):
        node = self.get_object(pk)
        performance = NodePerformance.objects.filter(node=node).order_by('-date')
        serializer = NodePerformanceSerializer(performance, many=True)
        return Response({
            "status": 200,
            "message": "Node performance retrieved successfully.",
            "data": serializer.data
        })

class NodeGenerateAIInsightsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        user = self.request.user
        if user.user_type == 'node':
            return get_object_or_404(Node, id=pk, operator=user)
        return get_object_or_404(Node, id=pk)
    
    def post(self, request, pk):
        node = self.get_object(pk)
        
        try:
            # Get relevant data for the node
            inventory = NodeInventory.objects.filter(node=node).values('product__name', 'quantity')
            performance = NodePerformance.objects.filter(node=node).order_by('-date')[:30]
            routes = RouteOptimization.objects.filter(node=node).order_by('-optimization_date')[:5]
            
            prompt = f"""
            Analyze this node's performance and provide actionable insights:
            
            Node Information:
            - Type: {node.node_type}
            - Coverage Area: {node.coverage_area}
            - Capacity: {node.capacity}
            
            Inventory Summary:
            {json.dumps(list(inventory), indent=2)}
            
            Performance Metrics (last 30 days):
            {json.dumps(list(performance.values()), indent=2)}
            
            Recent Route Optimizations:
            {json.dumps(list(routes.values('optimization_date', 'estimated_savings')), indent=2)}
            
            Provide insights in this JSON format:
            {{
                "performance_analysis": {{
                    "strengths": [],
                    "weaknesses": [],
                    "trends": []
                }},
                "inventory_recommendations": {{
                    "restock": [],
                    "reduce": [],
                    "new_products": []
                }},
                "route_optimization_suggestions": [],
                "general_recommendations": []
            }}
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "status": 200,
                "message": "AI insights generated successfully.",
                "data": {
                    'insights': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to generate AI insights: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to generate insights.",
                "data": {'error': str(e)}
            })

# Node Inventory Views
class NodeInventoryListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.user_type == 'node':
            inventory = NodeInventory.objects.filter(node__operator=user)
        else:
            inventory = NodeInventory.objects.all()
            
        # Handle filtering
        node_id = request.query_params.get('node')
        product_id = request.query_params.get('product')
        
        if node_id:
            inventory = inventory.filter(node_id=node_id)
        if product_id:
            inventory = inventory.filter(product_id=product_id)
            
        serializer = NodeInventorySerializer(inventory, many=True)
        return Response({
            "status": 200,
            "message": "Inventory items retrieved successfully.",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = NodeInventorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 201,
                "message": "Inventory item created successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })

class NodeInventoryDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        user = self.request.user
        if user.user_type == 'node':
            return get_object_or_404(NodeInventory, id=pk, node__operator=user)
        return get_object_or_404(NodeInventory, id=pk)
    
    def get(self, request, pk):
        inventory = self.get_object(pk)
        serializer = NodeInventorySerializer(inventory)
        return Response({
            "status": 200,
            "message": "Inventory item retrieved successfully.",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        inventory = self.get_object(pk)
        serializer = NodeInventorySerializer(inventory, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Inventory item updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def patch(self, request, pk):
        inventory = self.get_object(pk)
        serializer = NodeInventorySerializer(inventory, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Inventory item partially updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def delete(self, request, pk):
        inventory = self.get_object(pk)
        inventory.delete()
        return Response({
            "status": 204,
            "message": "Inventory item deleted successfully.",
            "data": None
        })

class NodeInventoryRestockRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            if user.user_type != 'node':
                return Response({
                    "status": 403,
                    "message": "Only nodes can generate restock recommendations.",
                    "data": None
                })

            node = Node.objects.get(operator=user)
            inventory = NodeInventory.objects.filter(node=node)

            # Convert Decimal values to float for JSON serialization
            inventory_data = [
                {'product__name': item.product.name, 'quantity': float(item.quantity)}
                for item in inventory
            ]

            demands = RetailerDemand.objects.filter(
                retailer__location=user.location,
                fulfilled=False,
                product__in=[item.product for item in inventory]
            )

            # Convert Decimal values to float for JSON serialization
            demands_data = [
                {
                    'product__name': demand.product.name,
                    'quantity': float(demand.quantity),
                    'retailer__name': demand.retailer.name
                }
                for demand in demands
            ]

            prompt = f"""
            Based on the following inventory and demand data, provide restock recommendations:

            Current Inventory:
            {json.dumps(inventory_data, indent=2)}

            Unfulfilled Demands:
            {json.dumps(demands_data, indent=2)}

            Provide recommendations in this format:
            {{
                "restock_recommendations": [
                    {{
                        "product": "Product Name",
                        "current_quantity": 100,
                        "recommended_quantity": 150,
                        "reason": "High demand from retailers"
                    }}
                ],
                "demand_analysis": "Summary of demand patterns"
            }}
            """

            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])

            return Response({
                "status": 200,
                "message": "Restock recommendations generated successfully.",
                "data": {
                    'recommendations': parsed_response,
                    'generated_at': response['timestamp']
                }
            })

        except Exception as e:
            logger.error(f"Failed to generate restock recommendations: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to generate recommendations.",
                "data": {'error': str(e)}
            })

# Node Performance Views
class NodePerformanceListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.user_type == 'node':
            performances = NodePerformance.objects.filter(node__operator=user)
        else:
            performances = NodePerformance.objects.all()
            
        # Handle filtering
        node_id = request.query_params.get('node')
        date_param = request.query_params.get('date')
        
        if node_id:
            performances = performances.filter(node_id=node_id)
        if date_param:
            performances = performances.filter(date=date_param)
            
        serializer = NodePerformanceSerializer(performances, many=True)
        return Response({
            "status": 200,
            "message": "Performance data retrieved successfully.",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = NodePerformanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 201,
                "message": "Performance data created successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })

class NodePerformanceDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        user = self.request.user
        if user.user_type == 'node':
            return get_object_or_404(NodePerformance, id=pk, node__operator=user)
        return get_object_or_404(NodePerformance, id=pk)
    
    def get(self, request, pk):
        performance = self.get_object(pk)
        serializer = NodePerformanceSerializer(performance)
        return Response({
            "status": 200,
            "message": "Performance data retrieved successfully.",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        performance = self.get_object(pk)
        serializer = NodePerformanceSerializer(performance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Performance data updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def patch(self, request, pk):
        performance = self.get_object(pk)
        serializer = NodePerformanceSerializer(performance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Performance data partially updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def delete(self, request, pk):
        performance = self.get_object(pk)
        performance.delete()
        return Response({
            "status": 204,
            "message": "Performance data deleted successfully.",
            "data": None
        })

class NodePerformanceTrendsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            if user.user_type != 'node':
                node_id = request.query_params.get('node_id')
                if not node_id:
                    return Response({
                        "status": 400,
                        "message": "node_id parameter required for non-node users.",
                        "data": None
                    })
                queryset = NodePerformance.objects.filter(node_id=node_id)
            else:
                node = Node.objects.get(operator=user)
                queryset = NodePerformance.objects.filter(node=node)
            
            # Get last 90 days performance
            ninety_days_ago = timezone.now() - timedelta(days=90)
            performance_data = queryset.filter(date__gte=ninety_days_ago).order_by('date')
            
            prompt = f"""
            Analyze the following node performance data and identify trends:
            
            Performance Data (last 90 days):
            {json.dumps(list(performance_data.values('date', 'orders_processed', 'revenue_generated', 'retailers_served')), indent=2)}
            
            Provide analysis in this format:
            {{
                "trends": [
                    {{
                        "metric": "orders_processed",
                        "trend": "increasing",
                        "rate": "10% weekly growth",
                        "confidence": "high"
                    }}
                ],
                "anomalies": [
                    {{
                        "date": "2023-10-15",
                        "metric": "revenue_generated",
                        "deviation": "30% below expected",
                        "possible_reasons": []
                    }}
                ],
                "forecast": {{
                    "next_30_days": {{
                        "expected_orders": 0,
                        "expected_revenue": 0
                    }}
                }},
                "recommendations": []
            }}
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "status": 200,
                "message": "Performance trends analysis generated successfully.",
                "data": {
                    'analysis': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to analyze performance trends: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to analyze trends.",
                "data": {'error': str(e)}
            })

# Route Optimization Views
class RouteOptimizationListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.user_type == 'node':
            routes = RouteOptimization.objects.filter(node__operator=user)
        else:
            routes = RouteOptimization.objects.all()
            
        # Handle filtering
        node_id = request.query_params.get('node')
        if node_id:
            routes = routes.filter(node_id=node_id)
            
        serializer = RouteOptimizationSerializer(routes, many=True)
        return Response({
            "status": 200,
            "message": "Route optimizations retrieved successfully.",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = RouteOptimizationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 201,
                "message": "Route optimization created successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })

class RouteOptimizationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        user = self.request.user
        if user.user_type == 'node':
            return get_object_or_404(RouteOptimization, id=pk, node__operator=user)
        return get_object_or_404(RouteOptimization, id=pk)
    
    def get(self, request, pk):
        route = self.get_object(pk)
        serializer = RouteOptimizationSerializer(route)
        return Response({
            "status": 200,
            "message": "Route optimization retrieved successfully.",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        route = self.get_object(pk)
        serializer = RouteOptimizationSerializer(route, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Route optimization updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def patch(self, request, pk):
        route = self.get_object(pk)
        serializer = RouteOptimizationSerializer(route, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Route optimization partially updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def delete(self, request, pk):
        route = self.get_object(pk)
        route.delete()
        return Response({
            "status": 204,
            "message": "Route optimization deleted successfully.",
            "data": None
        })

class RouteOptimizationGenerateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            if user.user_type != 'node':
                return Response({
                    "status": 403,
                    "message": "Only nodes can generate route optimizations.",
                    "data": None
                })

            # Get the node associated with this user
            try:
                node = Node.objects.get(operator=user)
            except Node.DoesNotExist:
                return Response({
                    "status": 404,
                    "message": "No node found for this operator.",
                    "data": None
                })

            # Filter orders by node
            pending_orders = Order.objects.filter(
                node=node,
                status__in=['confirmed', 'processing']
            ).select_related('retailer')

            if not pending_orders.exists():
                return Response({
                    "status": 400,
                    "message": "No pending orders to optimize routes for.",
                    "data": None
                })

            order_data = []
            for order in pending_orders:
                total_weight = sum(float(item.quantity) for item in order.items.all())
                order_data.append({
                    'order_id': order.id,
                    'retailer': order.retailer.name,
                    'delivery_address': order.delivery_address,
                    'delivery_date': order.delivery_date.isoformat() if order.delivery_date else None,
                    'total_items': order.items.count(),
                    'total_weight': total_weight
                })

            prompt = f"""
            Optimize delivery routes for the following orders from node {node.operator.name}:

            Node Location: {node.coverage_area}
            Current Date: {date.today().isoformat()}

            Orders to Deliver:
            {json.dumps(order_data, indent=2)}

            Provide optimized routes in this format:
            {{
                "optimized_routes": [
                    {{
                        "route_id": 1,
                        "orders": [101, 102, 103],
                        "estimated_distance": "15 km",
                        "estimated_time": "2.5 hours",
                        "sequence": ["Retailer A", "Retailer B", "Retailer C"],
                        "estimated_savings": {{
                            "distance": "20% reduction",
                            "time": "1.5 hours saved"
                        }}
                    }}
                ],
                "total_savings": {{
                    "distance": "X km saved",
                    "time": "Y hours saved"
                }},
                "implementation_notes": "Any special instructions"
            }}
            """

            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])

            if 'optimized_routes' in parsed_response:
                time_savings_str = parsed_response.get('total_savings', {}).get('time', '0 hours')
                try:
                    time_savings_numeric = float(''.join(c for c in time_savings_str if c.isdigit() or c == '.'))
                except ValueError:
                    time_savings_numeric = 0.0

                route = RouteOptimization.objects.create(
                    node=node,
                    optimized_route=parsed_response,
                    estimated_savings=time_savings_numeric
                )
                serializer = RouteOptimizationSerializer(route)

                return Response({
                    "status": 200,
                    "message": "Route optimization generated successfully.",
                    "data": {
                        'optimized_route': serializer.data,
                        'ai_response': parsed_response,
                        'generated_at': response['timestamp']
                    }
                })

            return Response({
                "status": 500,
                "message": "Invalid route optimization response from AI.",
                "data": None
            })

        except Exception as e:
            logger.error(f"Failed to generate optimized route: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to optimize route.",
                "data": {'error': str(e)}
            })