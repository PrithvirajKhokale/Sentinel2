"""Run the complete regression suite; CI must not silently skip the database."""
import os
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

if __name__ == "__main__":
    if not os.environ.get("BACKEND_TEST_DATABASE_URL"):
        raise SystemExit("BACKEND_TEST_DATABASE_URL is required for the complete backend gate")
    suite = unittest.defaultTestLoader.discover(str(ROOT / "tests"))
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() and not result.skipped else 1)
