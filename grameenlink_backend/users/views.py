from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.conf import settings
from django.shortcuts import get_object_or_404
from users.serializers import UserSerializer
from users.models import User, BlacklistedToken
from rest_framework_simplejwt.exceptions import TokenError
import logging
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import jwt

# Set up logger
logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Check if email already exists
                if User.objects.filter(email=serializer.validated_data['email']).exists():
                    return Response({
                        "status": 400,
                        "message": "Email already exists.",
                        "data": {'email': ['Email already exists.']}
                    })
                
                # Validate password
                validate_password(serializer.validated_data['password'])
                
                user = serializer.save()
                return Response({
                    "status": 200,
                    "message": "User registered successfully.",
                    "data": serializer.data
                })
            except ValidationError as e:
                return Response({
                    "status": 400,
                    "message": "Password validation failed.",
                    "data": {'password': e.messages}
                })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email:
            return Response({
                "status": 400,
                "message": "Email is required.",
                "data": {'email': ['Email is required.']}
            })
        if not password:
            return Response({
                "status": 400,
                "message": "Password is required.",
                "data": {'password': ['Password is required.']}
            })

        user = User.objects.filter(email=email).first()

        if user is None:
            return Response({
                "status": 404,
                "message": "User not found.",
                "data": {'email': ['User not found.']}
            })

        if not user.check_password(password):
            return Response({
                "status": 400,
                "message": "Incorrect password.",
                "data": {'password': ['Incorrect password.']}
            })

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response_data = {
            "status": 200,
            "message": "Login successful.",
            "data": {
                'access': access_token,
                'refresh': refresh_token
            }
        }
        
        response = Response(response_data)
        response.set_cookie(key='jwt', value=refresh_token, httponly=True, secure=True)
        return response

class RefreshTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get('jwt')

        if not refresh_token:
            return Response({
                "status": 401,
                "message": "Refresh token is missing!",
                "data": None
            })

        try:
            token = RefreshToken(refresh_token)
            
            # Check if the refresh token is blacklisted
            if BlacklistedToken.objects.filter(token=refresh_token).exists():
                return Response({
                    "status": 401,
                    "message": "Refresh token is blacklisted!",
                    "data": None
                })

            access_token = str(token.access_token)
            
            return Response({
                "status": 200,
                "message": "Token refreshed successfully.",
                "data": {'access': access_token}
            })
            
        except TokenError:
            return Response({
                "status": 401,
                "message": "Invalid refresh token!",
                "data": None
            })

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response({
            "status": 200,
            "message": "User data retrieved successfully.",
            "data": serializer.data
        })

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": 200,
                "message": "User data updated successfully.",
                "data": serializer.data
            })
        return Response({
            "status": 400,
            "message": "Invalid data provided.",
            "data": serializer.errors
        })
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('jwt')
            access_token = request.auth.token if hasattr(request, 'auth') and hasattr(request.auth, 'token') else None

            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    BlacklistedToken.objects.create(token=str(token), user=request.user)
                except TokenError:
                    pass  # Token was invalid, continue with the logout process

            if access_token:
                BlacklistedToken.objects.create(token=str(access_token), user=request.user)

            response = Response({
                "status": 200,
                "message": "Successfully logged out.",
                "data": None
            })
            
            response.delete_cookie('jwt')
            return response

        except Exception as e:
            logger.error(f"Error during logout: {str(e)}")
            return Response({
                "status": 500,
                "message": "An error occurred during logout",
                "data": {"error": str(e)}
            })