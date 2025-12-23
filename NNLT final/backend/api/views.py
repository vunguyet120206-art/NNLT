"""
Views for Hero Lab API
"""
import os
import sys
import json
from pathlib import Path
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import SignalData, CalculationData
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    SignalDataSerializer,
    SignalDataUploadSerializer,
    CalculationDataSerializer,
    CalculationDataInputSerializer
)

User = get_user_model()

# Add Python modules to path
PYTHON_MODULES_PATH = Path(__file__).resolve().parent.parent.parent.parent / 'python'
if str(PYTHON_MODULES_PATH) not in sys.path:
    sys.path.insert(0, str(PYTHON_MODULES_PATH))

# Lazy import - will be imported when needed
def get_preprocessing_modules():
    """Lazy import of preprocessing modules"""
    from preprocessing.processor import process_signal_file
    from calculator.metrics import calculate_all_metrics
    return process_signal_file, calculate_all_metrics


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login"""
    from django.contrib.auth import authenticate
    
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Since USERNAME_FIELD is 'email', authenticate with email as username
    user = authenticate(username=email, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user"""
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    """Upload signal data file"""
    serializer = SignalDataUploadSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    uploaded_file = request.FILES['file']
    
    # Validate file extension
    if not uploaded_file.name.endswith('.txt'):
        return Response(
            {'error': 'Only .txt files are allowed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Save file
    signal_data = SignalData.objects.create(
        user=request.user,
        original_file=uploaded_file,
        file_name=uploaded_file.name,
        file_size=uploaded_file.size
    )
    
    return Response(
        SignalDataSerializer(signal_data).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_data(request, data_id):
    """Process uploaded signal data"""
    try:
        signal_data = SignalData.objects.get(id=data_id, user=request.user)
    except SignalData.DoesNotExist:
        return Response(
            {'error': 'Signal data not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get file path
    file_path = signal_data.original_file.path
    
    try:
        # Import modules
        process_signal_file, calculate_all_metrics = get_preprocessing_modules()
        
        # Preprocess
        processed_data = process_signal_file(file_path)
        
        # Calculate metrics
        metrics = calculate_all_metrics(processed_data)
        
        # Save results
        signal_data.processed_data = processed_data
        signal_data.metrics = metrics
        from django.utils import timezone
        signal_data.processed_at = timezone.now()
        signal_data.save()
        
        return Response({
            'id': str(signal_data.id),
            'processed_data': processed_data,
            'metrics': metrics
        })
    
    except Exception as e:
        return Response(
            {'error': f'Processing failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_result(request, data_id):
    """Get processing result"""
    try:
        signal_data = SignalData.objects.get(id=data_id, user=request.user)
    except SignalData.DoesNotExist:
        return Response(
            {'error': 'Signal data not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not signal_data.processed_data:
        return Response(
            {'error': 'Data not processed yet'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({
        'id': str(signal_data.id),
        'file_name': signal_data.file_name,
        'processed_data': signal_data.processed_data,
        'metrics': signal_data.metrics,
        'processed_at': signal_data.processed_at
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_data(request):
    """List all signal data for current user"""
    signal_data_list = SignalData.objects.filter(user=request.user)
    serializer = SignalDataSerializer(signal_data_list, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_data(request, data_id):
    """Delete signal data file"""
    try:
        signal_data = SignalData.objects.get(id=data_id, user=request.user)
    except SignalData.DoesNotExist:
        return Response(
            {'error': 'Signal data not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Delete the file from storage
    if signal_data.original_file:
        try:
            signal_data.original_file.delete(save=False)
        except Exception as e:
            # Log error but continue with deletion
            print(f"Error deleting file: {e}")
    
    # Delete the database record
    signal_data.delete()
    
    return Response(
        {'message': 'Signal data deleted successfully'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_calculation(request):
    """Create a new calculation (HR, PTT, MBP)"""
    serializer = CalculationDataInputSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Import calculation functions
        from calculator.metrics import calculate_all_manual
        
        # Get input values
        ri = serializer.validated_data['ri']
        ri_next = serializer.validated_data['ri_next']
        foot_j = serializer.validated_data['foot_j']
        r_j = serializer.validated_data['r_j']
        h = serializer.validated_data['h']
        file_name = serializer.validated_data.get('file_name', '')
        
        # Calculate results
        results = calculate_all_manual(ri, ri_next, foot_j, r_j, h)
        
        # Validate results
        if not all(key in results for key in ['hr', 'ptt', 'mbp']):
            raise ValueError("Calculation failed: missing results")
        
        # Create calculation record (only save results and file_name)
        try:
            calculation = CalculationData.objects.create(
                user=request.user,
                hr=results['hr'],
                ptt=results['ptt'],
                mbp=results['mbp'],
                file_name=file_name or ''
            )
        except Exception as db_error:
            # If database schema mismatch (old schema still exists), try with old fields
            print(f"Database error (might be old schema): {db_error}")
            # This should not happen if migration ran, but handle gracefully
            raise ValueError(f"Database error: {str(db_error)}. Please run migrations.")
        
        # Verify the calculation was saved correctly
        calculation.refresh_from_db()
        if calculation.hr is None or calculation.ptt is None or calculation.mbp is None:
            raise ValueError("Failed to save calculation results")
        
        print(f"Created calculation {calculation.id} for user {request.user.id}")
        
        return Response(
            CalculationDataSerializer(calculation).data,
            status=status.HTTP_201_CREATED
        )
    
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Calculation failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_calculations(request):
    """List all calculations for current user"""
    try:
        calculations = CalculationData.objects.filter(user=request.user).order_by('-created_at')
        count = calculations.count()
        print(f"Found {count} calculations for user {request.user.id}")
        serializer = CalculationDataSerializer(calculations, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"Error in list_calculations: {e}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Failed to list calculations: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_calculation(request, calculation_id):
    """Delete a calculation"""
    try:
        calculation = CalculationData.objects.get(id=calculation_id, user=request.user)
    except CalculationData.DoesNotExist:
        return Response(
            {'error': 'Calculation not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    calculation.delete()
    
    return Response(
        {'message': 'Calculation deleted successfully'},
        status=status.HTTP_200_OK
    )

