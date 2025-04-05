from django.urls import path
from .views import (
    DashboardAnalyticsListView,
    DashboardAnalyticsDetailView,
    DashboardSummaryView,
    GenerateAIAnalysisView,
    UserDashboardListView,
    UserDashboardDetailView,
    UserRecommendationsView,
    GeneratePersonalizedInsightsView
)

urlpatterns = [
    # Dashboard Analytics endpoints
    path('analytics/', DashboardAnalyticsListView.as_view(), name='dashboard-analytics-list'),
    path('analytics/<int:pk>/', DashboardAnalyticsDetailView.as_view(), name='dashboard-analytics-detail'),
    path('analytics/summary/', DashboardSummaryView.as_view(), name='analytics-summary'),
    path('analytics/generate-ai-analysis/', GenerateAIAnalysisView.as_view(), name='generate-ai-analysis'),
    
    # User Dashboard endpoints
    path('user/', UserDashboardListView.as_view(), name='user-dashboard-list'),
    path('user/<int:pk>/', UserDashboardDetailView.as_view(), name='user-dashboard-detail'),
    path('user/recommendations/', UserRecommendationsView.as_view(), name='user-recommendations'),
    path('user/<int:pk>/generate-personalized-insights/', GeneratePersonalizedInsightsView.as_view(), name='generate-personalized-insights'),
]