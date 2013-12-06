# encoding: utf-8

from setuptools import setup, find_packages
import os

with open('requirements.txt', 'rb') as fp:
    requirements = [req for req in fp.read().split() if req]


def fullsplit(path, result=None):
    """
    Split a pathname into components (the opposite of os.path.join)
    in a platform-neutral way.
    """
    if result is None:
        result = []
    head, tail = os.path.split(path)
    if head == '':
        return [tail] + result
    if head == path:
        return result
    return fullsplit(head, [tail] + result)


EXCLUDE_FROM_PACKAGES = ['django.demo_project', ]


def is_package(package_name):
    for pkg in EXCLUDE_FROM_PACKAGES:
        if package_name.startswith(pkg):
            return False
    return True


# Compile the list of packages available, because distutils doesn't have
# an easy way to do this.
packages, package_data = [], {}

root_dir = os.path.dirname(__file__)
if root_dir != '':
    os.chdir(root_dir)
telegraphy_dir = 'telegraphy'

for dirpath, dirnames, filenames in os.walk(telegraphy_dir):
    # Ignore PEP 3147 cache dirs and those whose names start with '.'
    dirnames[:] = [d for d in dirnames if not d.startswith('.') and d != '__pycache__']
    parts = fullsplit(dirpath)
    package_name = '.'.join(parts)
    if '__init__.py' in filenames and is_package(package_name):
        packages.append(package_name)
    elif filenames:
        relative_path = []
        while '.'.join(parts) not in packages:
            relative_path.append(parts.pop())
        relative_path.reverse()
        path = os.path.join(*relative_path)
        package_files = package_data.setdefault('.'.join(parts), [])
        package_files.extend([os.path.join(path, f) for f in filenames])


# Filter does not work, workarround
packages = [p for p in find_packages() if not 'demo_project' in p]

setup(
    name='telegraphy',
    version='0.1.2.7',
    description=('Telegraphy - Real Time Events For Django.'),
    long_description=open('README.rst').read(),
    changelog='',
    license='Apache License 2.0',
    author='Nahuel Defossé',
    author_email='nahuel.defosse@gmail.com',
    url='http://telegraphy.machinalis.com',
    platforms=('Any'),
    install_requires = requirements,
    packages = packages,
    include_package_data=True,
    package_data=package_data,
    #package_data={'telegraphy.contrib.django_telegraphy': ['templates/*.*']},
    #data_files=[('telegraphy/contrib/django_telegraphy', glob('templates/*.html'))],

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
