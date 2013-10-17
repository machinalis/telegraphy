import sys, os
telegraphy_path = os.path.join(os.path.dirname(__file__), '..')
sys.path.append(telegraphy_path)
os.environ['DJANGO_SETTINGS_MODULE'] = 'demo_project.settings'

from telegraphy.contrib.telegraphy_django import settings
from telegraphy import Gateway, BaseEvent

g = Gateway.from_settings(settings)


class SystemEvent(BaseEvent):
    name = 'system'

g.register(SystemEvent)

e = SystemEvent({'a':1})
print e.send()