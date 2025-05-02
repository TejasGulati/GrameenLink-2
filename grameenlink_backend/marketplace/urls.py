from django.urls import path
from .views import (
    ProductCategoryView, ProductCategoryDetailView,
    ProductView, ProductDetailView, GenerateProductDescriptionView,
    OrderView, OrderDetailView,
    RetailerDemandView, RetailerDemandDetailView, FulfillDemandView,
    ProductReviewView, ProductReviewDetailView, ApproveReviewView,
    ProductPriceHistoryView, PricingRecommendationsView,
    DemandPredictionView
)

urlpatterns = [
    # Product Categories
    path('categories/', ProductCategoryView.as_view(), name='category-list'),
    path('categories/<int:pk>/', ProductCategoryDetailView.as_view(), name='category-detail'),
    
    # Products
    path('products/', ProductView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:product_id>/generate-description/', GenerateProductDescriptionView.as_view(), name='generate-product-description'),
    path('products/pricing-recommendations/', PricingRecommendationsView.as_view(), name='pricing-recommendations'),
    
    # Orders
    path('orders/', OrderView.as_view(), name='order-list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    
    # Retailer Demands
    path('demands/', RetailerDemandView.as_view(), name='demand-list'),
    path('demands/<int:pk>/', RetailerDemandDetailView.as_view(), name='demand-detail'),
    path('demands/<int:pk>/fulfill/', FulfillDemandView.as_view(), name='fulfill-demand'),
    
    # Product Reviews
    path('reviews/', ProductReviewView.as_view(), name='review-list'),
    path('reviews/<int:product_id>/', ProductReviewView.as_view(), name='product-review-list'),
    path('reviews/detail/<int:pk>/', ProductReviewDetailView.as_view(), name='review-detail'),
    path('reviews/<int:pk>/approve/', ApproveReviewView.as_view(), name='approve-review'),
    
    # Product Price History
    path('products/<int:product_id>/price-history/', ProductPriceHistoryView.as_view(), name='price-history'),
    
    # Demand Prediction
    path('demand-prediction/', DemandPredictionView.as_view(), name='demand-prediction'),
]