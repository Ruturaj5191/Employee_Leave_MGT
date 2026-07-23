from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        EMPLOYEE = "employee", "Employee"
        MANAGER = "manager", "Manager"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.EMPLOYEE)
    manager = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="team_members",
        limit_choices_to={"role": Role.MANAGER},
    )
    annual_leave_quota = models.PositiveIntegerField(default=20)
    date_joined_company = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"

    @property
    def is_manager(self):
        return self.role == self.Role.MANAGER
