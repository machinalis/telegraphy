from django import template
from django.utils.safestring import mark_safe
from django.template.loader import render_to_string
from .. import conf


register = template.Library()


@register.simple_tag(takes_context=True)
def telegraphy_head(context):
    '''JS inclusions and Telegraphy socket configuration'''

    context = {
        'conf': conf
    }
    return mark_safe(
        render_to_string(
            'telegraphy/tags/telegraphy_head.html',
            context
        )
    )
