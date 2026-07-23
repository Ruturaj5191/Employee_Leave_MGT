from rest_framework import serializers

from .models import Leave
from .validators import validate_leave_request


class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    days = serializers.ReadOnlyField()

    class Meta:
        model = Leave
        fields = (
            "id",
            "employee",
            "employee_name",
            "start_date",
            "end_date",
            "days",
            "reason",
            "status",
            "applied_at",
            "decided_at",
            "decided_by",
            "decision_note",
        )
        read_only_fields = (
            "id",
            "employee",
            "status",
            "applied_at",
            "decided_at",
            "decided_by",
        )

    def get_employee_name(self, obj):
        return obj.employee.get_full_name() or obj.employee.username


class LeaveApplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = ("id", "start_date", "end_date", "reason")

    def validate(self, attrs):
        request = self.context["request"]
        validate_leave_request(request.user, attrs["start_date"], attrs["end_date"])
        return attrs

    def create(self, validated_data):
        validated_data["employee"] = self.context["request"].user
        return super().create(validated_data)


class LeaveDecisionSerializer(serializers.Serializer):
    """Used for approve/reject actions."""

    decision_note = serializers.CharField(required=False, allow_blank=True, default="")
