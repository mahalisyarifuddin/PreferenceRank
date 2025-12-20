from playwright.sync_api import sync_playwright

def verify_button_dim():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("file:///app/PreferenceRank.html")

        # 1. Initial state (should be disabled because items are empty)
        # Note: In current code (before fix), it is NOT disabled. So this script will fail if I run it before fix.
        # But I'll use it to verify the fix.
        start_btn = page.locator("#start")

        # Check initial state
        is_disabled = start_btn.is_disabled()
        print(f"Initial Start Button Disabled: {is_disabled}")

        # 2. Type 1 item
        page.locator("#items").fill("Item 1")
        is_disabled_one = start_btn.is_disabled()
        print(f"Start Button Disabled (1 item): {is_disabled_one}")

        # 3. Type 2 items (valid)
        page.locator("#items").fill("Item 1\nItem 2")
        is_disabled_two = start_btn.is_disabled()
        print(f"Start Button Disabled (2 items): {is_disabled_two}")

        # 4. Type duplicates
        page.locator("#items").fill("Item 1\nItem 1")
        is_disabled_dup = start_btn.is_disabled()
        print(f"Start Button Disabled (duplicates): {is_disabled_dup}")

        # 5. Clear items
        page.locator("#items").fill("")
        is_disabled_empty = start_btn.is_disabled()
        print(f"Start Button Disabled (cleared): {is_disabled_empty}")

        browser.close()

if __name__ == "__main__":
    verify_button_dim()
