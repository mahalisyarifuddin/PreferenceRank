
from playwright.sync_api import sync_playwright

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Load the HTML file directly
        import os
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/PreferenceRank.html")

        # Verify title
        if "PreferenceRank" in page.title():
            print("Title verified")
        else:
            print("Title verification failed")

        # Take screenshot of initial state
        page.screenshot(path="verification/initial_load.png")
        print("Initial screenshot taken")

        # Input some items
        page.fill("#items", "Item 1\nItem 2\nItem 3")
        page.click("#start")

        # Wait for battle section
        page.wait_for_selector("#battleSection")

        # Take screenshot of battle
        page.screenshot(path="verification/battle_mode.png")
        print("Battle screenshot taken")

        # Make a choice
        page.click("#left")

        # Wait for next pair (or same if it was quick)
        page.wait_for_timeout(500)

        # Take screenshot after choice
        page.screenshot(path="verification/after_choice.png")
        print("After choice screenshot taken")

        browser.close()

if __name__ == "__main__":
    verify_app_loads()
