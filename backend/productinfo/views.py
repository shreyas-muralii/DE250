from django.shortcuts import render

# Create your views here.
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from django.shortcuts import get_object_or_404

from .models import ProductInfo
from .serializers import ProductSerializer

class ProductInfoView(APIView):
    def get(self, request, productId):
        product = get_object_or_404(ProductInfo, id=productId)
        return Response(ProductSerializer(product).data)

class CreateProductView(APIView):
    def post(self, request):
        serializer = ProductSerializer(data=request.data)

        if serializer.is_valid():
            product = serializer.save()
            return Response(
                ProductSerializer(product).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class TestView(APIView):
    def get(self, request):
        all_prods = ProductInfo.objects.all()

        return Response(ProductSerializer(all_prods, many=True).data)
