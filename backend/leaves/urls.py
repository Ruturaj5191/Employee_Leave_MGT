from django.urls import path
from . import views

urlpatterns = [
    path("leaves/", views.leave_list_create, name="leave-list-create"),
    path("leaves/<int:pk>/", views.leave_detail_cancel, name="leave-detail-cancel"),
    path("leaves/<int:pk>/approve/", views.leave_approve, name="leave-approve"),
    path("leaves/<int:pk>/reject/", views.leave_reject, name="leave-reject"),
    path("dashboard/employee/", views.employee_dashboard, name="employee-dashboard"),
    path("dashboard/manager/", views.manager_dashboard, name="manager-dashboard"),
    path("stats/employees/", views.employee_leave_stats, name="employee-leave-stats"),
]
