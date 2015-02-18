.. meerkat documentation master file, created by
   sphinx-quickstart on Tue Sep 24 15:51:53 2013.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Telegraphy's documentation!
======================================

*Project home:* `https://github.com/machinalis/telegraphy/ <https://github.com/machinalis/telegraphy/>`__

:doc:`intro` provides real time events for WSGI Python applications with additional
features such as event filtering, subscription persistence and authorization/authentication.

It's initially intended for Django but you can extend it to any WSGI framework.

WebSocket pub/sub and RPC is based on AutobahnPython_ implementation of `WAMP protocol`_

.. _AutobahnPython: http://autobahn.ws/

.. _WAMP Protocol: http://wamp.ws/


Getting It
==========

You can get *Telegraphy* by using pip::

 $ pip install telegraphy

Or grab the source code from the GitHub repository and run setup.py::

 $ git clone git://github.com/machinalis/telegraphy.git
 $ cd telegraphy
 $ python setup.py install

For more detailed instructions check out our :doc:`installation_instructions`. Enjoy.


Get Involved
==============

We are eager to hear from the community: to receive suggestions, bug-reports, participate in discussions and
improve Telegraphy as much as it's possible.

For all of that, we have a Google group in http://groups.google.com/group/telegraphy

Also, to guide the development efforts and issues, we are using
`GitHub's issue tracker <https://github.com/machinalis/telegraphy/issues>`__.


Contents
========

.. toctree::
   :maxdepth: 3

   installation_instructions
   intro
   gateway
   django-telegraphy
   examples
   wamp


Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
