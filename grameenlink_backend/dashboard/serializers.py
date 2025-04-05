from rest_framework import serializers
from .models import DashboardAnalytics, UserDashboard
from marketplace.serializers import ProductSerializer, OrderSerializer
from nodes.serializers import NodeSerializer

class DashboardAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardAnalytics
        fields = [
            'id', 'date', 'total_orders', 'total_revenue', 
            'active_retailers', 'active_nodes', 'products_available',
            'ai_generated_insights', 'generated_at', 'time_range'
        ]
        read_only_fields = fields

class UserDashboardSerializer(serializers.ModelSerializer):
    preferred_products = ProductSerializer(many=True, read_only=True)
    favorite_nodes = NodeSerializer(many=True, read_only=True)
    recent_orders = OrderSerializer(many=True, read_only=True)
    
    class Meta:
        model = UserDashboard
        fields = [
            'id', 'user', 'preferred_products', 'favorite_nodes',
            'recent_orders', 'notification_preferences', 'ai_insights',
            'ai_insights_generated_at'
        ]
        read_only_fields = ['user', 'ai_insights', 'ai_insights_generated_at']