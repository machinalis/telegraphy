def build_url_from_settings(settings):
    """Constructs web socket urls from settings"""
    # TODO: Configure in settings
    is_secure = settings.TELEGRAPHY_IS_SECURE
    proto = 'wss' if is_secure else 'ws'
    url_parts = [proto,
                '://',
                (settings.TELEGRAPHY_WS_HOST or 'localhost'),
                ':',
                str(settings.TELEGRAPHY_WS_PORT),
                '/',
                (settings.TELEGRAPHY_WS_URI or '')]
    return ''.join(url_parts)

def check_valid_settings(settings):
    """Validate sane settings"""
    return True


def extract_host_from_request(request):
    host = None
    if not request.is_secure():
        host = request.META['HTTP_HOST']
    else:
        host = request.META['HTTPS_HOST']
    if ':' in host:
        host = host.split(':')[0]
    return host