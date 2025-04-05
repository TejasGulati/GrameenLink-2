from django.urls import path
from .views import (
    NodeListCreateView, NodeDetailView,
    NodePerformanceView, NodeGenerateAIInsightsView,
    NodeInventoryListCreateView, NodeInventoryDetailView,
    NodeInventoryRestockRecommendationsView,
    NodePerformanceListCreateView, NodePerformanceDetailView, 
    NodePerformanceTrendsView,
    RouteOptimizationListCreateView, RouteOptimizationDetailView,
    RouteOptimizationGenerateView
)

urlpatterns = [
    # Node routes
    path('', NodeListCreateView.as_view(), name='node-list-create'),
    path('<int:pk>/', NodeDetailView.as_view(), name='node-detail'),
    path('<int:pk>/performance/', NodePerformanceView.as_view(), name='node-performance'),
    path('<int:pk>/generate-ai-insights/', NodeGenerateAIInsightsView.as_view(), name='node-generate-ai-insights'),
    
    # Inventory routes
    path('inventory/', NodeInventoryListCreateView.as_view(), name='inventory-list-create'),
    path('inventory/<int:pk>/', NodeInventoryDetailView.as_view(), name='inventory-detail'),
    path('inventory/generate-restock-recommendations/', NodeInventoryRestockRecommendationsView.as_view(), name='inventory-restock-recommendations'),
    
    # Performance routes
    path('performance/', NodePerformanceListCreateView.as_view(), name='performance-list-create'),
    path('performance/<int:pk>/', NodePerformanceDetailView.as_view(), name='performance-detail'),
    path('performance/trends/', NodePerformanceTrendsView.as_view(), name='performance-trends'),
    
    # Route optimization routes
    path('routes/', RouteOptimizationListCreateView.as_view(), name='route-list-create'),
    path('routes/<int:pk>/', RouteOptimizationDetailView.as_view(), name='route-detail'),
    path('routes/generate-optimized-route/', RouteOptimizationGenerateView.as_view(), name='route-generate-optimized')
]