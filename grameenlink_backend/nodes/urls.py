from django.urls import path
from .views import (
    NodeListCreateView, NodeDetailView,
    NodeInventoryListView, NodeInventoryDetailView,
    NodePerformanceView, NodeGenerateAIInsightsView,
    RouteOptimizationView, RouteOptimizationGenerateView,
    NodeMaintenanceLogView, NodeMaintenanceLogDetailView
)

urlpatterns = [
    # Node management
    path('', NodeListCreateView.as_view(), name='node-list-create'),
    path('<int:pk>/', NodeDetailView.as_view(), name='node-detail'),
    
    # Node inventory
    path('inventory/', NodeInventoryListView.as_view(), name='inventory-list'),
    path('inventory/<int:pk>/', NodeInventoryDetailView.as_view(), name='inventory-detail'),
    
    # Node performance
    path('performance/', NodePerformanceView.as_view(), name='performance-list'),
    path('<int:pk>/performance/', NodePerformanceView.as_view(), name='node-performance'),
    path('<int:pk>/generate-ai-insights/', NodeGenerateAIInsightsView.as_view(), name='generate-ai-insights'),
    
    # Route optimization
    path('routes/', RouteOptimizationView.as_view(), name='route-list'),
    path('routes/generate/', RouteOptimizationGenerateView.as_view(), name='route-generate'),
    
    # Maintenance logs
    path('maintenance/', NodeMaintenanceLogView.as_view(), name='maintenance-list'),
    path('maintenance/<int:pk>/', NodeMaintenanceLogDetailView.as_view(), name='maintenance-detail'),
    path('<int:node_id>/maintenance/', NodeMaintenanceLogView.as_view(), name='node-maintenance-list'),
]