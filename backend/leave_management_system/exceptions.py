from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Wraps DRF's default exception handler to return a consistent
    {"detail": ..., "errors": {...}} shape the frontend can rely on.
    """
    response = exception_handler(exc, context)

    if response is not None:
        data = response.data
        if isinstance(data, dict) and "detail" in data and len(data) == 1:
            response.data = {"detail": data["detail"]}
        else:
            detail = data.get("detail") if isinstance(data, dict) else None
            response.data = {
                "detail": detail or "Validation failed.",
                "errors": data,
            }
    return response
