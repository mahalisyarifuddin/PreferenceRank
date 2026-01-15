import os
from playwright.sync_api import sync_playwright

def test_focus_styles(page):
    # Load the local HTML file
    cwd = os.getcwd()
    file_path = f"file://{cwd}/PreferenceRank.html"
    page.goto(file_path)

    # Wait for the page to load
    page.wait_for_selector("#start")

    # Focus on the Start button
    page.focus("#start")
    page.screenshot(path="verification/focus_start_after.png")

    # Focus on the Textarea
    page.focus("#items")
    page.screenshot(path="verification/focus_items_after.png")

    # Focus on the Theme select
    page.focus("#theme")
    page.screenshot(path="verification/focus_theme_after.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_focus_styles(page)
            print("Screenshots taken successfully.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
