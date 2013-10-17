from functools import wraps


@wraps
def for_client(f):
    '''Method decroator to indicate that a view is by the client'''
    return f


@wraps
def for_webapp(f):
    '''Method decroator to indicate that a view is by the webapp'''
    return f
