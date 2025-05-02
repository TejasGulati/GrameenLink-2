from rest_framework import serializers
from users.models import User, BlacklistedToken
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'username', 'password', 'date_joined', 
                 'location', 'company', 'phone', 'user_type', 'address', 
                 'latitude', 'longitude', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': True},
            'date_joined': {'read_only': True},
            'is_staff': {'read_only': True},
            'is_superuser': {'read_only': True},
        }

    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        if self.instance and User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This email is already taken.")
        elif not self.instance and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already taken.")
        return value

    def validate_username(self, value):
        if value is None:
            return value
        if self.instance and User.objects.filter(username=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This username is already taken.")
        elif not self.instance and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class AdminUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        extra_kwargs = {
            'password': {'write_only': True},
            'date_joined': {'read_only': True},
            'is_staff': {'read_only': False},
            'is_superuser': {'read_only': False},
        }

    def validate(self, data):
        if data.get('user_type') == 'admin':
            data['is_staff'] = True
        return data

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        data.update({
            'user': UserSerializer(user).data,
            'is_admin': user.is_admin
        })
        return data

class BlacklistedTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlacklistedToken
        fields = ['token', 'user', 'created_at', 'expires_at']
        read_only_fields = ['user', 'created_at', 'expires_at']