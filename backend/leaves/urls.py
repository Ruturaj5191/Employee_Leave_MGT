from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    LeaveViewSet,
    EmployeeDashboardView,
    ManagerDashboardView,
    EmployeeLeaveStatsView,
)

router = DefaultRouter()
router.register("leaves", LeaveViewSet, basename="leave")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/employee/", EmployeeDashboardView.as_view(), name="employee-dashboard"),
    path("dashboard/manager/", ManagerDashboardView.as_view(), name="manager-dashboard"),
    path("stats/employees/", EmployeeLeaveStatsView.as_view(), name="employee-leave-stats"),
]
