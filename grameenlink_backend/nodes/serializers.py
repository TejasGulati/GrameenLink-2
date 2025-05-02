from rest_framework import serializers
from .models import (
    Node, NodeInventory, NodePerformance, 
    RouteOptimization, NodeMaintenanceLog
)
from users.models import User
from rest_framework.validators import UniqueTogetherValidator

class NodeMaintenanceLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.name', read_only=True)
    
    class Meta:
        model = NodeMaintenanceLog
        fields = '__all__'
        read_only_fields = ('downtime_duration',)

class NodeSerializer(serializers.ModelSerializer):
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    operator_email = serializers.CharField(source='operator.email', read_only=True)
    parent_node_name = serializers.CharField(
        source='parent_node.operator.name', 
        read_only=True, 
        allow_null=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    maintenance_logs = NodeMaintenanceLogSerializer(
        many=True,
        read_only=True
    )
    
    class Meta:
        model = Node
        fields = [
            'id', 'operator', 'operator_name', 'operator_email',
            'node_type', 'parent_node', 'parent_node_name',
            'coverage_area', 'capacity', 'status', 'status_display',
            'established_date', 'last_maintenance_date',
            'service_hours', 'contact_number', 'maintenance_logs'
        ]
        read_only_fields = ('established_date',)

class NodeInventorySerializer(serializers.ModelSerializer):
    product_details = serializers.SerializerMethodField()
    node_details = serializers.CharField(source='node.operator.name', read_only=True)
    needs_restock = serializers.SerializerMethodField()
    
    class Meta:
        model = NodeInventory
        fields = [
            'id', 'node', 'node_details', 'product', 'product_details',
            'quantity', 'threshold', 'last_updated', 'last_restocked',
            'needs_restock'
        ]
        read_only_fields = ('last_updated', 'last_restocked', 'needs_restock')
        validators = [
            UniqueTogetherValidator(
                queryset=NodeInventory.objects.all(),
                fields=['node', 'product'],
                message="Inventory record for this product already exists at this node."
            )
        ]
    
    def get_product_details(self, obj):
        from marketplace.serializers import ProductSerializer  # Lazy import to avoid circular import
        return ProductSerializer(obj.product).data

    def get_needs_restock(self, obj):
        return obj.quantity <= obj.threshold

class NodePerformanceSerializer(serializers.ModelSerializer):
    node_details = serializers.CharField(source='node.operator.name', read_only=True)
    fulfillment_rate_display = serializers.SerializerMethodField()
    
    class Meta:
        model = NodePerformance
        fields = [
            'id', 'node', 'node_details', 'date', 'orders_processed',
            'revenue_generated', 'retailers_served', 'avg_order_value',
            'fulfillment_rate', 'fulfillment_rate_display'
        ]
    
    def get_fulfillment_rate_display(self, obj):
        return f"{obj.fulfillment_rate}%"

class RouteOptimizationSerializer(serializers.ModelSerializer):
    node_details = serializers.CharField(source='node.operator.name', read_only=True)
    execution_time_display = serializers.SerializerMethodField()
    savings_comparison = serializers.SerializerMethodField()
    
    class Meta:
        model = RouteOptimization
        fields = [
            'id', 'node', 'node_details', 'optimized_route',
            'optimization_date', 'estimated_savings', 'actual_savings',
            'route_distance', 'execution_time', 'execution_time_display',
            'savings_comparison', 'notes'
        ]
        read_only_fields = ('optimization_date',)
    
    def get_execution_time_display(self, obj):
        if obj.execution_time:
            total_seconds = obj.execution_time.total_seconds()
            hours = int(total_seconds // 3600)
            minutes = int((total_seconds % 3600) // 60)
            return f"{hours}h {minutes}m"
        return None
    
    def get_savings_comparison(self, obj):
        if obj.actual_savings and obj.estimated_savings:
            difference = obj.actual_savings - obj.estimated_savings
            return {
                'difference': float(difference),
                'percentage': float((difference / obj.estimated_savings) * 100)
            }
        return None
