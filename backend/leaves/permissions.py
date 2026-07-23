from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerEmployeeOrManager(BasePermission):
    """
    Employees may only see/act on their own leave requests.
    Managers may view all requests from their team and approve/reject them.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_manager:
            return obj.employee.manager_id == user.id or request.method in SAFE_METHODS
        return obj.employee_id == user.id
