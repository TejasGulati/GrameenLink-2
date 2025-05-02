from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, Avg, F
from datetime import timedelta, date
from django.utils import timezone
from django.shortcuts import get_object_or_404
import logging
import json
from decimal import Decimal
from django.core.exceptions import PermissionDenied


from .models import (
    ProductCategory, Product, Order, 
    OrderItem, RetailerDemand,
    ProductPriceHistory, ProductReview
)
from .serializers import (
    ProductCategorySerializer, ProductSerializer,
    OrderSerializer, RetailerDemandSerializer,
    ProductPriceHistorySerializer, ProductReviewSerializer
)
from ai_integration.utils import GeminiAI, AIResponseParser
from users.models import User
from nodes.models import Node, NodeInventory
from rest_framework.pagination import PageNumberPagination

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductCategoryView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        queryset = ProductCategory.objects.all().order_by('name')
        
        # Search functionality
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ProductCategorySerializer(page, many=True)
        
        return paginator.get_paginated_response({
            "status": "success",
            "message": "Categories retrieved successfully",
            "data": serializer.data
        })
    
    def post(self, request):
        if request.user.user_type != 'admin':
            return Response({
                "status": "error",
                "message": "Only admins can create product categories",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "Category created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ProductCategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(ProductCategory, pk=pk)
    
    def get(self, request, pk):
        category = self.get_object(pk)
        serializer = ProductCategorySerializer(category)
        return Response({
            "status": "success",
            "message": "Category retrieved successfully",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        if request.user.user_type != 'admin':
            return Response({
                "status": "error",
                "message": "Only admins can update product categories",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        category = self.get_object(pk)
        serializer = ProductCategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "Category updated successfully",
                "data": serializer.data
            })
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        if request.user.user_type != 'admin':
            return Response({
                "status": "error",
                "message": "Only admins can delete product categories",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        category = self.get_object(pk)
        category.delete()
        return Response({
            "status": "success",
            "message": "Category deleted successfully",
            "data": None
        }, status=status.HTTP_204_NO_CONTENT)

class ProductView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        user = request.user
        queryset = Product.objects.filter(is_active=True).order_by('-created_at')
        
        # Filter based on user type
        if user.user_type == 'distributor':
            queryset = queryset.filter(distributor=user)
        
        # Apply filters
        category_id = request.query_params.get('category_id')
        distributor_id = request.query_params.get('distributor_id')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        search = request.query_params.get('search')
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if distributor_id:
            queryset = queryset.filter(distributor_id=distributor_id)
        if min_price:
            queryset = queryset.filter(price_per_unit__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_unit__lte=max_price)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(tags__contains=[search])
            )
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ProductSerializer(page, many=True)
        
        return paginator.get_paginated_response({
            "status": "success",
            "message": "Products retrieved successfully",
            "data": serializer.data
        })
    
    def post(self, request):
        if request.user.user_type != 'distributor':
            return Response({
                "status": "error",
                "message": "Only distributors can add products",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(distributor=request.user)
            return Response({
                "status": "success",
                "message": "Product created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(Product, pk=pk)
    
    def get(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductSerializer(product)
        return Response({
            "status": "success",
            "message": "Product retrieved successfully",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        product = self.get_object(pk)
        
        # Check permissions
        if request.user.user_type != 'distributor' or product.distributor != request.user:
            return Response({
                "status": "error",
                "message": "You can only update your own products",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        old_price = product.price_per_unit
        serializer = ProductSerializer(product, data=request.data)
        
        if serializer.is_valid():
            new_price = serializer.validated_data.get('price_per_unit', old_price)
            
            # Save the product first
            product = serializer.save()
            
            # Record price change if different
            if new_price != old_price:
                ProductPriceHistory.objects.create(
                    product=product,
                    old_price=old_price,
                    new_price=new_price,
                    changed_by=request.user,
                    reason=request.data.get('price_change_reason', '')
                )
            
            return Response({
                "status": "success",
                "message": "Product updated successfully",
                "data": serializer.data
            })
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        product = self.get_object(pk)
        
        # Check permissions
        if request.user.user_type != 'distributor' or product.distributor != request.user:
            return Response({
                "status": "error",
                "message": "You can only delete your own products",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Soft delete by marking as inactive
        product.is_active = False
        product.save()
        
        return Response({
            "status": "success",
            "message": "Product deactivated successfully",
            "data": None
        }, status=status.HTTP_204_NO_CONTENT)

class OrderView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        user = request.user
        queryset = Order.objects.all().order_by('-order_date')
        
        # Filter based on user type
        if user.user_type == 'retailer':
            queryset = queryset.filter(retailer=user)
        elif user.user_type == 'node':
            queryset = queryset.filter(node=user)
        elif user.user_type == 'distributor':
            # Get orders containing products from this distributor
            product_ids = Product.objects.filter(distributor=user).values_list('id', flat=True)
            order_ids = OrderItem.objects.filter(product_id__in=product_ids).values_list('order_id', flat=True)
            queryset = queryset.filter(id__in=order_ids)
        
        # Apply filters
        status_filter = request.query_params.get('status')
        payment_status = request.query_params.get('payment_status')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if date_from:
            queryset = queryset.filter(order_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(order_date__lte=date_to)
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = OrderSerializer(page, many=True)
        
        return paginator.get_paginated_response({
            "status": "success",
            "message": "Orders retrieved successfully",
            "data": serializer.data
        })
    
    def post(self, request):
        if request.user.user_type != 'retailer':
            return Response({
                "status": "error",
                "message": "Only retailers can create orders",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            # Ensure all items belong to active products
            items_data = serializer.validated_data.get('items', [])
            for item in items_data:
                if not item['product'].is_active:
                    return Response({
                        "status": "error",
                        "message": f"Product {item['product'].name} is not available",
                        "data": None
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create the order
            order = serializer.save(retailer=request.user)
            
            return Response({
                "status": "success",
                "message": "Order created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        order = get_object_or_404(Order, pk=pk)
        
        # Check permissions based on user type
        if user.user_type == 'retailer' and order.retailer != user:
            raise PermissionDenied("You can only view your own orders")
        
        if user.user_type == 'node' and order.node != user:
            raise PermissionDenied("You can only view orders assigned to your node")
        
        if user.user_type == 'distributor':
            # Check if any items in the order belong to this distributor
            if not order.items.filter(product__distributor=user).exists():
                raise PermissionDenied("This order doesn't contain your products")
        
        return order
    
    def get(self, request, pk):
        order = self.get_object(pk, request.user)
        serializer = OrderSerializer(order)
        return Response({
            "status": "success",
            "message": "Order retrieved successfully",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        order = self.get_object(pk, request.user)
        
        # Check if user can modify this order
        if request.user.user_type != 'retailer' or order.retailer != request.user:
            return Response({
                "status": "error",
                "message": "You can only modify your own orders",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        if order.status not in ['pending', 'confirmed']:
            return Response({
                "status": "error",
                "message": "Cannot modify order in its current status",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = OrderSerializer(order, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "Order updated successfully",
                "data": serializer.data
            })
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        order = self.get_object(pk, request.user)
        
        # Check if user can cancel this order
        if request.user.user_type != 'retailer' or order.retailer != request.user:
            return Response({
                "status": "error",
                "message": "You can only cancel your own orders",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        if order.status not in ['pending', 'confirmed']:
            return Response({
                "status": "error",
                "message": "Cannot cancel order in its current status",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'cancelled'
        order.save()
        
        return Response({
            "status": "success",
            "message": "Order cancelled successfully",
            "data": None
        }, status=status.HTTP_200_OK)

class RetailerDemandView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        user = request.user
        queryset = RetailerDemand.objects.all().order_by('-recorded_at')
        
        # Filter based on user type
        if user.user_type == 'retailer':
            queryset = queryset.filter(retailer=user)
        elif user.user_type == 'node':
            # Get demands from retailers in this node's coverage area
            retailer_ids = User.objects.filter(
                user_type='retailer',
                location=user.location
            ).values_list('id', flat=True)
            queryset = queryset.filter(retailer_id__in=retailer_ids)
        elif user.user_type == 'distributor':
            # Get demands for products from this distributor
            product_ids = Product.objects.filter(distributor=user).values_list('id', flat=True)
            queryset = queryset.filter(product_id__in=product_ids)
        
        # Apply filters
        product_id = request.query_params.get('product_id')
        retailer_id = request.query_params.get('retailer_id')
        fulfilled = request.query_params.get('fulfilled')
        priority = request.query_params.get('priority')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        if retailer_id:
            queryset = queryset.filter(retailer_id=retailer_id)
        if fulfilled is not None:
            fulfilled_bool = fulfilled.lower() == 'true'
            queryset = queryset.filter(fulfilled=fulfilled_bool)
        if priority:
            queryset = queryset.filter(priority=priority)
        if date_from:
            queryset = queryset.filter(recorded_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(recorded_at__lte=date_to)
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = RetailerDemandSerializer(page, many=True)
        
        return paginator.get_paginated_response({
            "status": "success",
            "message": "Demands retrieved successfully",
            "data": serializer.data
        })
    
    def post(self, request):
        if request.user.user_type != 'retailer':
            return Response({
                "status": "error",
                "message": "Only retailers can create demands",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = RetailerDemandSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.validated_data['product']
            
            if not product.is_active:
                return Response({
                    "status": "error",
                    "message": "This product is not currently available",
                    "data": None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save(retailer=request.user)
            return Response({
                "status": "success",
                "message": "Demand created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class RetailerDemandDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        demand = get_object_or_404(RetailerDemand, pk=pk)
        
        # Check permissions based on user type
        if user.user_type == 'retailer' and demand.retailer != user:
            raise PermissionDenied("You can only view your own demands")
        
        if user.user_type == 'node':
            # Check if demand is from a retailer in this node's coverage area
            if demand.retailer.location != user.location:
                raise PermissionDenied("This demand is not in your coverage area")
        
        if user.user_type == 'distributor' and demand.product.distributor != user:
            raise PermissionDenied("This demand is not for your product")
        
        return demand
    
    def get(self, request, pk):
        demand = self.get_object(pk, request.user)
        serializer = RetailerDemandSerializer(demand)
        return Response({
            "status": "success",
            "message": "Demand retrieved successfully",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        demand = self.get_object(pk, request.user)
        
        # Check if user can modify this demand
        if request.user.user_type != 'retailer' or demand.retailer != request.user:
            return Response({
                "status": "error",
                "message": "You can only modify your own demands",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        if demand.fulfilled:
            return Response({
                "status": "error",
                "message": "Cannot modify a fulfilled demand",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RetailerDemandSerializer(demand, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "Demand updated successfully",
                "data": serializer.data
            })
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        demand = self.get_object(pk, request.user)
        
        # Check if user can delete this demand
        if request.user.user_type != 'retailer' or demand.retailer != request.user:
            return Response({
                "status": "error",
                "message": "You can only delete your own demands",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        if demand.fulfilled:
            return Response({
                "status": "error",
                "message": "Cannot delete a fulfilled demand",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        demand.delete()
        return Response({
            "status": "success",
            "message": "Demand deleted successfully",
            "data": None
        }, status=status.HTTP_204_NO_CONTENT)

class FulfillDemandView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        if request.user.user_type != 'node':
            return Response({
                "status": "error",
                "message": "Only nodes can fulfill demands",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        demand = get_object_or_404(RetailerDemand, pk=pk)
        
        # Check if demand is in node's coverage area
        if demand.retailer.location != request.user.location:
            return Response({
                "status": "error",
                "message": "This demand is not in your coverage area",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        if demand.fulfilled:
            return Response({
                "status": "error",
                "message": "This demand has already been fulfilled",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check inventory
        node = Node.objects.get(operator=request.user)
        inventory = NodeInventory.objects.filter(
            node=node,
            product=demand.product
        ).first()
        
        if not inventory or inventory.quantity < demand.quantity:
            return Response({
                "status": "error",
                "message": "Insufficient inventory to fulfill this demand",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update inventory
        inventory.quantity -= demand.quantity
        inventory.save()
        
        # Mark demand as fulfilled
        demand.fulfilled = True
        demand.fulfilled_at = timezone.now()
        demand.fulfilled_by = request.user
        demand.save()
        
        serializer = RetailerDemandSerializer(demand)
        return Response({
            "status": "success",
            "message": "Demand fulfilled successfully",
            "data": serializer.data
        })

class ProductReviewView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request, product_id=None):
        if product_id:
            # Get reviews for a specific product
            product = get_object_or_404(Product, pk=product_id)
            queryset = ProductReview.objects.filter(product=product, is_approved=True)
        else:
            # Get all approved reviews
            queryset = ProductReview.objects.filter(is_approved=True)
        
        # Filter by rating if provided
        min_rating = request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ProductReviewSerializer(page, many=True)
        
        return paginator.get_paginated_response({
            "status": "success",
            "message": "Reviews retrieved successfully",
            "data": serializer.data
        })
    
    def post(self, request, product_id):
        if request.user.user_type != 'retailer':
            return Response({
                "status": "error",
                "message": "Only retailers can submit reviews",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        product = get_object_or_404(Product, pk=product_id)
        
        # Check if retailer has ordered this product
        has_ordered = OrderItem.objects.filter(
            order__retailer=request.user,
            product=product
        ).exists()
        
        if not has_ordered:
            return Response({
                "status": "error",
                "message": "You can only review products you've ordered",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check for existing review
        existing_review = ProductReview.objects.filter(
            product=product,
            retailer=request.user
        ).first()
        
        if existing_review:
            return Response({
                "status": "error",
                "message": "You have already reviewed this product",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ProductReviewSerializer(data=request.data)
        if serializer.is_valid():
            # For distributors' products, require admin approval
            is_approved = product.distributor.user_type != 'distributor'
            
            serializer.save(
                product=product,
                retailer=request.user,
                is_approved=is_approved
            )
            
            return Response({
                "status": "success",
                "message": "Review submitted successfully" + (" (pending approval)" if not is_approved else ""),
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ProductReviewDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        review = get_object_or_404(ProductReview, pk=pk)
        
        # Check permissions
        if not review.is_approved and review.retailer != user and user.user_type != 'admin':
            raise PermissionDenied("You don't have permission to view this review")
        
        return review
    
    def get(self, request, pk):
        review = self.get_object(pk, request.user)
        serializer = ProductReviewSerializer(review)
        return Response({
            "status": "success",
            "message": "Review retrieved successfully",
            "data": serializer.data
        })
    
    def put(self, request, pk):
        review = self.get_object(pk, request.user)
        
        # Check if user can modify this review
        if review.retailer != request.user:
            return Response({
                "status": "error",
                "message": "You can only edit your own reviews",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            # If modifying after approval, need re-approval
            if review.is_approved:
                serializer.validated_data['is_approved'] = False
            
            serializer.save()
            return Response({
                "status": "success",
                "message": "Review updated successfully" + (" (pending re-approval)" if not serializer.validated_data['is_approved'] else ""),
                "data": serializer.data
            })
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "data": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        review = self.get_object(pk, request.user)
        
        # Check if user can delete this review
        if review.retailer != request.user and request.user.user_type != 'admin':
            return Response({
                "status": "error",
                "message": "You can only delete your own reviews",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        review.delete()
        return Response({
            "status": "success",
            "message": "Review deleted successfully",
            "data": None
        }, status=status.HTTP_204_NO_CONTENT)

class ApproveReviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        if request.user.user_type != 'admin':
            return Response({
                "status": "error",
                "message": "Only admins can approve reviews",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        review = get_object_or_404(ProductReview, pk=pk)
        
        if review.is_approved:
            return Response({
                "status": "error",
                "message": "Review is already approved",
                "data": None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        review.is_approved = True
        review.save()
        
        serializer = ProductReviewSerializer(review)
        return Response({
            "status": "success",
            "message": "Review approved successfully",
            "data": serializer.data
        })

class ProductPriceHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get(self, request, product_id):
        product = get_object_or_404(Product, pk=product_id)
        
        # Check if user has permission to view price history
        if request.user.user_type == 'distributor' and product.distributor != request.user:
            return Response({
                "status": "error",
                "message": "You can only view price history for your own products",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        queryset = ProductPriceHistory.objects.filter(product=product).order_by('-change_date')
        
        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ProductPriceHistorySerializer(page, many=True)
        
        return paginator.get_paginated_response({
            "status": "success",
            "message": "Price history retrieved successfully",
            "data": serializer.data
        })

class GenerateProductDescriptionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, product_id):
        product = get_object_or_404(Product, pk=product_id)
        
        # Check permissions
        if request.user.user_type != 'distributor' or product.distributor != request.user:
            return Response({
                "status": "error",
                "message": "You can only generate descriptions for your own products",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            prompt = f"""
            Generate compelling product descriptions for this rural supply chain product:
            
            Product Name: {product.name}
            Category: {product.category.name if product.category else 'N/A'}
            Current Description: {product.description or 'None'}
            Price: {product.price_per_unit} per {product.unit}
            Minimum Order: {product.min_order_quantity} {product.unit}
            
            Target Audience: Small retailers in {product.distributor.location if product.distributor.location else 'rural areas'}
            
            Generate 3 versions:
            1. Concise (1-2 sentences)
            2. Detailed (paragraph with features and benefits)
            3. Marketing (persuasive with call-to-action)
            
            Also suggest:
            - 5 relevant keywords for SEO
            - 3 selling points to highlight
            
            Format response as JSON with these keys:
            - concise_description
            - detailed_description
            - marketing_description
            - keywords
            - selling_points
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "status": "success",
                "message": "Product descriptions generated successfully",
                "data": {
                    'descriptions': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to generate product description: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "Failed to generate description",
                "data": {'error': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PricingRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.user_type != 'distributor':
            return Response({
                "status": "error",
                "message": "Only distributors can get pricing recommendations",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            products = Product.objects.filter(distributor=request.user, is_active=True)
            
            # Get sales and demand data
            product_data = []
            for product in products:
                demand = RetailerDemand.objects.filter(
                    product=product,
                    fulfilled=False
                ).aggregate(total_demand=Sum('quantity'))['total_demand'] or 0
                
                sales = OrderItem.objects.filter(
                    product=product
                ).aggregate(total_sold=Sum('quantity'))['total_sold'] or 0
                
                product_data.append({
                    'product_id': product.id,
                    'name': product.name,
                    'current_price': float(product.price_per_unit),
                    'cost_price': float(product.cost_per_unit),
                    'available_quantity': float(product.available_quantity),
                    'pending_demand': float(demand),
                    'total_sold': float(sales),
                    'current_margin': float(product.margin)
                })
            
            prompt = f"""
            Analyze pricing for these rural supply chain products and provide recommendations:
            
            Market Conditions:
            - Current season: {date.today().strftime('%B')}
            - Economic factors: stable
            - Target market: rural retailers
            
            Products:
            {json.dumps(product_data, indent=2)}
            
            Provide recommendations in this format:
            {{
                "recommendations": [
                    {{
                        "product_id": 1,
                        "product_name": "Product A",
                        "current_price": 100,
                        "recommended_price": 105,
                        "change_percentage": "+5%",
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
                "status": "success",
                "message": "Pricing recommendations generated successfully",
                "data": {
                    'recommendations': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to generate pricing recommendations: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "Failed to generate recommendations",
                "data": {'error': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DemandPredictionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.user_type not in ['retailer', 'node']:
            return Response({
                "status": "error",
                "message": "Only retailers and nodes can predict demand",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = request.user
            days = int(request.data.get('days', 30))
            
            if user.user_type == 'retailer':
                # Predict demand for products this retailer has ordered before
                products = Product.objects.filter(
                    orderitem__order__retailer=user
                ).distinct()
                
                historical_demand = RetailerDemand.objects.filter(
                    retailer=user
                ).values('product').annotate(
                    total_demand=Sum('quantity'),
                    avg_demand=Avg('quantity'),
                    demand_count=Count('id')
                )
            else:
                # Node - predict demand for products in their area
                retailer_ids = User.objects.filter(
                    user_type='retailer',
                    location=user.location
                ).values_list('id', flat=True)
                
                products = Product.objects.filter(
                    orderitem__order__retailer__in=retailer_ids
                ).distinct()
                
                historical_demand = RetailerDemand.objects.filter(
                    retailer__in=retailer_ids
                ).values('product').annotate(
                    total_demand=Sum('quantity'),
                    avg_demand=Avg('quantity'),
                    demand_count=Count('id')
                )
            
            demand_data = []
            for product in products:
                demand_stats = next(
                    (item for item in historical_demand if item['product'] == product.id),
                    {'total_demand': 0, 'avg_demand': 0, 'demand_count': 0}
                )
                
                demand_data.append({
                    'product_id': product.id,
                    'product_name': product.name,
                    'unit': product.unit,
                    'current_price': float(product.price_per_unit),
                    'historical_demand': {
                        'total': float(demand_stats['total_demand']),
                        'average': float(demand_stats['avg_demand']),
                        'count': demand_stats['demand_count']
                    }
                })
            
            prompt = f"""
            Predict product demand for the next {days} days based on this historical data:
            
            Products and Demand History:
            {json.dumps(demand_data, indent=2)}
            
            Current Factors:
            - Season: {date.today().strftime('%B')}
            - Market Conditions: stable
            - Location: {user.location if user.location else 'rural'}
            
            Provide predictions in this format:
            {{
                "predictions": [
                    {{
                        "product_id": 1,
                        "product_name": "Product A",
                        "current_demand": 100,
                        "predicted_demand": 120,
                        "change_percentage": "+20%",
                        "confidence": "high/medium/low",
                        "recommended_actions": ["increase stock", "promote to retailers"]
                    }}
                ],
                "methodology": "Explanation of prediction method",
                "risk_factors": ["list of factors that could affect accuracy"]
            }}
            """
            
            gemini = GeminiAI()
            response = gemini.generate_content(prompt)
            parsed_response = AIResponseParser.parse_to_json(response['content'])
            
            return Response({
                "status": "success",
                "message": f"Demand predictions generated for next {days} days",
                "data": {
                    'predictions': parsed_response,
                    'generated_at': response['timestamp']
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to predict demand: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "Failed to predict demand",
                "data": {'error': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)