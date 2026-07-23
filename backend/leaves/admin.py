from django.contrib import admin
from .models import Leave


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ("employee", "start_date", "end_date", "status", "applied_at", "decided_by")
    list_filter = ("status",)
    search_fields = ("employee__username", "employee__first_name", "employee__last_name", "reason")
