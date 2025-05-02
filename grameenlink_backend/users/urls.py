from django.urls import path
from .views import (
    RegisterView, 
    UserView, 
    LoginView, 
    RefreshTokenView, 
    LogoutView,
    TokenValidationView,
    AdminUserListView,
    AdminUserDetailView,
    AdminDashboardView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('validate-token/', TokenValidationView.as_view(), name='validate-token'),
    
    # User endpoints
    path('user/', UserView.as_view(), name='user'),
    
    # Admin endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
]