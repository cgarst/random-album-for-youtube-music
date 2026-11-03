#!/usr/bin/env python3
"""
Pre-flight check for Random Album for YouTube Music extension releases.

Validates:
1. Both Chromium and Firefox manifests exist and are valid JSON.
2. Manifest version numbers match exactly between Chromium and Firefox.
3. Version string format is valid (1-4 dot-separated integers).
4. If a git tag is provided (or GITHUB_REF is a tag), manifest version matches the tag.
5. Version is strictly higher than any previously tagged release.
6. All required extension assets exist and are non-empty.
7. Packages (zip and xpi) can be built cleanly and contain valid root manifests.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import zipfile

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMIUM_MANIFEST = os.path.join(REPO_ROOT, "src", "chromium", "manifest.json")
FIREFOX_MANIFEST = os.path.join(REPO_ROOT, "src", "firefox", "manifest.json")
CHROMIUM_DIR = os.path.join(REPO_ROOT, "src", "chromium")
BIN_DIR = os.path.join(REPO_ROOT, "bin")

REQUIRED_CHROMIUM_FILES = [
    "manifest.json",
    "background.js",
    "content.js",
    "icon16.png",
    "icon48.png",
    "icon128.png",
    "options.html",
    "options.js",
]


def parse_version_tuple(v_str):
    """Convert version string like '1.2' or '1.2.0' to a canonical 4-element tuple of ints."""
    clean = v_str.lstrip("v")
    parts = clean.split(".")
    nums = [int(p) for p in parts if p.isdigit()]
    while len(nums) < 4:
        nums.append(0)
    return tuple(nums[:4])


def validate_version_format(version):
    """Browser extensions require 1-4 dot-separated non-negative integers."""
    pattern = r"^[0-9]+(\.[0-9]+){1,3}$"
    return bool(re.match(pattern, version))


def load_manifest(path, name):
    if not os.path.isfile(path):
        print(f"❌ Error: {name} manifest file not found at: {path}")
        sys.exit(1)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Error: {name} manifest is not valid JSON ({path}): {e}")
        sys.exit(1)


def check_required_files():
    print("🔍 Checking required extension assets in src/chromium/...")
    missing = []
    empty = []
    for fname in REQUIRED_CHROMIUM_FILES:
        fpath = os.path.join(CHROMIUM_DIR, fname)
        if not os.path.isfile(fpath):
            missing.append(fname)
        elif os.path.getsize(fpath) == 0:
            empty.append(fname)

    if missing:
        print(f"❌ Error: Missing required extension files: {', '.join(missing)}")
        sys.exit(1)
    if empty:
        print(f"❌ Error: Empty extension files found: {', '.join(empty)}")
        sys.exit(1)

    print("   All required assets present and non-empty.")


def get_git_tags():
    """Retrieve all git tags sorted by creation/version."""
    try:
        res = subprocess.run(
            ["git", "tag", "-l"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
        return [t.strip() for t in res.stdout.splitlines() if t.strip()]
    except Exception:
        return []


def verify_archives(version):
    print("📦 Verifying package archives...")
    # Build packages
    res_chrome = subprocess.run(
        ["bash", "./make_chromium_zip.sh"],
        cwd=BIN_DIR,
        capture_output=True,
        text=True,
    )
    if res_chrome.returncode != 0:
        print(f"❌ Error running make_chromium_zip.sh:\n{res_chrome.stderr}")
        sys.exit(1)

    res_ff = subprocess.run(
        ["bash", "./make_firefox_xpi.sh"],
        cwd=BIN_DIR,
        capture_output=True,
        text=True,
    )
    if res_ff.returncode != 0:
        print(f"❌ Error running make_firefox_xpi.sh:\n{res_ff.stderr}")
        sys.exit(1)

    # Verify chromium zip
    chrome_zip_path = os.path.join(BIN_DIR, "random-album-for-youtube-music.zip")
    if not os.path.isfile(chrome_zip_path):
        print(f"❌ Error: Chromium zip not found at {chrome_zip_path}")
        sys.exit(1)

    with zipfile.ZipFile(chrome_zip_path, "r") as zf:
        namelist = zf.namelist()
        if "manifest.json" not in namelist:
            print("❌ Error: manifest.json not found at the root of Chromium zip!")
            sys.exit(1)
        with zf.open("manifest.json") as mf:
            m_data = json.load(mf)
            if m_data.get("version") != version:
                print(
                    f"❌ Error: Chromium zip manifest.json version ({m_data.get('version')}) "
                    f"does not match expected version ({version})!"
                )
                sys.exit(1)

    # Verify firefox xpi
    ff_xpi_path = os.path.join(BIN_DIR, "random-album-for-youtube-music.xpi")
    if not os.path.isfile(ff_xpi_path):
        print(f"❌ Error: Firefox xpi not found at {ff_xpi_path}")
        sys.exit(1)

    with zipfile.ZipFile(ff_xpi_path, "r") as zf:
        namelist = zf.namelist()
        if "manifest.json" not in namelist:
            print("❌ Error: manifest.json not found at the root of Firefox xpi!")
            sys.exit(1)
        with zf.open("manifest.json") as mf:
            m_data = json.load(mf)
            if m_data.get("version") != version:
                print(
                    f"❌ Error: Firefox xpi manifest.json version ({m_data.get('version')}) "
                    f"does not match expected version ({version})!"
                )
                sys.exit(1)
            gecko_id = (
                m_data.get("browser_specific_settings", {})
                .get("gecko", {})
                .get("id")
            )
            if not gecko_id:
                print("❌ Error: browser_specific_settings.gecko.id missing in Firefox xpi manifest!")
                sys.exit(1)

    print("   Chromium zip and Firefox xpi packages verified successfully.")


def main():
    parser = argparse.ArgumentParser(description="Extension release pre-flight check.")
    parser.add_argument(
        "--tag",
        type=str,
        default=os.environ.get("GITHUB_REF_NAME") if os.environ.get("GITHUB_REF_TYPE") == "tag" else None,
        help="Git tag being released (optional, e.g. v1.2 or 1.2)",
    )
    parser.add_argument(
        "--skip-build",
        action="store_true",
        help="Skip packaging and archive verification step",
    )
    parser.add_argument(
        "--allow-equal-version",
        action="store_true",
        help="Allow version to be equal to current tag (useful for dry runs)",
    )
    args = parser.parse_args()

    print("🚀 Starting extension release pre-flight checks...")

    # 1. Load manifests
    chrom_manifest = load_manifest(CHROMIUM_MANIFEST, "Chromium")
    ff_manifest = load_manifest(FIREFOX_MANIFEST, "Firefox")

    chrom_ver = chrom_manifest.get("version")
    ff_ver = ff_manifest.get("version")

    if not chrom_ver:
        print("❌ Error: Chromium manifest is missing 'version' field.")
        sys.exit(1)
    if not ff_ver:
        print("❌ Error: Firefox manifest is missing 'version' field.")
        sys.exit(1)

    print(f"   Chromium manifest version: {chrom_ver}")
    print(f"   Firefox manifest version:  {ff_ver}")

    # 2. Check version format
    if not validate_version_format(chrom_ver):
        print(f"❌ Error: Chromium manifest version '{chrom_ver}' is not a valid extension version (must be 1-4 dot-separated integers).")
        sys.exit(1)

    if not validate_version_format(ff_ver):
        print(f"❌ Error: Firefox manifest version '{ff_ver}' is not a valid extension version (must be 1-4 dot-separated integers).")
        sys.exit(1)

    # 3. Check version synchronization
    if chrom_ver != ff_ver:
        print("\n❌ VERSION SYNC RISK DETECTED!")
        print(f"   Chromium manifest has: {chrom_ver}")
        print(f"   Firefox manifest has:  {ff_ver}")
        print("   Both manifests must have the exact same version before publishing.\n")
        sys.exit(1)

    version = chrom_ver
    print(f"✅ Version sync verified: both manifests agree on version {version}")

    # 4. Check against release tag if provided
    if args.tag:
        raw_tag = args.tag.strip()
        tag_version = raw_tag.lstrip("v")
        print(f"🏷️  Checking against release tag: '{raw_tag}' (normalized: '{tag_version}')")
        
        # Compare normalized version tuple
        tag_tuple = parse_version_tuple(tag_version)
        manifest_tuple = parse_version_tuple(version)

        if tag_version != version and tag_tuple != manifest_tuple:
            print("\n❌ RELEASE TAG MISMATCH DETECTED!")
            print(f"   Release Tag:      '{raw_tag}'")
            print(f"   Manifest Version: '{version}'")
            print("   The git release tag does not match the manifest version.")
            print("   Please update both manifest.json files or create a matching tag.\n")
            sys.exit(1)
        print(f"✅ Tag '{raw_tag}' matches manifest version '{version}'.")

    # 5. Check against previous git tags to prevent publishing an existing or older version
    tags = get_git_tags()
    current_tuple = parse_version_tuple(version)
    for tag in tags:
        # Ignore the exact current tag if running on this tag
        if args.tag and tag == args.tag:
            continue
        tag_t = parse_version_tuple(tag)
        if not tag_t:
            continue
        if current_tuple < tag_t:
            print(f"❌ Error: Manifest version {version} is LOWER than previous release tag '{tag}'.")
            print("   Extension stores reject version downgrades. Please bump version.")
            sys.exit(1)
        elif current_tuple == tag_t and not args.allow_equal_version:
            # If not explicitly on this tag, releasing the exact same version again is rejected by stores
            if not (args.tag and parse_version_tuple(args.tag) == tag_t):
                print(f"⚠️  Warning/Error: Version {version} matches existing tag '{tag}'.")
                print("   Extension stores will reject uploading an existing version without a version bump.")
                sys.exit(1)

    # 6. Check required files
    check_required_files()

    # 7. Check packaging
    if not args.skip_build:
        verify_archives(version)

    # Output to GITHUB_OUTPUT if available
    gh_output = os.environ.get("GITHUB_OUTPUT")
    if gh_output and os.path.isfile(gh_output):
        with open(gh_output, "a", encoding="utf-8") as f:
            f.write(f"version={version}\n")
            f.write("status=success\n")

    print(f"\n🎉 All pre-flight checks PASSED for version {version}! Safe to publish.")


if __name__ == "__main__":
    main()
