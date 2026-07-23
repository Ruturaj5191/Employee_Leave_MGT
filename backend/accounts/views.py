from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsManager
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    EmployeeListSerializer,
    ManagerListSerializer,
    RegisterSerializer,
)

User = get_user_model()


# LoginView must stay class-based (extends SimpleJWT's TokenObtainPairView)
class LoginView(TokenObtainPairView):
    """POST {username, password} -> {access, refresh, user}"""

    serializer_class = CustomTokenObtainPairSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """Public registration for employees and managers."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(
        {
            "message": "Registration successful. You can now sign in.",
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def manager_list_view(request):
    """Public list of managers – used in the registration form dropdown."""
    managers = User.objects.filter(role=User.Role.MANAGER).order_by("first_name", "username")
    serializer = ManagerListSerializer(managers, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Return the authenticated user's profile."""
    return Response(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsManager])
def employee_list_view(request):
    """Manager-only: searchable list of employees in the manager's team."""
    queryset = User.objects.filter(
        role=User.Role.EMPLOYEE, manager=request.user
    ).order_by("first_name", "username")

    # Simple search support
    search = request.query_params.get("search", "").strip()
    if search:
        from django.db.models import Q
        queryset = queryset.filter(
            Q(username__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
            | Q(email__icontains=search)
        )

    serializer = EmployeeListSerializer(queryset, many=True)
    return Response(serializer.data)

