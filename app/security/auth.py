import os

from clerk_backend_api import AuthenticateRequestOptions, authenticate_request


def authenticate_user(request):
    """
    Verify a Clerk session token attached to an incoming request.

    Returns:
        RequestState when authentication succeeds.

    Raises:
        RuntimeError when Clerk configuration is missing.
        PermissionError when the request is not authenticated.
    """

    secret_key = os.getenv("CLERK_SECRET_KEY")
    jwt_key = os.getenv("CLERK_JWT_KEY")
    publishable_key = os.getenv("CLERK_PUBLISHABLE_KEY")

    authorized_parties = os.getenv("CLERK_AUTHORIZED_PARTIES", "")

    if not secret_key and not jwt_key:
        raise RuntimeError(
            "Clerk authentication is not configured. "
            "Set CLERK_SECRET_KEY or CLERK_JWT_KEY."
        )

    if not publishable_key:
        raise RuntimeError(
            "CLERK_PUBLISHABLE_KEY is not configured."
        )

    parties = [
        party.strip()
        for party in authorized_parties.split(",")
        if party.strip()
    ]

    if not parties:
        raise RuntimeError(
            "CLERK_AUTHORIZED_PARTIES is not configured."
        )

    options = AuthenticateRequestOptions(
        secret_key=secret_key,
        jwt_key=jwt_key,
        publishable_key=publishable_key,
        authorized_parties=parties,
    )

    state = authenticate_request(
        request,
        options,
    )

    if not state.is_authenticated:
        raise PermissionError("Authentication required.")

    return state