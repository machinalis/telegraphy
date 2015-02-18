

class Client(object):
    def __init__(self, transport=None, gateway=None):
        """Generic Client"""
        self.sequence_id = None
        self.session_token = None
        self.subscriptions = []

    def on_open(self):
        pass

    def on_message(self, json_message):
        pass

    def on_close(self):
        pass

    _state = None

    @property
    def state(self):
        return self._state

    @state.setter
    def state(self, new_state):
        assert new_state in MEERKAT_PROTOCOL_STATES
        self._state = new_state