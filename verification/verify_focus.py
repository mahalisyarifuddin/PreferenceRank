from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        path = os.path.abspath("PreferenceRank.html")
        page.goto(f"file://{path}")

        # 1. Verify global focus style (on the textarea or toggle)
        print("Checking global focus style...")
        page.locator("#items").focus()
        outline_width = page.evaluate("window.getComputedStyle(document.getElementById('items')).outlineWidth")
        print(f"Global outline width: {outline_width}")

        if "2px" not in outline_width:
             print("Warning: Expected outline-width to be 2px")

        # 2. Enter battle mode
        print("Entering items and starting battle...")
        page.locator("#items").fill("A\nB")
        page.locator("#start").click()

        # 3. Verify battle button focus style
        print("Checking battle button focus style...")
        left_btn = page.locator("#left")

        # The app sets focus to #left automatically after start
        # Wait a bit for the setTimeout(..., 50)
        page.wait_for_timeout(100)

        # Check if it has focus
        expect(left_btn).to_be_focused()

        # Check computed style
        btn_outline = page.evaluate("window.getComputedStyle(document.getElementById('left')).outlineStyle")
        print(f"Battle button outline style: {btn_outline}")

        if btn_outline != "none":
             print(f"Warning: Expected outline-style to be 'none', got {btn_outline}")

        # Take a screenshot to confirm visually
        page.screenshot(path="verification/focus_check.png")
        print("Verification screenshot saved.")

        browser.close()

if __name__ == "__main__":
    run()
