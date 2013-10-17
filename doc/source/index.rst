.. meerkat documentation master file, created by
   sphinx-quickstart on Tue Sep 24 15:51:53 2013.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Telegraphy's documentation!
===================================

Telegraphy provides a real time events for WSGI Python applications with additional
features such as event filtering, subscription persistance and authorization/authentication.

It's initially intended for Django but you can extend it to any WSGI framework.

WebSocket pub/sub and RPC is based on AutobahnPython_ implementation of `WAMP protocol`_

.. _AutobahnPython: http://autobahn.ws/

.. _WAMP Protocol: http://wamp.ws/


:doc:`intro`

:doc:`wamp`

:doc:`examples`

.. toctree::
   :maxdepth: 3

.. include:: README.rst

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`

