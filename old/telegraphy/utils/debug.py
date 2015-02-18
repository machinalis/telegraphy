import sys
from functools import wraps
from traceback import format_exc

__all__ = ['show_traceback']


def show_traceback(f):
    """Decorator for immediate execption reporting on twisted deferreds."""
    @wraps(f)
    def wrapped(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            sys.stderr.write(e)
            sys.stderr.writelines(format_exc())
            raise e
    return wrapped
