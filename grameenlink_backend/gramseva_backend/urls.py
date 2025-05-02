from django.contrib import admin
from django.urls import path, include
from users.views import RefreshTokenView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/marketplace/', include('marketplace.urls')),
    path('api/nodes/', include('nodes.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/auth/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
]