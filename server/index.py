"""
Vercel serverless entrypoint for the fraud detection API.

Vercel's @vercel/python runtime looks for a WSGI callable named `app` in the
file named by vercel.json. The real implementation lives in api.py at the repo
root so that `python api.py` and `gunicorn api:app` keep working unchanged;
this module just puts the repo root on sys.path and re-exports the Flask app.
"""

import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from api import app  # noqa: E402  (path setup must happen first)

__all__ = ['app']
