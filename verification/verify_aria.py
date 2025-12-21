from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local file
        path = os.path.abspath("PreferenceRank.html")
        page.goto(f"file://{path}")

        # We need to start the battle to see the toggle button
        print("Entering items...")
        page.locator("#items").fill("Item 1\nItem 2")

        print("Clicking Start...")
        page.locator("#start").click()

        # Now the battle section should be visible
        battle_section = page.locator("#battleSection")
        expect(battle_section).to_be_visible()

        # Locate the toggle button
        toggle = page.locator("#toggle")

        # Verify initial state
        print("Checking initial state...")
        expect(toggle).to_have_attribute("aria-controls", "tips")
        expect(toggle).to_have_attribute("aria-expanded", "false")
        expect(page.locator("#tips")).to_be_hidden()

        # Click to expand
        print("Clicking toggle...")
        toggle.click()

        # Verify expanded state
        print("Checking expanded state...")
        expect(toggle).to_have_attribute("aria-expanded", "true")
        expect(page.locator("#tips")).to_be_visible()

        # Take a screenshot of the expanded state
        page.screenshot(path="verification/expanded.png")

        # Click to collapse
        print("Clicking toggle again...")
        toggle.click()

        # Verify collapsed state
        print("Checking collapsed state...")
        expect(toggle).to_have_attribute("aria-expanded", "false")
        expect(page.locator("#tips")).to_be_hidden()

        print("Verification successful!")
        browser.close()

if __name__ == "__main__":
    run()
