from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Leave

User = get_user_model()


class LeaveRuleTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user(
            username="mgr", password="pass12345", role=User.Role.MANAGER
        )
        self.employee = User.objects.create_user(
            username="emp",
            password="pass12345",
            role=User.Role.EMPLOYEE,
            manager=self.manager,
            annual_leave_quota=20,
        )
        self.client.force_authenticate(user=self.employee)

    def apply(self, start, end, reason="Personal work"):
        return self.client.post(
            reverse("leave-list"),
            {"start_date": start, "end_date": end, "reason": reason},
            format="json",
        )

    def test_apply_leave_success(self):
        start = date.today() + timedelta(days=5)
        end = start + timedelta(days=2)
        response = self.apply(start, end)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Leave.objects.count(), 1)

    def test_cannot_apply_for_past_date(self):
        start = date.today() - timedelta(days=1)
        end = date.today()
        response = self.apply(start, end)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_end_date_before_start_date_rejected(self):
        start = date.today() + timedelta(days=5)
        end = start - timedelta(days=1)
        response = self.apply(start, end)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_overlapping_leave_rejected(self):
        start = date.today() + timedelta(days=5)
        end = start + timedelta(days=3)
        self.apply(start, end)
        response = self.apply(start + timedelta(days=1), end + timedelta(days=1))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_exceeding_annual_quota_rejected(self):
        start = date.today() + timedelta(days=5)
        end = start + timedelta(days=25)  # 26 days, over the 20 day quota
        response = self.apply(start, end)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_employee_can_cancel_pending_leave(self):
        start = date.today() + timedelta(days=5)
        end = start + timedelta(days=1)
        create = self.apply(start, end)
        leave_id = create.data["id"]
        response = self.client.delete(reverse("leave-detail", args=[leave_id]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Leave.objects.get(id=leave_id).status, Leave.Status.CANCELLED)

    def test_employee_cannot_see_other_employees_leave(self):
        other = User.objects.create_user(
            username="other", password="pass12345", role=User.Role.EMPLOYEE, manager=self.manager
        )
        Leave.objects.create(
            employee=other,
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=2),
            reason="Trip",
        )
        response = self.client.get(reverse("leave-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 0)


class ManagerApprovalTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user(
            username="mgr2", password="pass12345", role=User.Role.MANAGER
        )
        self.employee = User.objects.create_user(
            username="emp2", password="pass12345", role=User.Role.EMPLOYEE, manager=self.manager
        )
        self.leave = Leave.objects.create(
            employee=self.employee,
            start_date=date.today() + timedelta(days=3),
            end_date=date.today() + timedelta(days=4),
            reason="Family event",
        )

    def test_manager_can_approve_team_leave(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.post(reverse("leave-approve", args=[self.leave.id]))
        self.assertEqual(response.status_code, 200)
        self.leave.refresh_from_db()
        self.assertEqual(self.leave.status, Leave.Status.APPROVED)

    def test_manager_can_reject_team_leave(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.post(reverse("leave-reject", args=[self.leave.id]))
        self.assertEqual(response.status_code, 200)
        self.leave.refresh_from_db()
        self.assertEqual(self.leave.status, Leave.Status.REJECTED)

    def test_employee_cannot_approve_leave(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.post(reverse("leave-approve", args=[self.leave.id]))
        self.assertEqual(response.status_code, 403)

    def test_unrelated_manager_cannot_approve(self):
        other_manager = User.objects.create_user(
            username="mgr3", password="pass12345", role=User.Role.MANAGER
        )
        self.client.force_authenticate(user=other_manager)
        response = self.client.post(reverse("leave-approve", args=[self.leave.id]))
        # Object falls outside this manager's queryset, so DRF returns 404
        # rather than leaking that the leave exists.
        self.assertEqual(response.status_code, 404)
