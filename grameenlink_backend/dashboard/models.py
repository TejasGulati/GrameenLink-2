from django.db import models
from users.models import User
from marketplace.models import Order, Product
from nodes.models import Node, NodePerformance, RouteOptimization

class DashboardAnalytics(models.Model):
    date = models.DateField(unique=True)
    total_orders = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    active_retailers = models.PositiveIntegerField(default=0)
    active_nodes = models.PositiveIntegerField(default=0)
    products_available = models.PositiveIntegerField(default=0)
    ai_generated_insights = models.JSONField(blank=True, null=True)
    generated_at = models.DateTimeField(blank=True, null=True)
    time_range = models.CharField(max_length=10, blank=True, null=True)
    
    def __str__(self):
        return f"Analytics for {self.date}"

class UserDashboard(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dashboard')
    preferred_products = models.ManyToManyField(Product, blank=True)
    favorite_nodes = models.ManyToManyField(Node, blank=True)
    recent_orders = models.ManyToManyField(Order, blank=True)
    notification_preferences = models.JSONField(default=dict)
    ai_insights = models.JSONField(blank=True, null=True)
    ai_insights_generated_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Dashboard for {self.user.name}"