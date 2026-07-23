from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from leaves.models import Leave

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="alice", password="StrongPass1", role=User.Role.EMPLOYEE
        )

    def test_login_returns_tokens_and_user(self):
        response = self.client.post(
            reverse("login"), {"username": "alice", "password": "StrongPass1"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["username"], "alice")

    def test_login_invalid_credentials(self):
        response = self.client.post(
            reverse("login"), {"username": "alice", "password": "wrong"}, format="json"
        )
        self.assertEqual(response.status_code, 401)

    def test_me_requires_authentication(self):
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, 401)

    def test_me_returns_profile_when_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "alice")


class DashboardTests(APITestCase):
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
        Leave.objects.create(
            employee=self.employee,
            start_date=date.today() + timedelta(days=2),
            end_date=date.today() + timedelta(days=3),
            reason="Trip",
            status=Leave.Status.APPROVED,
        )

    def test_employee_dashboard(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(reverse("employee-dashboard"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["approved_leaves"], 2)
        self.assertEqual(response.data["remaining_leave"], 18)

    def test_manager_dashboard(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.get(reverse("manager-dashboard"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_employees"], 1)

    def test_employee_cannot_access_manager_dashboard(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(reverse("manager-dashboard"))
        self.assertEqual(response.status_code, 403)
