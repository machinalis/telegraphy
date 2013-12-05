# encoding: utf-8

from setuptools import setup, find_packages

with open('requirements.txt', 'rb') as fp:
    requirements = [req for req in fp.read().split() if req]

# Filter does not work, workarround
packages = [p for p in find_packages() if not 'demo_project' in p]

setup(
    name='telegraphy',
    version='0.1.2.1',
    description=('Telegraphy - Real Time Events For Django.'),
    long_description=open('README.rst').read(),
    package_data={'': ['requirements.txt']},
    changelog='',
    license='Apache License 2.0',
    author='Nahuel Defossé',
    author_email='nahuel.defosse@gmail.com',
    url='http://telegraphy.machinalis.com',
    platforms=('Any'),
    install_requires = requirements,
    packages = packages,
    zip_safe = False,
    # http://pypi.python.org/pypi?%3Aaction=list_classifiers
    #
    classifiers = ["License :: OSI Approved :: Apache Software License",
                   "Development Status :: 3 - Alpha",
                   "Environment :: Console",
                   "Framework :: Django",
                   "Framework :: Twisted",
                   "Intended Audience :: Developers",
                   "Operating System :: OS Independent",
                   "Programming Language :: Python",
                   "Topic :: Internet",
                   "Topic :: Software Development :: Libraries"],
    keywords = 'django real-time-web websocket wamp'
)
