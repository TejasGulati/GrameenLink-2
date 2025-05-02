from django.db import models
from users.models import User
from marketplace.models import Product, Order
from nodes.models import Node
from django.utils import timezone


class DashboardAnalytics(models.Model):
    TIME_RANGE_CHOICES = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    )
    
    date = models.DateField()
    time_range = models.CharField(max_length=10, choices=TIME_RANGE_CHOICES, default='daily')
    total_orders = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    active_users = models.JSONField(default=dict)  # Stores counts per user type
    active_nodes = models.PositiveIntegerField(default=0)
    products_available = models.PositiveIntegerField(default=0)
    order_fulfillment_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    avg_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    top_products = models.JSONField(default=list)
    node_performance = models.JSONField(default=list)
    ai_generated_insights = models.JSONField(blank=True, null=True)
    generated_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Dashboard Analytics"
        unique_together = ('date', 'time_range')
        ordering = ['-date', '-time_range']
    
    def __str__(self):
        return f"Analytics for {self.date} ({self.get_time_range_display()})"

class UserDashboard(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='dashboard_settings'
    )
    preferred_products = models.ManyToManyField(
        Product, 
        blank=True,
        related_name='preferred_by_dashboards'
    )
    favorite_nodes = models.ManyToManyField(
        Node, 
        blank=True,
        related_name='favorited_by_dashboards'
    )
    recent_orders = models.ManyToManyField(
        Order, 
        blank=True,
        related_name='recent_in_dashboards'
    )
    notification_preferences = models.JSONField(default=dict)
    layout_preferences = models.JSONField(default=dict)
    ai_insights = models.JSONField(blank=True, null=True)
    ai_insights_generated_at = models.DateTimeField(blank=True, null=True)
    last_accessed = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Dashboard for {self.user.name}"

class KPI(models.Model):
    KPI_TYPE_CHOICES = (
        ('orders', 'Orders'),
        ('revenue', 'Revenue'),
        ('fulfillment', 'Fulfillment Rate'),
        ('inventory', 'Inventory Turnover'),
        ('users', 'Active Users'),
        ('nodes', 'Node Performance'),
    )
    
    name = models.CharField(max_length=100)
    kpi_type = models.CharField(max_length=20, choices=KPI_TYPE_CHOICES)
    target_value = models.DecimalField(max_digits=12, decimal_places=2)
    current_value = models.DecimalField(max_digits=12, decimal_places=2)
    timeframe = models.CharField(max_length=50)
    progress = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "KPI"
        verbose_name_plural = "KPIs"
        ordering = ['-is_active', 'kpi_type']
    
    def __str__(self):
        return f"{self.name} ({self.get_kpi_type_display()})"
    
    def save(self, *args, **kwargs):
        if self.target_value > 0:
            self.progress = (self.current_value / self.target_value) * 100
        super().save(*args, **kwargs)

class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = (
        ('order', 'Order Update'),
        ('inventory', 'Inventory Alert'),
        ('system', 'System Notification'),
        ('promotion', 'Promotion'),
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} for {self.user.name}"