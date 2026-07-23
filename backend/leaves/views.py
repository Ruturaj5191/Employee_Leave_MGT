from datetime import date

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from accounts.permissions import IsManager
from .models import Leave
from .serializers import LeaveSerializer, LeaveApplySerializer, LeaveDecisionSerializer

User = get_user_model()


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def leave_list_create(request):
    """
    GET: List leaves (Employees see theirs, Managers see their team's)
    POST: Employee applies for a new leave
    """
    user = request.user

    if request.method == "GET":
        # 1. Base Queryset based on role
        if user.is_manager:
            leaves = Leave.objects.filter(employee__manager=user).select_related("employee")
        else:
            leaves = Leave.objects.filter(employee=user)

        # 2. Simple Filtering
        status_param = request.query_params.get("status")
        if status_param:
            leaves = leaves.filter(status=status_param)

        employee_param = request.query_params.get("employee")
        if employee_param:
            leaves = leaves.filter(employee_id=employee_param)

        # 3. Simple Search
        search_param = request.query_params.get("search", "").strip()
        if search_param:
            leaves = leaves.filter(
                Q(reason__icontains=search_param) |
                Q(employee__first_name__icontains=search_param) |
                Q(employee__last_name__icontains=search_param) |
                Q(employee__username__icontains=search_param)
            )

        # 4. Simple Ordering
        ordering_param = request.query_params.get("ordering", "-applied_at")
        allowed_ordering = ["applied_at", "-applied_at", "start_date", "-start_date", "end_date", "-end_date"]
        if ordering_param in allowed_ordering:
            leaves = leaves.order_by(ordering_param)
        else:
            leaves = leaves.order_by("-applied_at")

        serializer = LeaveSerializer(leaves, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        # Only employees apply for their own leave
        serializer = LeaveApplySerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        leave = serializer.save()
        return Response(LeaveSerializer(leave).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def leave_detail_cancel(request, pk):
    """
    GET: View a specific leave request.
    DELETE: Cancel a pending leave request (only by the employee who applied).
    """
    leave = get_object_or_404(Leave, pk=pk)
    user = request.user

    # Permission check for object access
    if not user.is_manager and leave.employee_id != user.id:
        return Response({"detail": "You do not have permission to access this leave."}, status=status.HTTP_403_FORBIDDEN)
    
    if user.is_manager and leave.employee.manager_id != user.id and leave.employee_id != user.id:
        return Response({"detail": "You do not have permission to access this leave."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        serializer = LeaveSerializer(leave)
        return Response(serializer.data)

    elif request.method == "DELETE":
        if leave.employee_id != user.id:
            return Response({"detail": "You can only cancel your own leave requests."}, status=status.HTTP_403_FORBIDDEN)
        if leave.status != Leave.Status.PENDING:
            return Response({"detail": "Only pending leave requests can be cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        
        leave.status = Leave.Status.CANCELLED
        leave.save(update_fields=["status"])
        return Response(LeaveSerializer(leave).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsManager])
def leave_approve(request, pk):
    """Manager approves a leave request from their team."""
    leave = get_object_or_404(Leave, pk=pk)
    
    if leave.employee.manager_id != request.user.id:
        return Response({"detail": "You can only decide on your own team's requests."}, status=status.HTTP_403_FORBIDDEN)
    
    if leave.status != Leave.Status.PENDING:
        return Response({"detail": "Only pending requests can be approved."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = LeaveDecisionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    leave.status = Leave.Status.APPROVED
    leave.decided_by = request.user
    leave.decided_at = timezone.now()
    leave.decision_note = serializer.validated_data.get("decision_note", "")
    leave.save()
    return Response(LeaveSerializer(leave).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsManager])
def leave_reject(request, pk):
    """Manager rejects a leave request from their team."""
    leave = get_object_or_404(Leave, pk=pk)
    
    if leave.employee.manager_id != request.user.id:
        return Response({"detail": "You can only decide on your own team's requests."}, status=status.HTTP_403_FORBIDDEN)
    
    if leave.status != Leave.Status.PENDING:
        return Response({"detail": "Only pending requests can be rejected."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = LeaveDecisionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    leave.status = Leave.Status.REJECTED
    leave.decided_by = request.user
    leave.decided_at = timezone.now()
    leave.decision_note = serializer.validated_data.get("decision_note", "")
    leave.save()
    return Response(LeaveSerializer(leave).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def employee_dashboard(request):
    """Employee dashboard showing leave summary and recent requests."""
    user = request.user
    year = date.today().year
    leaves = Leave.objects.filter(employee=user, start_date__year=year)

    approved_days = sum(l.days for l in leaves.filter(status=Leave.Status.APPROVED))
    pending_days = sum(l.days for l in leaves.filter(status=Leave.Status.PENDING))
    quota = user.annual_leave_quota

    return Response(
        {
            "annual_quota": quota,
            "approved_leaves": approved_days,
            "pending_leaves": pending_days,
            "remaining_leave": max(quota - approved_days - pending_days, 0),
            "recent_requests": LeaveSerializer(leaves.order_by("-applied_at")[:5], many=True).data,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsManager])
def manager_dashboard(request):
    """Manager dashboard showing team's pending requests and daily approvals."""
    manager = request.user
    team_leaves = Leave.objects.filter(employee__manager=manager)
    today = timezone.now().date()

    return Response(
        {
            "pending_requests": team_leaves.filter(status=Leave.Status.PENDING).count(),
            "approved_today": team_leaves.filter(
                status=Leave.Status.APPROVED, decided_at__date=today
            ).count(),
            "total_employees": User.objects.filter(manager=manager).count(),
            "recent_requests": LeaveSerializer(
                team_leaves.order_by("-applied_at")[:5], many=True
            ).data,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsManager])
def employee_leave_stats(request):
    """Manager-only: per-employee leave statistics (used/remaining) for the team."""
    manager = request.user
    year = date.today().year
    stats = []
    
    for employee in User.objects.filter(manager=manager):
        leaves = Leave.objects.filter(employee=employee, start_date__year=year)
        approved_days = sum(l.days for l in leaves.filter(status=Leave.Status.APPROVED))
        pending_days = sum(l.days for l in leaves.filter(status=Leave.Status.PENDING))
        
        stats.append(
            {
                "employee_id": employee.id,
                "employee_name": employee.get_full_name() or employee.username,
                "annual_quota": employee.annual_leave_quota,
                "approved_days": approved_days,
                "pending_days": pending_days,
                "remaining_days": max(employee.annual_leave_quota - approved_days - pending_days, 0),
            }
        )
        
    return Response(stats)
