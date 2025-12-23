"""
URLs for Hero Lab API
"""
from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    
    # User
    path('me/', views.get_current_user, name='get_current_user'),
    
    # Data
    path('upload/', views.upload_file, name='upload_file'),
    path('list/', views.list_data, name='list_data'),
    path('process/<uuid:data_id>/', views.process_data, name='process_data'),
    path('result/<uuid:data_id>/', views.get_result, name='get_result'),
    path('delete/<uuid:data_id>/', views.delete_data, name='delete_data'),
    
    # Calculations
    path('create/', views.create_calculation, name='create_calculation'),
    path('list/', views.list_calculations, name='list_calculations'),
    path('delete/<uuid:calculation_id>/', views.delete_calculation, name='delete_calculation'),
]

