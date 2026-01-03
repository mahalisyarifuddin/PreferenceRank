import json
from playwright.sync_api import sync_playwright

def generate_verification_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={'width': 800, 'height': 600}
        )
        page = context.new_page()

        # Define a mock battle state
        battle_state = {
            "inputValue": "Item 1\nItem 2\nItem 3",
            "settings": {"theme": "light", "language": "en"},
            "battle": {
                "items": ["Item 1", "Item 2", "Item 3"],
                "scores": [1000, 1000, 1000],
                "matches": [],
                "pair": [0, 1],
                "swapped": False,
                "step": 0,
                "allowTies": False,
                "history": [],
                "swaps": {"__type": "Map", "value": []},
                "providerType": "full",
                "provider": {
                    "pairs": [[0, 1], [0, 2], [1, 2]]
                }
            }
        }

        page.add_init_script(f"""
            localStorage.setItem('preferenceRankData', JSON.stringify({json.dumps(battle_state)}));
        """)

        import os
        page.goto(f"file://{os.path.abspath('PreferenceRank.html')}")

        # Wait for modal to appear
        page.locator("#sessionModal").wait_for()

        # Take screenshot
        screenshot_path = "/home/jules/verification/session_modal.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    generate_verification_screenshot()
