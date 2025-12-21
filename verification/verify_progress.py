
from playwright.sync_api import sync_playwright
import os
import re

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Load the file
    cwd = os.getcwd()
    page.goto(f"file://{cwd}/PreferenceRank.html")

    # Enter 5 items
    page.fill("#items", "Item1\nItem2\nItem3\nItem4\nItem5")

    # Enable Quick Rank
    page.check("#quickRank")

    # Click start
    page.click("#start")

    # Verify progress text format: "0/~10" (where 10 is approx 5 * log2(5) * 0.85 = 9.86 -> 10)
    progress_text = page.text_content("#progress")
    print(f"Progress: {progress_text}")

    if "0/~10" not in progress_text:
        print("Error: Progress estimation incorrect or format changed.")
        exit(1)

    # Take screenshot
    page.screenshot(path="verification/progress_verify.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
