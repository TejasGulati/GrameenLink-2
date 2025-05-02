from django.db import models
from django.core.validators import MinValueValidator
from users.models import User

class Node(models.Model):
    NODE_TYPES = (
        ('primary', 'Primary Node'),
        ('sub', 'Sub Node'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Under Maintenance'),
    )
    
    operator = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'user_type': 'node'},
        related_name='operated_node'
    )
    node_type = models.CharField(max_length=20, choices=NODE_TYPES)
    parent_node = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='sub_nodes'
    )
    coverage_area = models.CharField(max_length=255)
    capacity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Storage capacity in cubic meters"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    established_date = models.DateField(auto_now_add=True)
    last_maintenance_date = models.DateField(null=True, blank=True)
    service_hours = models.CharField(max_length=100, default="9:00 AM - 6:00 PM")
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    
    class Meta:
        ordering = ['-established_date']
        indexes = [
            models.Index(fields=['node_type']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.operator.name} - {self.get_node_type_display()}"

class NodeInventory(models.Model):
    node = models.ForeignKey(
        Node, 
        on_delete=models.CASCADE,
        related_name='inventory_items'
    )
    product = models.ForeignKey(
        'marketplace.Product', 
        on_delete=models.CASCADE,
        related_name='node_inventory'
    )
    quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    threshold = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=5,
        validators=[MinValueValidator(0)],
        help_text="Minimum quantity before restock alert"
    )
    last_updated = models.DateTimeField(auto_now=True)
    last_restocked = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('node', 'product')
        verbose_name_plural = "Node Inventory"
        ordering = ['-last_updated']
    
    def __str__(self):
        return f"{self.node} - {self.product.name} ({self.quantity})"

class NodePerformance(models.Model):
    node = models.ForeignKey(
        Node, 
        on_delete=models.CASCADE,
        related_name='performance_records'
    )
    date = models.DateField()
    orders_processed = models.PositiveIntegerField(default=0)
    revenue_generated = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0
    )
    retailers_served = models.PositiveIntegerField(default=0)
    avg_order_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0
    )
    fulfillment_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=100,
        help_text="Percentage of orders fulfilled successfully"
    )
    
    class Meta:
        unique_together = ('node', 'date')
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.node} - {self.date}"

class RouteOptimization(models.Model):
    node = models.ForeignKey(
        Node, 
        on_delete=models.CASCADE,
        related_name='optimized_routes'
    )
    optimized_route = models.JSONField()
    optimization_date = models.DateTimeField(auto_now_add=True)
    estimated_savings = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Estimated savings in percentage"
    )
    actual_savings = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Actual realized savings"
    )
    route_distance = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.0,
        help_text="Total distance in kilometers"
    )
    execution_time = models.DurationField(
        null=True,
        blank=True,
        help_text="Actual time taken to complete the route"
    )
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-optimization_date']
        verbose_name_plural = "Route Optimizations"
    
    def __str__(self):
        return f"Optimized Route for {self.node} on {self.optimization_date.date()}"

class NodeMaintenanceLog(models.Model):
    node = models.ForeignKey(
        Node,
        on_delete=models.CASCADE,
        related_name='maintenance_logs'
    )
    maintenance_type = models.CharField(max_length=50)
    description = models.TextField()
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'user_type': 'admin'}
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    downtime_duration = models.DurationField(null=True, blank=True)
    resolved = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-start_time']
    
    def save(self, *args, **kwargs):
        if self.end_time and self.start_time:
            self.downtime_duration = self.end_time - self.start_time
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.maintenance_type} for {self.node} on {self.start_time.date()}"