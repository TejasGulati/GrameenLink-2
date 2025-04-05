from rest_framework import serializers
from .models import Node, NodeInventory, NodePerformance, RouteOptimization
from users.models import User
from marketplace.serializers import ProductSerializer

class NodeSerializer(serializers.ModelSerializer):
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    operator_email = serializers.CharField(source='operator.email', read_only=True)
    parent_node_name = serializers.CharField(source='parent_node.operator.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Node
        fields = '__all__'
        read_only_fields = ('established_date',)

class NodeInventorySerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    node_details = NodeSerializer(source='node', read_only=True)
    
    class Meta:
        model = NodeInventory
        fields = '__all__'
        read_only_fields = ('last_updated',)

class NodePerformanceSerializer(serializers.ModelSerializer):
    node_details = NodeSerializer(source='node', read_only=True)
    
    class Meta:
        model = NodePerformance
        fields = '__all__'

class RouteOptimizationSerializer(serializers.ModelSerializer):
    node_details = NodeSerializer(source='node', read_only=True)
    
    class Meta:
        model = RouteOptimization
        fields = '__all__'
        read_only_fields = ('optimization_date',)