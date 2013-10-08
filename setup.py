# encoding: utf-8

from setuptools import setup, find_packages

with open('requirements.txt', 'rb') as fp:
     requirements = [req for req in fp.read().split() if req]

# Filter does not work, workarround
packages = [p for p in find_packages() if not 'demo_project' in p]

setup (
   name = 'telegraphy',
   version = '0.1',
   description = 'Telegraphy - Real Time Events For WSGI.',
   #long_description = 'LONGSDESC',
   license = 'Apache License 2.0',
   author = 'Nahuel Defossé',
   author_email = 'ndefosse@machinalis.com',
   url = 'http://telegraphy.machinalis.com',
   platforms = ('Any'),
   install_requires = ['setuptools', 'Twisted>=11.1'],
   packages = packages,
   #package_dir = {'telegrapy': './telegrapy'},
   zip_safe = False,
   ## http://pypi.python.org/pypi?%3Aaction=list_classifiers
   ##
   classifiers = ["License :: OSI Approved :: Apache Software License",
                  "Development Status :: 5 - Production/Stable",
                  "Environment :: Console",
                  "Framework :: Twisted",
                  "Intended Audience :: Developers",
                  "Operating System :: OS Independent",
                  "Programming Language :: Python",
                  "Topic :: Internet",
                  "Topic :: Software Development :: Libraries"],
   keywords = 'django real-time websocket wamp'
)
