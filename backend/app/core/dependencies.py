"""
Shared FastAPI dependencies — the auth guard lives here.

`get_current_user` decodes the Bearer JWT from the Authorization header,
loads the user row, and returns it. Any route can opt-in to auth with
`user: User = Depends(get_current_user)`.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User


# tokenUrl is just metadata for the OpenAPI docs ("Authorize" button).
# We accept any Bearer token regardless of where it was minted.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Resolve the authenticated user from the request's Bearer token."""
    if not token:
        raise _credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise _credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise _credentials_exception

    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        raise _credentials_exception

    result = await db.execute(select(User).where(User.id == user_id_int))
    user = result.scalar_one_or_none()
    if user is None:
        raise _credentials_exception
    return user
