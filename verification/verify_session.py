import json
from playwright.sync_api import sync_playwright

def verify_session():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
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

        # Inject localStorage before page load
        # We need to open the page first to set localStorage?
        # No, localStorage is per origin.
        # But for a file:// URL (or just opening the file), we can use add_init_script.
        # But we need to make sure the script runs before the app logic.

        page.add_init_script(f"""
            localStorage.setItem('preferenceRankData', JSON.stringify({json.dumps(battle_state)}));
        """)

        # Load the page
        import os
        page.goto(f"file://{os.path.abspath('PreferenceRank.html')}")

        # 1. Verify Session Modal Appears
        modal = page.locator("#sessionModal")
        if not modal.is_visible():
            print("FAILED: Session modal did not appear.")
            browser.close()
            return

        print("SUCCESS: Session modal appeared.")

        # Check text
        if "Resume Session?" not in page.locator("#sessionTitle").text_content():
             print(f"FAILED: Incorrect title: {page.locator('#sessionTitle').text_content()}")

        # 2. Test "New Session"
        # We need to reload to test both buttons, so let's start with New Session
        page.click("#sessionNew")

        if modal.is_visible():
             print("FAILED: Modal still visible after clicking New Session.")

        if not page.locator("#inputSection").is_visible():
             print("FAILED: Input section not visible after New Session.")

        # Verify input value is preserved
        input_value = page.locator("#items").input_value()
        if "Item 1\nItem 2\nItem 3" not in input_value:
             print(f"FAILED: Input value not preserved: {input_value}")

        print("SUCCESS: New Session button works.")

        # 3. Test "Continue Session"
        # Reload page
        page.reload()

        # Verify modal again
        if not modal.is_visible():
             print("FAILED: Session modal did not appear on reload.")

        page.click("#sessionContinue")

        if modal.is_visible():
             print("FAILED: Modal still visible after clicking Continue.")

        if not page.locator("#battleSection").is_visible():
             print("FAILED: Battle section not visible after Continue.")

        # Check if pair is rendered
        left_text = page.locator("#left").text_content()
        right_text = page.locator("#right").text_content()

        if "Item 1" not in left_text and "Item 2" not in left_text:
             print(f"FAILED: Unexpected items in battle: {left_text} vs {right_text}")

        print("SUCCESS: Continue Session button works.")

        browser.close()

if __name__ == "__main__":
    verify_session()
