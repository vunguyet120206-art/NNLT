#!/bin/bash

# Setup script for backend

echo "Setting up Hero Lab Backend..."

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Install Python modules dependencies
echo "Installing Python modules dependencies..."
cd ../python
pip install -r requirements.txt
cd ../backend

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Create superuser (optional)
echo "Creating superuser..."
python manage.py createsuperuser --noinput --email admin@example.com --username admin 2>/dev/null || echo "Superuser already exists or creation failed"

echo "Setup complete!"
echo "To start the server, run: python manage.py runserver"

