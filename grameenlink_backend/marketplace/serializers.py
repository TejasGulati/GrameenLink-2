from rest_framework import serializers
from .models import ProductCategory, Product, Order, OrderItem, RetailerDemand
from users.models import User

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    distributor_name = serializers.CharField(source='distributor.name', read_only=True)
    distributor_company = serializers.CharField(source='distributor.company', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'unit_price', 'total_price', 'product_name', 'product_unit']
        read_only_fields = ('unit_price', 'total_price')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    retailer_name = serializers.CharField(source='retailer.name', read_only=True)
    node_name = serializers.CharField(source='node.name', read_only=True, allow_null=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('order_date', 'total_amount')

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        total_amount = 0
        order = Order.objects.create(total_amount=0, **validated_data)

        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            unit_price = product.price_per_unit
            total_price = quantity * unit_price

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price
            )

            total_amount += total_price

        order.total_amount = total_amount
        order.save(update_fields=['total_amount'])
        return order

class RetailerDemandSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    retailer_name = serializers.CharField(source='retailer.name', read_only=True)
    
    class Meta:
        model = RetailerDemand
        fields = '__all__'
        read_only_fields = ('recorded_at', 'fulfilled')