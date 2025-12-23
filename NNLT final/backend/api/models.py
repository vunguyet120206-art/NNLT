"""
Models for Hero Lab API
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class User(AbstractUser):
    """Custom User model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']


class SignalData(models.Model):
    """Model for uploaded signal data"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='signal_data')
    original_file = models.FileField(upload_to='uploads/')
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Processed data (JSON)
    processed_data = models.JSONField(null=True, blank=True)
    
    # Metrics (JSON)
    metrics = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-uploaded_at']


class CalculationData(models.Model):
    """Model for manual calculation data (HR, PTT, MBP)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calculations')
    
    # Calculated results (only save these)
    hr = models.FloatField(null=False, help_text="Heart Rate (bpm)")
    ptt = models.FloatField(null=False, help_text="Pulse Transit Time (seconds)")
    mbp = models.FloatField(null=False, help_text="Mean Blood Pressure (mmHg)")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255, blank=True, help_text="Optional file name reference")
    
    class Meta:
        ordering = ['-created_at']

