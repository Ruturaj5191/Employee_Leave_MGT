from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView

from .views import LoginView, register_view, manager_list_view, me_view, employee_list_view

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("register/", register_view, name="register"),
    path("managers/", manager_list_view, name="manager-list"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("me/", me_view, name="me"),
    path("employees/", employee_list_view, name="employee-list"),
]


