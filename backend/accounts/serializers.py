from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds role/name claims to the JWT and to the login response body."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.get_full_name() or user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    manager_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "manager",
            "manager_name",
            "annual_leave_quota",
            "date_joined_company",
        )
        read_only_fields = ("id", "role")

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_manager_name(self, obj):
        return obj.manager.get_full_name() if obj.manager else None


class EmployeeListSerializer(serializers.ModelSerializer):
    """Slim representation used in manager's employee list / search."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "full_name", "role", "annual_leave_quota")

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class ManagerListSerializer(serializers.ModelSerializer):
    """Used in the registration form to list available managers."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "full_name")

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class RegisterSerializer(serializers.Serializer):
    """Handles user registration for both Employee and Manager roles."""

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8, label="Confirm password")
    role = serializers.ChoiceField(choices=User.Role.choices)
    manager = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.MANAGER),
        required=False,
        allow_null=True,
    )

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        # Employees should ideally have a manager, but it's not strictly required
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
