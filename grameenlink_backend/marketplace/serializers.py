from rest_framework import serializers
from .models import (
    ProductCategory, Product, Order, 
    OrderItem, RetailerDemand,
    ProductPriceHistory, ProductReview
)
from users.models import User
from nodes.serializers import NodeSerializer
from rest_framework.validators import UniqueTogetherValidator
from django.db.models import Avg

class ProductCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductCategory
        fields = [
            'id', 'name', 'description', 'image',
            'created_at', 'updated_at', 'product_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'product_count']
    
    def get_product_count(self, obj):
        return obj.products.count()

class ProductSerializer(serializers.ModelSerializer):
    distributor_name = serializers.CharField(source='distributor.name', read_only=True)
    distributor_company = serializers.CharField(source='distributor.company', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    margin = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'unit', 'price_per_unit', 'cost_per_unit', 'min_order_quantity',
            'available_quantity', 'image', 'distributor', 'distributor_name',
            'distributor_company', 'is_active', 'created_at', 'updated_at',
            'tags', 'margin', 'rating', 'review_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'margin']
    
    def get_margin(self, obj):
        return obj.margin
    
    def get_rating(self, obj):
        return obj.reviews.aggregate(Avg('rating'))['rating__avg'] or 0
    
    def get_review_count(self, obj):
        return obj.reviews.count()

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_unit', 'product_image',
            'quantity', 'unit_price', 'total_price', 'notes'
        ]
        read_only_fields = ['unit_price', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    retailer_name = serializers.CharField(source='retailer.name', read_only=True)
    node_name = serializers.CharField(source='node.name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'retailer', 'retailer_name', 'node', 'node_name',
            'order_date', 'delivery_date', 'status', 'status_display',
            'payment_status', 'payment_status_display', 'total_amount',
            'tax_amount', 'discount_amount', 'delivery_address',
            'delivery_notes', 'payment_method', 'transaction_id',
            'notes', 'items'
        ]
        read_only_fields = ['order_date', 'total_amount']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            product = item_data['product']
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                unit_price=product.price_per_unit,
                notes=item_data.get('notes', '')
            )
        
        # Recalculate total amount after all items are added
        order.total_amount = sum(item.total_price for item in order.items.all())
        order.save()
        
        return order
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        order = super().update(instance, validated_data)
        
        if items_data is not None:
            # Clear existing items and recreate
            order.items.all().delete()
            for item_data in items_data:
                product = item_data['product']
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item_data['quantity'],
                    unit_price=product.price_per_unit,
                    notes=item_data.get('notes', '')
                )
            
            # Recalculate total amount
            order.total_amount = sum(item.total_price for item in order.items.all())
            order.save()
        
        return order

class RetailerDemandSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)
    retailer_name = serializers.CharField(source='retailer.name', read_only=True)
    fulfilled_by_name = serializers.CharField(source='fulfilled_by.name', read_only=True, allow_null=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = RetailerDemand
        fields = [
            'id', 'retailer', 'retailer_name', 'product', 'product_name',
            'product_unit', 'quantity', 'priority', 'priority_display',
            'recorded_at', 'fulfilled', 'fulfilled_at', 'fulfilled_by',
            'fulfilled_by_name', 'notes'
        ]
        read_only_fields = ['recorded_at', 'fulfilled_at']

class ProductPriceHistorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.name', read_only=True)
    price_change = serializers.SerializerMethodField()
    change_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductPriceHistory
        fields = [
            'id', 'product', 'product_name', 'old_price', 'new_price',
            'price_change', 'change_percentage', 'changed_by', 'changed_by_name',
            'change_date', 'reason'
        ]
        read_only_fields = ['change_date']
    
    def get_price_change(self, obj):
        return obj.new_price - obj.old_price
    
    def get_change_percentage(self, obj):
        if obj.old_price > 0:
            return ((obj.new_price - obj.old_price) / obj.old_price) * 100
        return 0

class ProductReviewSerializer(serializers.ModelSerializer):
    retailer_name = serializers.CharField(source='retailer.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'product', 'product_name', 'retailer', 'retailer_name',
            'rating', 'review', 'created_at', 'updated_at', 'is_approved'
        ]
        read_only_fields = ['created_at', 'updated_at']
        validators = [
            UniqueTogetherValidator(
                queryset=ProductReview.objects.all(),
                fields=['product', 'retailer'],
                message="You have already reviewed this product."
            )
        ]
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value