How to run the demo project
===========================

Assuming you have downloaded the repository in your computer and you have virtualenvwrapper
systemwide available:

.. code-block:: bash


	mkvirtualenv test_telegraphy
	(test_telegraphy) $ python setup.py install # You can also run pip install telegraphy
    (test_telegraphy) $ cd demo_project
    (test_telegraphy) $ python manage.py run_telegraph & # You should run it in another terminal
	(test_telegraphy) $ python manage.py runserver
