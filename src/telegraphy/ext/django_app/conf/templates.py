# Gracefyllt borrowed from:
# http://crossbar.io/docs/Adding-Real-Time-to-Django-Applications/
# Since this is Django specific and most of Telegraphy is about configuring things for
# you, there are some Tmeplate logic in this template for easy autoconfiguration.

DEFAULT_CONFIG = '''
{
   "workers": [
      {
         "type": "router",
         "options": {
            "pythonpath": {{ PYTHON_PATH }}
         },
         "realms": [
            {
               "name": "realm1",
               "roles": [
                  {
                     "name": "anonymous",
                     "permissions": [
                        {
                           "uri": "*",
                           "publish": true,
                           "subscribe": true,
                           "call": true,
                           "register": true
                        }
                     ]
                  }
               ]
            }
         ],
         "transports": [
            {
               "type": "web",
               "endpoint": {
                  "type": "tcp",
                  "port": {{ conf.PORT }}
               },
               "paths": {
                  "{{ BASE_URL }}": {
                     "type": "wsgi",
                     "module": "{{ PROJECT_NAME }}.wsgi",
                     "object": "application"
                  },
                  "{{ conf.WS_URL }}": {
                     "type": "websocket",
                     "debug": {% if conf.CROSSBAR_DEBUG %}true{%else%}false{%endif%}
                  },
                  "{{ conf.LONG_POLL_URL }}": {
                     "type": "longpoll"
                  },
                  "notify": {
                     "type": "pusher",
                     "realm": "realm1",
                     "role": "anonymous"
                  }{% if conf.SERVE_STATIC %},
                  "{{ STATIC_URL }}": {
                     "type": "static",
                     "directory": "{{ STATIC_ROOT }}",
                     "options": {
                        "enable_directory_listing": true
                     }
                  }{% endif %}
               }
            }
         ]
      }
   ]
}
'''
