from django.db import models
from django.core.validators import MinValueValidator
from users.models import User
from decimal import Decimal
from datetime import datetime
from django.utils import timezone

class ProductCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name_plural = "Product Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Product(models.Model):
    UNIT_CHOICES = (
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('l', 'Liter'),
        ('ml', 'Milliliter'),
        ('pc', 'Piece'),
        ('box', 'Box'),
        ('pack', 'Pack'),
    )
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        ProductCategory, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='products'
    )
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    price_per_unit = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    cost_per_unit = models.DecimalField(
    max_digits=10, 
    decimal_places=2,
    validators=[MinValueValidator(0.01)],
    default=Decimal("0.01"),  
    help_text="Cost price per unit"
)

    min_order_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=1,
        validators=[MinValueValidator(0.01)]
    )
    available_quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    distributor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'user_type': 'distributor'},
        related_name='products'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    tags = models.JSONField(default=list, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['distributor']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.distributor.company})"
    
    @property
    def margin(self):
        if self.cost_per_unit > 0:
            return ((self.price_per_unit - self.cost_per_unit) / self.cost_per_unit) * 100
        return 0

class Order(models.Model):
    ORDER_STATUS = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('returned', 'Returned'),
    )
    
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    )
    
    retailer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'user_type': 'retailer'},
        related_name='orders'
    )
    node = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        limit_choices_to={'user_type': 'node'},
        related_name='node_orders'
    )
    order_date = models.DateTimeField(auto_now_add=True)
    delivery_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    delivery_address = models.TextField()
    delivery_notes = models.TextField(blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-order_date']
        indexes = [
            models.Index(fields=['retailer']),
            models.Index(fields=['node']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_status']),
        ]
    
    def __str__(self):
        return f"Order #{self.id} - {self.retailer.name}"
    
    def save(self, *args, **kwargs):
        # Calculate total amount from items if not set
        if not self.total_amount and hasattr(self, 'items'):
            self.total_amount = sum(
                item.total_price for item in self.items.all()
            )
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, 
        related_name='items', 
        on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='order_items'
    )
    quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    total_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-order__order_date']
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Order #{self.order.id})"
    
    def save(self, *args, **kwargs):
        if not self.unit_price:
            self.unit_price = self.product.price_per_unit
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

class RetailerDemand(models.Model):
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    retailer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'user_type': 'retailer'},
        related_name='demands'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='demands'
    )
    quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='medium'
    )
    recorded_at = models.DateTimeField(auto_now_add=True)
    fulfilled = models.BooleanField(default=False)
    fulfilled_at = models.DateTimeField(null=True, blank=True)
    fulfilled_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': 'node'},
        related_name='fulfilled_demands'
    )
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['retailer']),
            models.Index(fields=['product']),
            models.Index(fields=['fulfilled']),
        ]
    
    def __str__(self):
        return f"{self.retailer.name} - {self.product.name} ({self.quantity} {self.product.unit})"

class ProductPriceHistory(models.Model):
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='price_history'
    )
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='price_changes'
    )
    change_date = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-change_date']
        verbose_name_plural = "Product Price Histories"
    
    def __str__(self):
        return f"{self.product.name} price change on {self.change_date.date()}"

class ProductReview(models.Model):
    RATING_CHOICES = (
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    )
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    retailer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'retailer'},
        related_name='product_reviews'
    )
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    is_approved = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('product', 'retailer')
    
    def __str__(self):
        return f"{self.retailer.name}'s review for {self.product.name}"