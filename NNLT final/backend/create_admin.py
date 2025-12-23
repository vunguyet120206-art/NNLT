"""
Script to create default admin user
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hero_lab.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin_user():
    """Create default admin user if not exists"""
    email = 'admin@gmail.com'
    username = 'admin'
    password = '1234'
    
    try:
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            print(f"✅ User '{email}' already exists")
            return
        
        # Create superuser
        user = User.objects.create_superuser(
            email=email,
            username=username,
            password=password
        )
        print(f"✅ Created admin user:")
        print(f"   Email: {email}")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        sys.exit(1)

if __name__ == '__main__':
    create_admin_user()

