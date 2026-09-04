from setuptools import setup, find_packages

VERSION = '0.3.0'

# The distribution is renamed from the upstream `mkdocs-bootstrap4` to
# `mkdocs-nerva`: the old name is owned by byrnereese/mkdocs-bootstrap4 on
# PyPI, and this fork must never collide with it. It is not published; the
# nerva docs site consumes the theme as a vendored directory (theme_dir),
# and `Private :: Do Not Upload` keeps a stray `twine upload` honest.
setup(
    name="mkdocs-nerva",
    version=VERSION,
    url='https://github.com/nerva-project/nerva-docs-theme/',
    license='MIT',
    description="NERVA documentation theme for MkDocs, based on mkdocs-bootstrap4",
    author='Byrne Reese',
    author_email='byrne@majordojo.com',
    packages=find_packages(),
    include_package_data=True,
    install_requires=['mkdocs>=1.4', 'mkdocs-git-committers-plugin>=0.1.3'],
    python_requires='>=3.8',
    classifiers=[
        'Private :: Do Not Upload',
        'License :: OSI Approved :: MIT License',
    ],
    entry_points={
        'mkdocs.themes': [
            'bootstrap4 = mkdocs_bootstrap4',
        ]
    },
    zip_safe=False
)
