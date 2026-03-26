"""Supabase JWT verification for FastAPI dependency injection.

Strategy: call supabase.auth.get_user(token) using the admin client
(service role key). This delegates all JWT validation to Supabase itself
— no local signature verification, no dependency on the JWT secret format.

This is the approach recommended by Supabase for backend services:
  https://supabase.com/docs/guides/auth/jwts#verifying-a-jwt-from-a-server
"""

import logging

from fastapi import Header, HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)


def _make_supabase_client():  # type: ignore[no-untyped-def]
    """Import and create the Supabase client lazily.

    Imported inside the function so the module loads even if
    supabase-py is not installed yet during early bootstrap.
    """
    from supabase import create_client  # type: ignore[import-untyped]

    return create_client(settings.supabase_url, settings.supabase_service_key)


# Single client instance reused across requests
_supabase_client = None


def _get_client():  # type: ignore[no-untyped-def]
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = _make_supabase_client()
    return _supabase_client


async def get_current_user_id(
    authorization: str = Header(..., description="Bearer <supabase_jwt>"),
) -> str:
    """FastAPI dependency — validates the Supabase JWT.

    Calls supabase.auth.get_user(token) via the service-role client.
    This asks Supabase to verify the token, so it works regardless of
    whether the project uses Legacy JWT Secret or new JWT Signing Keys.

    Returns the authenticated user's UUID on success.
    Raises HTTP 401 on any failure.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must start with 'Bearer '.",
        )

    token = authorization.removeprefix("Bearer ").strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty token.",
        )

    try:
        client = _get_client()
        response = client.auth.get_user(token)

        if response is None or response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalid or expired.",
            )

        return response.user.id

    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Token verification failed: %s", exc)
        raise HTTPException(  # noqa: B904
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed.",
        )
