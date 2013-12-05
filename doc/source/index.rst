.. meerkat documentation master file, created by
   sphinx-quickstart on Tue Sep 24 15:51:53 2013.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Telegraphy's documentation!
======================================

Telegraphy provides real time events for WSGI Python applications with additional
features such as event filtering, subscription persistence and authorization/authentication.

It's initially intended for Django but you can extend it to any WSGI framework.

WebSocket pub/sub and RPC is based on AutobahnPython_ implementation of `WAMP protocol`_

.. _AutobahnPython: http://autobahn.ws/

.. _WAMP Protocol: http://wamp.ws/


:doc:`intro`

:doc:`wamp`

:doc:`examples`

.. toctree::
   :maxdepth: 3


Getting It
==========

You can get *Telegraphy* by using pip::

 $ pip install telegraphy

Or grab the source code from the GitHub repository and run setup.py::

 $ git clone git://github.com/machinalis/telegraphy/telegraphy.git
 $ cd telegraphy
 $ python setup.py install

For more detailed instructions check out our :doc:`installation_instructions`. Enjoy.

Contents
========

.. toctree::
   :maxdepth: 3

   installation_instructions
   intro
   wamp

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
