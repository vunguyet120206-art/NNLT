"""
WSGI config for hero_lab project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hero_lab.settings')

application = get_wsgi_application()

