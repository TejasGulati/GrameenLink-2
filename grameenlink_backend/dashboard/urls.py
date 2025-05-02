from django.urls import path
from .views import (
    DashboardAnalyticsView, GenerateDashboardAnalyticsView,
    GenerateAIAnalyticsInsightsView, UserDashboardView,
    GeneratePersonalizedInsightsView, KPIView, KPIDetailView,
    UpdateKPIsView, NotificationView, NotificationDetailView,
    MarkAllNotificationsReadView, UnreadNotificationCountView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Admin Dashboard Analytics
    path('admin/analytics/', DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    path('admin/analytics/generate/', GenerateDashboardAnalyticsView.as_view(), name='generate-analytics'),
    path('admin/analytics/generate-ai-insights/', GenerateAIAnalyticsInsightsView.as_view(), name='generate-ai-insights'),

    # KPIs (Admin only)
    path('admin/kpis/', KPIView.as_view(), name='kpi-list'),
    path('admin/kpis/<int:pk>/', KPIDetailView.as_view(), name='kpi-detail'),
    path('admin/kpis/update-all/', UpdateKPIsView.as_view(), name='update-kpis'),

    # User Dashboard
    path('user/', UserDashboardView.as_view(), name='user-dashboard'),
    path('user/generate-insights/', GeneratePersonalizedInsightsView.as_view(), name='generate-personalized-insights'),

    # Notifications
    path('notifications/', NotificationView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('notifications/mark-all-read/', MarkAllNotificationsReadView.as_view(), name='mark-notifications-read'),
    path('notifications/unread-count/', UnreadNotificationCountView.as_view(), name='unread-notification-count'),
]