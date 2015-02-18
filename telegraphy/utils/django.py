
def get_user(context):
    """Gets user id and username from context"""
    user = context['request'].user
    if user.is_authenticated():
        user_data = (user.pk, user.username)
    else:
        user_data = (None, None)
    return user_data


def extract_host_from_request(request):
    """Extracts host from possible Django request"""
    host = None
    if not request.is_secure():
        host = request.META['HTTP_HOST']
    else:
        host = request.META['HTTPS_HOST']
    if ':' in host:
        host = host.split(':')[0]
    return host
