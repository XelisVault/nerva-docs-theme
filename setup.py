from setuptools import setup, find_packages

VERSION = '0.2.0'

setup(
    name="mkdocs-bootstrap4",
    version=VERSION,
    url='https://github.com/nerva-project/nerva-docs-theme/',
    license='MIT',
    description="Bootstrap 4 theme for MkDocs, NERVA edition",
    author='Byrne Reese',
    author_email='byrne@majordojo.com',
    packages=find_packages(),
    include_package_data=True,
    install_requires=['mkdocs>=1.4'],
    python_requires='>=3.8',
    entry_points={
        'mkdocs.themes': [
            'bootstrap4 = mkdocs_bootstrap4',
        ]
    },
    zip_safe=False
)
