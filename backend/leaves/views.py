from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsManager
from .models import Leave
from .permissions import IsOwnerEmployeeOrManager
from .serializers import LeaveSerializer, LeaveApplySerializer, LeaveDecisionSerializer

User = get_user_model()


class LeaveViewSet(viewsets.ModelViewSet):
    """
    Employees: see + manage their own leave requests (apply, view history, cancel pending).
    Managers: see their team's requests (filterable by status), approve/reject, view stats.
    """

    permission_classes = [IsAuthenticated, IsOwnerEmployeeOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "employee"]
    search_fields = ["reason", "employee__first_name", "employee__last_name", "employee__username"]
    ordering_fields = ["applied_at", "start_date", "end_date"]
    ordering = ["-applied_at"]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        if user.is_manager:
            return Leave.objects.filter(employee__manager=user).select_related("employee")
        return Leave.objects.filter(employee=user)

    def get_serializer_class(self):
        if self.action == "create":
            return LeaveApplySerializer
        return LeaveSerializer

    def create(self, request, *args, **kwargs):
        # Only employees apply for their own leave.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        leave = serializer.save()
        return Response(LeaveSerializer(leave).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """Cancel: employees can only delete their own PENDING leave."""
        leave = self.get_object()
        if leave.employee_id != request.user.id:
            return Response({"detail": "You can only cancel your own leave requests."}, status=403)
        if leave.status != Leave.Status.PENDING:
            return Response({"detail": "Only pending leave requests can be cancelled."}, status=400)
        leave.status = Leave.Status.CANCELLED
        leave.save(update_fields=["status"])
        return Response(LeaveSerializer(leave).data, status=200)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsManager])
    def approve(self, request, pk=None):
        leave = self.get_object()
        if leave.employee.manager_id != request.user.id:
            return Response({"detail": "You can only decide on your own team's requests."}, status=403)
        if leave.status != Leave.Status.PENDING:
            return Response({"detail": "Only pending requests can be approved."}, status=400)

        serializer = LeaveDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        leave.status = Leave.Status.APPROVED
        leave.decided_by = request.user
        leave.decided_at = timezone.now()
        leave.decision_note = serializer.validated_data.get("decision_note", "")
        leave.save()
        return Response(LeaveSerializer(leave).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsManager])
    def reject(self, request, pk=None):
        leave = self.get_object()
        if leave.employee.manager_id != request.user.id:
            return Response({"detail": "You can only decide on your own team's requests."}, status=403)
        if leave.status != Leave.Status.PENDING:
            return Response({"detail": "Only pending requests can be rejected."}, status=400)

        serializer = LeaveDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        leave.status = Leave.Status.REJECTED
        leave.decided_by = request.user
        leave.decided_at = timezone.now()
        leave.decision_note = serializer.validated_data.get("decision_note", "")
        leave.save()
        return Response(LeaveSerializer(leave).data)


class EmployeeDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
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


class ManagerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
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


class EmployeeLeaveStatsView(APIView):
    """Manager-only: per-employee leave statistics (used/remaining) for the team."""

    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
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
