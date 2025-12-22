from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Load the local HTML file
        page.goto(f"file://{os.path.abspath('PreferenceRank.html')}")

        # 1. Verify Autofocus
        # Get ID of active element
        active_id = page.evaluate("document.activeElement.id")
        if active_id == 'items':
            print("SUCCESS: Textarea is autofocused")
        else:
            print(f"FAILURE: Active element is {active_id}")

        # 2. Verify Ctrl+Enter functionality
        page.fill('#items', 'Item 1\nItem 2')
        # Ensure focus is back on items if fill changed it (fill usually focuses)
        page.focus('#items')

        # Take screenshot of Input Section with focus ring
        page.screenshot(path='verification/input_focus.png')

        # Press Ctrl+Enter
        page.keyboard.press('Control+Enter')

        # Check if battle section is visible
        if page.is_visible('#battleSection'):
            print("SUCCESS: Battle started with Ctrl+Enter")
        else:
            print("FAILURE: Battle did not start")

        # 3. Verify Tooltip (inspect attribute)
        # We can't easily screenshot native tooltips in headless, but we can verify the attribute
        title_attr = page.get_attribute('#start', 'title')
        print(f"Start Button Title: {title_attr}")
        if "Ctrl" in title_attr and "Enter" in title_attr:
             print("SUCCESS: Tooltip present")
        else:
             print("FAILURE: Tooltip missing or incorrect")

        # Take screenshot of Battle Section
        page.screenshot(path='verification/battle_started.png')

        browser.close()

if __name__ == '__main__':
    run()
