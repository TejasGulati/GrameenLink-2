from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.exceptions import ValidationError

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if 'user_type' not in extra_fields:
            raise ValueError('The user_type field must be set')
            
        email = self.normalize_email(email)
        username = extra_fields.pop('username', None)
        if username is None:
            username = self.generate_unique_username(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

    def generate_unique_username(self, email):
        username = email.split('@')[0]
        if not self.model.objects.filter(username=username).exists():
            return username
        original_username = username
        counter = 1
        while self.model.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        return username

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPES = (
        ('admin', 'Admin'),
        ('node', 'Node Operator'),
        ('retailer', 'Retailer'),
        ('distributor', 'Distributor'),
        ('farmer', 'Farmer'),
    )
    
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=255, unique=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    location = models.CharField(max_length=255, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPES)
    address = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    last_login = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'user_type']

    objects = CustomUserManager()

    def __str__(self):
        return self.email
    
    def clean(self):
        if self.user_type == 'admin' and not self.is_staff:
            raise ValidationError("Admin users must be staff members")
    
    @property
    def is_admin(self):
        return self.user_type == 'admin' or self.is_superuser
    
    def has_perm(self, perm, obj=None):
        if self.is_admin:
            return True
        return super().has_perm(perm, obj)
    
    def has_module_perms(self, app_label):
        if self.is_admin:
            return True
        return super().has_module_perms(app_label)

class BlacklistedToken(models.Model):
    token = models.CharField(max_length=255, unique=True)
    token_hash = models.CharField(max_length=64, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blacklisted_tokens')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=timezone.now)
    is_blacklisted = models.BooleanField(default=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['expires_at']),
            models.Index(fields=['user']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Blacklisted token for {self.user.email}"
    
    def save(self, *args, **kwargs):
        import hashlib
        self.token_hash = hashlib.sha256(self.token.encode()).hexdigest()
        
        if len(self.token) > 255:
            self.token = self.token[:255]
            
        if not self.expires_at:
            self.set_expiration()
            
        super().save(*args, **kwargs)
    
    def set_expiration(self):
        try:
            import jwt
            from django.conf import settings
            decoded = jwt.decode(
                self.token, 
                settings.SECRET_KEY, 
                algorithms=["HS256"],
                options={"verify_signature": False}
            )
            if 'exp' in decoded:
                from datetime import datetime
                self.expires_at = datetime.fromtimestamp(decoded['exp'])
                return
        except Exception:
            pass
        from django.utils import timezone
        self.expires_at = timezone.now() + timezone.timedelta(days=30)