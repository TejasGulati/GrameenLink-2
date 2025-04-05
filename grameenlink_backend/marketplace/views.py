from decimal import Decimal
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
import json

from .models import ProductCategory, Product, Order, OrderItem, RetailerDemand
from .serializers import (
    ProductCategorySerializer, ProductSerializer,
    OrderSerializer, RetailerDemandSerializer
)
from ai_integration.utils import GeminiAI, AIResponseParser
from users.models import User
from nodes.models import Node

logger = logging.getLogger(__name__)

# Product Category Views
class ProductCategoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        categories = ProductCategory.objects.all()
        
        # Handle search if provided
        search = request.query_params.get('search', None)
        if search:
            categories = categories.filter(name__icontains=search)
            
        serializer = ProductCategorySerializer(categories, many=True)
        return Response({
            "status": 200,
            "message": "Categories retrieved successfully.",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = ProductCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 201,
                "message": "Category created successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })

class ProductCategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(ProductCategory, pk=pk)
    
    def get(self, request, pk):
        category = self.get_object(pk)
        serializer = ProductCategorySerializer(category)
        return Response({
            "status": 200,
            "message": "Category retrieved successfully.",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        category = self.get_object(pk)
        serializer = ProductCategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Category updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def delete(self, request, pk):
        category = self.get_object(pk)
        category.delete()
        return Response({
            "status": 204,
            "message": "Category deleted successfully.",
            "data": None
        })

class ProductCategoryInsightsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(ProductCategory, pk=pk)
    
    def post(self, request, pk):
        category = self.get_object(pk)
        products = Product.objects.filter(category=category)
        orders = OrderItem.objects.filter(product__category=category)
        
        prompt = f"""
        Analyze market trends for product category: {category.name}
        
        Products in this category:
        {json.dumps(list(products.values('name', 'price_per_unit', 'available_quantity')), indent=2)}
        
        Recent orders:
        {json.dumps(list(orders.values('product__name', 'quantity', 'order__order_date')), indent=2)}
        
        Provide insights in this format:
        {{
            "category_performance": {{
                "popularity": "high/medium/low",
                "price_trend": "increasing/stable/decreasing",
                "demand_patterns": []
            }},
            "product_recommendations": [
                {{
                    "action": "increase_price/reduce_price/promote",
                    "product": "Product Name",
                    "reason": "High demand but low stock"
                }}
            ],
            "new_product_opportunities": []
        }}
        """
        
        try:
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "status": 200,
                "message": "Category insights generated successfully.",
                "data": {
                    'insights': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to generate category insights: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to generate insights.",
                "data": {'error': str(e)}
            })

# Product Views
class ProductView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Filter products based on user type
        if user.user_type == 'distributor':
            products = Product.objects.filter(distributor=user)
        else:
            products = Product.objects.all()
        
        # Apply filters if provided
        category = request.query_params.get('category', None)
        if category:
            products = products.filter(category__id=category)
            
        distributor = request.query_params.get('distributor', None)
        if distributor:
            products = products.filter(distributor__id=distributor)
            
        # Apply search if provided
        search = request.query_params.get('search', None)
        if search:
            products = products.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
            
        serializer = ProductSerializer(products, many=True)
        return Response({
            "status": 200,
            "message": "Products retrieved successfully.",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 201,
                "message": "Product created successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })

class ProductDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(Product, pk=pk)
    
    def get(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductSerializer(product)
        return Response({
            "status": 200,
            "message": "Product retrieved successfully.",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Product updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def delete(self, request, pk):
        product = self.get_object(pk)
        product.delete()
        return Response({
            "status": 204,
            "message": "Product deleted successfully.",
            "data": None
        })

class ProductDescriptionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(Product, pk=pk)
    
    def post(self, request, pk):
        product = self.get_object(pk)
        
        prompt = f"""
        Generate a compelling product description for:
        
        Product Name: {product.name}
        Category: {product.category.name if product.category else 'N/A'}
        Current Description: {product.description or 'None'}
        Price: {product.price_per_unit} per {product.unit}
        
        Key Features:
        - Minimum order: {product.min_order_quantity} {product.unit}
        - Available quantity: {product.available_quantity} {product.unit}
        
        Target audience: Small retailers in {product.distributor.location if product.distributor.location else 'various locations'}
        
        Generate 3 versions of the description:
        1. Concise (1-2 sentences)
        2. Detailed (paragraph with features and benefits)
        3. Marketing (persuasive with call-to-action)
        
        Format the response as JSON:
        {{
            "descriptions": {{
                "concise": "",
                "detailed": "",
                "marketing": ""
            }},
            "keywords": ["list", "of", "relevant", "keywords"],
            "seo_tips": "Suggestions for better online visibility"
        }}
        """
        
        try:
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "status": 200,
                "message": "Product descriptions generated successfully.",
                "data": {
                    'descriptions': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to generate product description: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to generate description.",
                "data": {'error': str(e)}
            })

class PricingRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            if user.user_type != 'distributor':
                return Response({
                    "status": 403,
                    "message": "Only distributors can generate pricing recommendations.",
                    "data": None
                })
            
            products = Product.objects.filter(distributor=user)
            product_data = []
            
            for product in products:
                demand = RetailerDemand.objects.filter(product=product, fulfilled=False).aggregate(
                    total_demand=Sum('quantity')
                )['total_demand'] or 0
                
                sales = OrderItem.objects.filter(product=product).aggregate(
                    total_sold=Sum('quantity')
                )['total_sold'] or 0
                
                cost_price = product.price_per_unit * Decimal('0.7')
                
                product_data.append({
                    'product_id': product.id,
                    'name': product.name,
                    'current_price': float(product.price_per_unit),
                    'cost_price': float(cost_price),
                    'available_quantity': float(product.available_quantity),
                    'pending_demand': float(demand),
                    'total_sold': float(sales),
                    'competitors': []  # Would be populated with real data
                })
            
            prompt = f"""
            Analyze the following product pricing data and provide recommendations:
            
            Products:
            {json.dumps(product_data, indent=2)}
            
            Market Conditions:
            - Current season: {date.today().strftime('%B')}
            - Economic factors: stable (would be dynamic in production)
            
            Provide recommendations in this format:
            {{
                "recommendations": [
                    {{
                        "product_id": 1,
                        "product_name": "Product A",
                        "current_price": 100,
                        "recommended_price": 105,
                        "change": "+5%",
                        "reason": "High demand and low inventory",
                        "expected_impact": "10-15% revenue increase"
                    }}
                ],
                "market_analysis": "Summary of pricing trends",
                "risk_assessment": "Potential risks of price changes"
            }}
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "status": 200,
                "message": "Pricing recommendations generated successfully.",
                "data": {
                    'recommendations': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to generate pricing recommendations: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to generate recommendations.",
                "data": {'error': str(e)}
            })

# Order Views
class OrderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Filter orders based on user type
        if user.user_type == 'retailer':
            orders = Order.objects.filter(retailer=user)
        elif user.user_type == 'node':
            orders = Order.objects.filter(node=user)
        elif user.user_type == 'distributor':
            orders = Order.objects.filter(items__product__distributor=user).distinct()
        else:
            orders = Order.objects.all()
        
        # Apply filters if provided
        status_filter = request.query_params.get('status', None)
        if status_filter:
            orders = orders.filter(status=status_filter)
            
        retailer = request.query_params.get('retailer', None)
        if retailer:
            orders = orders.filter(retailer__id=retailer)
            
        node = request.query_params.get('node', None)
        if node:
            orders = orders.filter(node__id=node)
            
        serializer = OrderSerializer(orders, many=True)
        return Response({
            "status": 200,
            "message": "Orders retrieved successfully.",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.user_type == 'retailer':
                serializer.save(retailer=request.user)
            else:
                serializer.save()
            return Response({
                "status": 201,
                "message": "Order created successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })

class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        user = self.request.user
        
        # Get order and check permissions based on user type
        if user.user_type == 'retailer':
            return get_object_or_404(Order, pk=pk, retailer=user)
        elif user.user_type == 'node':
            return get_object_or_404(Order, pk=pk, node=user)
        elif user.user_type == 'distributor':
            # For distributors, check if they have products in this order
            order = get_object_or_404(Order, pk=pk)
            if not OrderItem.objects.filter(order=order, product__distributor=user).exists():
                raise order.DoesNotExist("Order not found or you don't have permission to view it.")
            return order
        else:
            return get_object_or_404(Order, pk=pk)
    
    def get(self, request, pk):
        order = self.get_object(pk)
        serializer = OrderSerializer(order)
        return Response({
            "status": 200,
            "message": "Order retrieved successfully.",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        order = self.get_object(pk)
        serializer = OrderSerializer(order, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Order updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def delete(self, request, pk):
        order = self.get_object(pk)
        order.delete()
        return Response({
            "status": 204,
            "message": "Order deleted successfully.",
            "data": None
        })

class OrderSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        user = self.request.user
        
        # Similar permission checks as OrderDetailView
        if user.user_type == 'retailer':
            return get_object_or_404(Order, pk=pk, retailer=user)
        elif user.user_type == 'node':
            return get_object_or_404(Order, pk=pk, node=user)
        elif user.user_type == 'distributor':
            order = get_object_or_404(Order, pk=pk)
            if not OrderItem.objects.filter(order=order, product__distributor=user).exists():
                raise order.DoesNotExist("Order not found or you don't have permission to view it.")
            return order
        else:
            return get_object_or_404(Order, pk=pk)
    
    def post(self, request, pk):
        try:
            order = self.get_object(pk)
            items = order.items.all()
            
            # Convert Decimal values to float for JSON serialization
            items_data = [
                {
                    'product_name': item.product.name,
                    'quantity': float(item.quantity),
                    'unit_price': float(item.unit_price),
                    'total_price': float(item.total_price),
                }
                for item in items
            ]
            
            prompt = f"""
            Generate a comprehensive order summary for order #{order.id}:
            
            Order Details:
            - Retailer: {order.retailer.name}
            - Order Date: {order.order_date}
            - Status: {order.status}
            - Total Amount: {float(order.total_amount)}
            
            Items Ordered:
            {json.dumps(items_data, indent=2)}
            
            Generate the following:
            1. A professional order summary (1 paragraph)
            2. Key highlights (bulleted list)
            3. Next steps based on order status
            4. Potential upsell/cross-sell opportunities
            
            Format as JSON:
            {{
                "summary": "Professional summary paragraph",
                "highlights": ["list", "of", "key", "points"],
                "next_steps": {{
                    "retailer": ["steps", "for", "retailer"],
                    "node": ["steps", "for", "node"],
                    "distributor": ["steps", "for", "distributor"]
                }},
                "upsell_opportunities": [
                    {{
                        "product": "Product Name",
                        "reason": "Frequently bought together"
                    }}
                ]
            }}
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "status": 200,
                "message": "Order summary generated successfully.",
                "data": {
                    'summary': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
        
        except Exception as e:
            logger.error(f"Failed to generate order summary: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to generate summary.",
                "data": {'error': str(e)}
            })

# Retailer Demand Views
class RetailerDemandView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Filter demands based on user type
        if user.user_type == 'retailer':
            demands = RetailerDemand.objects.filter(retailer=user)
        elif user.user_type == 'node':
            demands = RetailerDemand.objects.filter(retailer__location=user.location)
        else:
            demands = RetailerDemand.objects.all()
        
        # Apply filters if provided
        retailer = request.query_params.get('retailer', None)
        if retailer:
            demands = demands.filter(retailer__id=retailer)
            
        product = request.query_params.get('product', None)
        if product:
            demands = demands.filter(product__id=product)
            
        fulfilled = request.query_params.get('fulfilled', None)
        if fulfilled is not None:
            fulfilled_bool = fulfilled.lower() == 'true'
            demands = demands.filter(fulfilled=fulfilled_bool)
            
        serializer = RetailerDemandSerializer(demands, many=True)
        return Response({
            "status": 200,
            "message": "Demands retrieved successfully.",
            "data": serializer.data
        })
    
    def post(self, request):
        serializer = RetailerDemandSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.user_type == 'retailer':
                serializer.save(retailer=request.user)
            else:
                serializer.save()
            return Response({
                "status": 201,
                "message": "Demand created successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })

class RetailerDemandDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        user = self.request.user
        
        # Get demand and check permissions based on user type
        if user.user_type == 'retailer':
            return get_object_or_404(RetailerDemand, pk=pk, retailer=user)
        elif user.user_type == 'node':
            return get_object_or_404(RetailerDemand, pk=pk, retailer__location=user.location)
        else:
            return get_object_or_404(RetailerDemand, pk=pk)
    
    def get(self, request, pk):
        demand = self.get_object(pk)
        serializer = RetailerDemandSerializer(demand)
        return Response({
            "status": 200,
            "message": "Demand retrieved successfully.",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        demand = self.get_object(pk)
        serializer = RetailerDemandSerializer(demand, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "Demand updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
    def delete(self, request, pk):
        demand = self.get_object(pk)
        demand.delete()
        return Response({
            "status": 204,
            "message": "Demand deleted successfully.",
            "data": None
        })

class FutureDemandPredictionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            if user.user_type not in ['retailer', 'node']:
                return Response({
                    "status": 403,
                    "message": "Only retailers and nodes can predict demand.",
                    "data": None
                })
            
            if user.user_type == 'retailer':
                # Get products from order items for this retailer
                products = Product.objects.filter(
                    orderitem__order__retailer=user
                ).distinct().values_list('id', 'name')
                historical_demand = RetailerDemand.objects.filter(retailer=user)
            else:
                # Get products from order items for this node
                products = Product.objects.filter(
                    orderitem__order__node=user
                ).distinct().values_list('id', 'name')
                historical_demand = RetailerDemand.objects.filter(retailer__location=user.location)
            
            demand_data = []
            for product_id, product_name in products:
                demand = historical_demand.filter(product_id=product_id).values('recorded_at').annotate(
                    total_demand=Sum('quantity')
                ).order_by('recorded_at')
                
                if demand:
                    demand_data.append({
                        'product_id': product_id,
                        'product_name': product_name,
                        'demand_history': [
                            {
                                'date': entry['recorded_at'].strftime('%Y-%m-%d'),
                                'demand': float(entry['total_demand'])  # Convert Decimal to float
                            }
                            for entry in demand
                        ]
                    })
            
            prompt = f"""
            Predict future demand based on this historical data:
            
            Products and Demand History:
            {json.dumps(demand_data, indent=2)}
            
            Current Factors:
            - Season: {date.today().strftime('%B')}
            - Market Conditions: stable
            
            Provide predictions for next 30 days in this format:
            {{
                "predictions": [
                    {{
                        "product_id": 1,
                        "product_name": "Product A",
                        "current_demand": 100,
                        "predicted_demand": 120,
                        "change": "+20%",
                        "confidence": "high",
                        "recommended_actions": ["increase stock", "promote to retailers"]
                    }}
                ],
                "methodology": "Brief explanation of prediction method",
                "risk_factors": ["list of factors that could affect accuracy"]
            }}
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "status": 200,
                "message": "Future demand predictions generated successfully.",
                "data": {
                    'predictions': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
        
        except Exception as e:
            logger.error(f"Failed to predict future demand: {str(e)}")
            return Response({
                "status": 500,
                "message": "Failed to predict demand.",
                "data": {'error': str(e)}
            })