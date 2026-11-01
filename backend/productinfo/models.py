from django.db import models
import uuid

# Create your models here.
class ProductInfo(models.Model):
    # id = models.CharField(max_length=3, primary_key=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128)
    brand = models.CharField(max_length=128)
    description = models.CharField(max_length=512)
    process = models.JSONField(default=dict)
    category = models.CharField(max_length=64, default="Clothing")
    materials = models.JSONField(default=list)
    features = models.JSONField(default=list)
    store_location = models.JSONField(default=dict)
    
