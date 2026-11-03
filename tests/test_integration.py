"""
Integration test for Random Album for YouTube Music extension.
Verifies the end-to-end flow:
  1. Navigates to YouTube Music library
  2. Executes content.js
  3. Scrolls and counts all albums
  4. Selects a random album and starts playback
  5. Verifies that the audio/video element is playing and playback progresses
  6. In single-select mode, verifies landing on the album page with playback continuing

Pre-requisite:
  An authenticated Playwright user profile (default: ~/.cache/playwright_ytmusic_profile).
  Can be configured via environment variable YTM_PROFILE_DIR.
  Headless mode can be toggled via HEADLESS=false.
"""

import json
import os
import time
import unittest

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


DEFAULT_PROFILE_DIR = os.path.expanduser("~/.cache/playwright_ytmusic_profile")
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_JS_PATH = os.path.join(REPO_ROOT, "src", "chromium", "content.js")


class TestRandomAlbumIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not PLAYWRIGHT_AVAILABLE:
            raise unittest.SkipTest("Playwright is not installed. Run 'pip install playwright'.")

        cls.profile_dir = os.environ.get("YTM_PROFILE_DIR", DEFAULT_PROFILE_DIR)
        if not os.path.isdir(cls.profile_dir):
            raise unittest.SkipTest(
                f"Authenticated profile directory not found at '{cls.profile_dir}'. "
                "Set YTM_PROFILE_DIR or log in first."
            )

        if not os.path.isfile(CONTENT_JS_PATH):
            raise FileNotFoundError(f"content.js not found at {CONTENT_JS_PATH}")

        with open(CONTENT_JS_PATH, "r", encoding="utf-8") as f:
            cls.content_js_code = f.read()

        cls.headless = os.environ.get("HEADLESS", "true").lower() not in ("0", "false", "no")

    def setUp(self):
        self.playwright = sync_playwright().start()
        self.context = self.playwright.chromium.launch_persistent_context(
            user_data_dir=self.profile_dir,
            headless=self.headless,
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
            ),
            args=[
                "--disable-blink-features=AutomationControlled",
                "--autoplay-policy=no-user-gesture-required",
                "--no-first-run",
                "--no-default-browser-check"
            ],
            viewport={"width": 1280, "height": 900}
        )
        self.page = self.context.pages[0] if self.context.pages else self.context.new_page()

    def tearDown(self):
        try:
            # Pause video so playback doesn't persist
            self.page.evaluate("document.querySelector('video')?.pause()")
        except Exception:
            pass
        finally:
            self.context.close()
            self.playwright.stop()

    def _inject_and_run_extension(self, album_shuffle_count=1):
        wrapper = f"""
        (() => {{
            window.chrome = window.chrome || {{}};
            window.chrome.storage = window.chrome.storage || {{
                sync: {{
                    get: (key, cb) => cb({{ album_shuffle_count: {album_shuffle_count} }})
                }}
            }};
            {self.content_js_code}
        }})()
        """
        self.page.evaluate(wrapper)

    def _wait_for_playback(self, timeout_secs=60):
        """Polls until playback begins and overlay hides."""
        start_time = time.time()
        last_state = {}
        while time.time() - start_time < timeout_secs:
            last_state = self.page.evaluate("""() => {
                const video = document.querySelector('video');
                const overlay = document.getElementById('dimOverlay');
                const barTitle = document.querySelector('ytmusic-player-bar .title')?.innerText;
                return {
                    url: window.location.href,
                    paused: video ? video.paused : null,
                    currentTime: video ? video.currentTime : null,
                    barTitle: barTitle,
                    overlayVisible: overlay ? overlay.style.visibility : null
                };
            }""")

            # Playback is active when video is unpaused and has advanced
            if (
                last_state.get("currentTime") is not None
                and last_state["currentTime"] > 0.5
                and not last_state.get("paused")
                and last_state.get("overlayVisible") == "hidden"
            ):
                return last_state

            time.sleep(1)

        self.fail(f"Timed out after {timeout_secs}s waiting for playback. Last state: {last_state}")

    def test_single_album_end_to_end_playback(self):
        """Test that single album mode scrolls library, plays a random album, and lands on album page."""
        self.page.goto("https://music.youtube.com/library/albums")
        self.page.wait_for_selector('[id^="items"] > ytmusic-two-row-item-renderer', timeout=20000)

        # Trigger extension
        self._inject_and_run_extension(album_shuffle_count=1)

        # Wait for playback
        result = self._wait_for_playback(timeout_secs=60)

        self.assertFalse(result["paused"], "Video element should not be paused")
        self.assertGreater(result["currentTime"], 0.5, "Video currentTime should have advanced")
        self.assertEqual(result["overlayVisible"], "hidden", "Loading overlay should be hidden")
        self.assertTrue(
            "playlist?list=" in result["url"] or "browse/" in result["url"] or "watch" in result["url"],
            f"Expected URL to be on album playlist or watch page, got {result['url']}"
        )

    def test_multi_album_queue(self):
        """Test that multi-select mode queues multiple albums and starts playback."""
        self.page.goto("https://music.youtube.com/library/albums")
        self.page.wait_for_selector('[id^="items"] > ytmusic-two-row-item-renderer', timeout=20000)

        # Trigger extension with 2 albums
        self._inject_and_run_extension(album_shuffle_count=2)

        # Wait for playback
        result = self._wait_for_playback(timeout_secs=60)

        self.assertFalse(result["paused"], "Video element should not be paused")
        self.assertGreater(result["currentTime"], 0.5, "Video currentTime should have advanced")
        self.assertEqual(result["overlayVisible"], "hidden", "Loading overlay should be hidden")


if __name__ == "__main__":
    unittest.main()
