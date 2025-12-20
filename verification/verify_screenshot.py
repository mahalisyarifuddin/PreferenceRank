from playwright.sync_api import sync_playwright

def verify_button_dim_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("file:///app/PreferenceRank.html")

        # 1. Capture initial state (disabled)
        start_btn = page.locator("#start")
        is_disabled = start_btn.is_disabled()
        print(f"Initial Start Button Disabled: {is_disabled}")
        page.screenshot(path="verification/dim_disabled_initial.png")

        # 2. Capture enabled state
        page.locator("#items").fill("Item 1\nItem 2")
        is_disabled_two = start_btn.is_disabled()
        print(f"Start Button Disabled (2 items): {is_disabled_two}")
        page.screenshot(path="verification/dim_enabled.png")

        # 3. Capture disabled again (duplicates)
        page.locator("#items").fill("Item 1\nItem 1")
        is_disabled_dup = start_btn.is_disabled()
        print(f"Start Button Disabled (duplicates): {is_disabled_dup}")
        page.screenshot(path="verification/dim_disabled_dup.png")

        browser.close()

if __name__ == "__main__":
    verify_button_dim_screenshot()
