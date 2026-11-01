from rest_framework import serializers

from .models import ProductInfo

class ProductSerializer(serializers.ModelSerializer):
    pass

    class Meta:
        model = ProductInfo
        fields = [
            'id',
            'name',
            'brand',
            'description',
            'process',
            'category',
            'materials',
            'features',
            'store_location',
        ]
