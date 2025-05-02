from rest_framework import serializers
from .models import DashboardAnalytics, UserDashboard, KPI, Notification
from marketplace.serializers import ProductSerializer, OrderSerializer
from nodes.serializers import NodeSerializer
from users.serializers import UserSerializer

class DashboardAnalyticsSerializer(serializers.ModelSerializer):
    time_range_display = serializers.CharField(source='get_time_range_display', read_only=True)
    user_type_counts = serializers.SerializerMethodField()
    
    class Meta:
        model = DashboardAnalytics
        fields = [
            'id', 'date', 'time_range', 'time_range_display',
            'total_orders', 'total_revenue', 'active_users',
            'active_nodes', 'products_available', 'order_fulfillment_rate',
            'avg_order_value', 'top_products', 'node_performance',
            'ai_generated_insights', 'generated_at', 'user_type_counts'
        ]
        read_only_fields = fields
    
    def get_user_type_counts(self, obj):
        return obj.active_users

class UserDashboardSerializer(serializers.ModelSerializer):
    preferred_products = ProductSerializer(many=True, read_only=True)
    favorite_nodes = NodeSerializer(many=True, read_only=True)
    recent_orders = OrderSerializer(many=True, read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = UserDashboard
        fields = [
            'id', 'user', 'user_details', 'preferred_products',
            'favorite_nodes', 'recent_orders', 'notification_preferences',
            'layout_preferences', 'ai_insights', 'ai_insights_generated_at',
            'last_accessed'
        ]
        read_only_fields = [
            'user', 'user_details', 'preferred_products',
            'favorite_nodes', 'recent_orders', 'ai_insights',
            'ai_insights_generated_at', 'last_accessed'
        ]

class KPISerializer(serializers.ModelSerializer):
    kpi_type_display = serializers.CharField(source='get_kpi_type_display', read_only=True)
    progress_display = serializers.SerializerMethodField()
    
    class Meta:
        model = KPI
        fields = [
            'id', 'name', 'kpi_type', 'kpi_type_display',
            'target_value', 'current_value', 'timeframe',
            'progress', 'progress_display', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['progress', 'progress_display', 'created_at', 'updated_at']
    
    def get_progress_display(self, obj):
        return f"{obj.progress}%"

class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    created_at_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'notification_type_display',
            'title', 'message', 'is_read', 'related_object_id',
            'related_object_type', 'created_at', 'created_at_display'
        ]
        read_only_fields = ['created_at', 'created_at_display']
    
    def get_created_at_display(self, obj):
        return obj.created_at.strftime("%b %d, %Y %I:%M %p")