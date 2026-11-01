from django.urls import path
from .views import *

# change str to uuid later
urlpatterns = [
    path('', TestView.as_view()), 
    path('create/', CreateProductView.as_view()),
    path('<uuid:productId>/', ProductInfoView.as_view()),
]