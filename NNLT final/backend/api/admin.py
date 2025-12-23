"""
Admin configuration for Hero Lab API
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, SignalData

admin.site.register(User, BaseUserAdmin)

@admin.register(SignalData)
class SignalDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'file_name', 'file_size', 'uploaded_at', 'processed_at')
    list_filter = ('uploaded_at', 'processed_at')
    search_fields = ('file_name', 'user__email')

