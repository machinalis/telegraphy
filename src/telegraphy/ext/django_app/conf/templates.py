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
                  "port": 8080
               },
               "paths": {
                  "/": {
                     "type": "wsgi",
                     "module": "{{ PROJECT_NAME }}.wsgi",
                     "object": "application"
                  },
                  "{{ conf.WS_URL }}": {
                     "type": "websocket",
                     "debug": false
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
