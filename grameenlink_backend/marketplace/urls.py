from django.urls import path
from .views import (
    ProductCategoryView, ProductCategoryDetailView, ProductCategoryInsightsView,
    ProductView, ProductDetailView, ProductDescriptionView, PricingRecommendationsView,
    OrderView, OrderDetailView, OrderSummaryView,
    RetailerDemandView, RetailerDemandDetailView, FutureDemandPredictionView
)

urlpatterns = [
    # Product Categories
    path('categories/', ProductCategoryView.as_view(), name='categories'),
    path('categories/<int:pk>/', ProductCategoryDetailView.as_view(), name='category-detail'),
    path('categories/<int:pk>/insights/', ProductCategoryInsightsView.as_view(), name='category-insights'),
    
    # Products
    path('products/', ProductView.as_view(), name='products'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:pk>/description/', ProductDescriptionView.as_view(), name='product-description'),
    path('products/pricing-recommendations/', PricingRecommendationsView.as_view(), name='pricing-recommendations'),
    
    # Orders
    path('orders/', OrderView.as_view(), name='orders'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/summary/', OrderSummaryView.as_view(), name='order-summary'),
    
    # Retailer Demands
    path('demands/', RetailerDemandView.as_view(), name='demands'),
    path('demands/<int:pk>/', RetailerDemandDetailView.as_view(), name='demand-detail'),
    path('demands/predict-future/', FutureDemandPredictionView.as_view(), name='predict-future-demand'),
]