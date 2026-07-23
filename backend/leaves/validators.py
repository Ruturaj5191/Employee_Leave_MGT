from datetime import date

from django.conf import settings
from rest_framework import serializers

from .models import Leave


def validate_leave_request(employee, start_date, end_date, exclude_leave_id=None):
    """
    Enforces the leave rules from the spec:
      - Maximum annual leaves (default 20) per calendar year
      - Cannot apply for past dates
      - End date cannot be before start date
      - Cannot overlap with an existing approved (or pending) leave
    Raises serializers.ValidationError on failure.
    """
    errors = {}

    if end_date < start_date:
        errors["end_date"] = "End date cannot be before start date."

    if start_date < date.today():
        errors["start_date"] = "Cannot apply for leave on a past date."

    if errors:
        raise serializers.ValidationError(errors)

    requested_days = (end_date - start_date).days + 1

    # Overlap check against approved or pending leaves in the same year
    overlap_qs = Leave.objects.filter(
        employee=employee,
        status__in=[Leave.Status.APPROVED, Leave.Status.PENDING],
        start_date__lte=end_date,
        end_date__gte=start_date,
    )
    if exclude_leave_id:
        overlap_qs = overlap_qs.exclude(id=exclude_leave_id)

    if overlap_qs.exists():
        raise serializers.ValidationError(
            {"non_field_errors": "This leave request overlaps with an existing pending or approved leave."}
        )

    # Annual quota check: sum of approved + pending days this calendar year
    year = start_date.year
    used_days = sum(
        leave.days
        for leave in Leave.objects.filter(
            employee=employee,
            status__in=[Leave.Status.APPROVED, Leave.Status.PENDING],
            start_date__year=year,
        )
    )
    quota = getattr(employee, "annual_leave_quota", None) or getattr(
        settings, "MAX_ANNUAL_LEAVES", 20
    )

    if used_days + requested_days > quota:
        remaining = max(quota - used_days, 0)
        raise serializers.ValidationError(
            {
                "non_field_errors": (
                    f"This request exceeds your annual leave quota. "
                    f"You have {remaining} day(s) remaining out of {quota} for {year}."
                )
            }
        )
