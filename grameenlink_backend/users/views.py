from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, BlacklistedToken
from .serializers import (
    UserSerializer, 
    AdminUserSerializer,
    CustomTokenObtainPairSerializer,
    BlacklistedTokenSerializer
)
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.shortcuts import get_object_or_404

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)

class RegisterView(APIView):
    def post(self, request):
        # Check if trying to register as admin
        if request.data.get('user_type') == 'admin':
            return Response(
                {'error': 'Cannot register as admin directly. Use admin interface.'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class RefreshTokenView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)
            
            return Response({
                'access': new_access_token,
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            BlacklistedToken.objects.create(
                token=str(token),
                user=request.user,
                expires_at=timezone.now() + token.lifetime
            )
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TokenValidationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'valid': True, 'user': UserSerializer(request.user).data})

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AdminUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        serializer = AdminUserSerializer(user)
        return Response(serializer.data)

    def put(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        if user == request.user:
            return Response({'error': 'You cannot delete your own account'}, status=status.HTTP_403_FORBIDDEN)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        stats = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'admin_users': User.objects.filter(user_type='admin').count(),
            'recent_users': User.objects.order_by('-date_joined')[:5],
        }
        serializer = AdminUserSerializer(stats['recent_users'], many=True)
        return Response({
            'stats': {
                'total_users': stats['total_users'],
                'active_users': stats['active_users'],
                'admin_users': stats['admin_users'],
            },
            'recent_users': serializer.data
        })