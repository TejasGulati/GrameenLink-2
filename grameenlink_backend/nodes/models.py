from django.db import models
from users.models import User

class Node(models.Model):
    NODE_TYPES = (
        ('primary', 'Primary Node'),
        ('sub', 'Sub Node'),
    )
    
    operator = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'node'})
    node_type = models.CharField(max_length=20, choices=NODE_TYPES)
    parent_node = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_nodes')
    coverage_area = models.CharField(max_length=255)
    capacity = models.DecimalField(max_digits=10, decimal_places=2, help_text="Storage capacity in cubic meters")
    is_active = models.BooleanField(default=True)
    established_date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.operator.name} - {self.get_node_type_display()}"

class NodeInventory(models.Model):
    node = models.ForeignKey(Node, on_delete=models.CASCADE)
    product = models.ForeignKey('marketplace.Product', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('node', 'product')
    
    def __str__(self):
        return f"{self.node} - {self.product.name}"

class NodePerformance(models.Model):
    node = models.ForeignKey(Node, on_delete=models.CASCADE)
    date = models.DateField()
    orders_processed = models.PositiveIntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    retailers_served = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ('node', 'date')
    
    def __str__(self):
        return f"{self.node} - {self.date}"

class RouteOptimization(models.Model):
    node = models.ForeignKey(Node, on_delete=models.CASCADE)
    optimized_route = models.JSONField()
    optimization_date = models.DateTimeField(auto_now_add=True)
    estimated_savings = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"Route for {self.node} on {self.optimization_date}"