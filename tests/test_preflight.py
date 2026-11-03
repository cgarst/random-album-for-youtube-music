"""
Unit tests for preflight_check.py
"""

import os
import sys
import unittest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO_ROOT, "bin"))

from preflight_check import (
    parse_version_tuple,
    validate_version_format,
    load_manifest,
    CHROMIUM_MANIFEST,
    FIREFOX_MANIFEST,
)


class TestPreflightCheck(unittest.TestCase):
    def test_version_format_validation(self):
        self.assertTrue(validate_version_format("1.0"))
        self.assertTrue(validate_version_format("1.1.0"))
        self.assertTrue(validate_version_format("2.3.4.5"))
        self.assertFalse(validate_version_format("v1.0"))
        self.assertFalse(validate_version_format("1"))
        self.assertFalse(validate_version_format("1.0.0.0.1"))
        self.assertFalse(validate_version_format("alpha-1"))

    def test_version_tuple_parsing(self):
        self.assertEqual(parse_version_tuple("1.1"), (1, 1, 0, 0))
        self.assertEqual(parse_version_tuple("v1.1.0"), (1, 1, 0, 0))
        self.assertEqual(parse_version_tuple("1.2"), (1, 2, 0, 0))
        self.assertTrue(parse_version_tuple("1.2") > parse_version_tuple("1.1.0"))
        self.assertTrue(parse_version_tuple("1.1.1") > parse_version_tuple("1.1"))
        self.assertEqual(parse_version_tuple("1.1"), parse_version_tuple("v1.1.0"))

    def test_current_manifests_in_sync(self):
        chrom = load_manifest(CHROMIUM_MANIFEST, "Chromium")
        ff = load_manifest(FIREFOX_MANIFEST, "Firefox")
        self.assertEqual(
            chrom.get("version"),
            ff.get("version"),
            "Chromium and Firefox manifests must have identical version numbers!",
        )


if __name__ == "__main__":
    unittest.main()
