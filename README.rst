Meerkat
=======

Project home: http://github.com/...

This projects aims to facilitate the integration of real-time features into a Django project.

Several tools and protocols are bundled together to provide a simple interface where to register your models. Then, through the provided
JavaScript API you can connect callbacks that will be executed every time your model instances are created, updated or deleted.

Or what's more, you can easily define custom events (server side) and _emit_ them whenever you want: your JS on the front-end will be notified
in real time!



Installation
============

Just get it:

.. code-block:: none

    pip install meerkat


You will need to have pip installed on your system. On linux install the
python-pip package, on windows follow `this <http://stackoverflow.com/questions/4750806/how-to-install-pip-on-windows>`_.
Also, if you are on linux and not working with a virtualenv, remember to use
``sudo`` for both commands (``sudo pip install ...``).

Examples
========

Meerkat allows you to define problems and look for the solution with
different strategies. Another samples are in the ``samples`` directory, but
here is an easy one.

This problem tries to create the string "HELLO WORLD" using the A* algorithm:

.. code-block:: python


    from simpleai.search import SearchProblem, astar

    GOAL = 'HELLO WORLD'


    class HelloProblem(SearchProblem):
        def actions(self, state):
            if len(state) < len(GOAL):
                return list(' ABCDEFGHIJKLMNOPQRSTUVWXYZ')
            else:
                return []

        def result(self, state, action):
            return state + action

        def is_goal(self, state):
            return state == GOAL

        def heuristic(self, state):
            # how far are we from the goal?
            wrong = sum([1 if state[i] != GOAL[i] else 0
                        for i in range(len(state))])
            missing = len(GOAL) - len(state)
            return wrong + missing

    problem = HelloProblem(initial_state='')
    result = astar(problem)

    print result.state
    print result.path()


More detailed documentation
===========================

You can read the docs online `here <http://simpleai.readthedocs.org/en/latest/>`_. Or for offline access, you can clone the project code repository and read them from the ``docs`` folder.

Help and discussion
===================

Join us at the Meerkat `google group <http://groups.google.com/group/simpleai>`_.


Authors
=======

* Many people you can find on the `contributors section <https://github.com/simpleai-team/simpleai/graphs/contributors>`_.
* Special acknowledgements to `Machinalis <http://www.machinalis.com/>`_ for the time provided to work on this project. Machinalis also works on some other very interesting projects, like `Quepy <http://quepy.machinalis.com/>`_ and `more <https://github.com/machinalis>`_.