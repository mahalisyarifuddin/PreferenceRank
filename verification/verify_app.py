
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Load the file
    cwd = os.getcwd()
    page.goto(f"file://{cwd}/PreferenceRank.html")

    # Enter items
    page.fill("#items", "Item A\nItem B\nItem C")

    # Start
    page.click("#start")

    # Verify we are in battle section
    page.wait_for_selector("#battleSection", state="visible")

    # Take screenshot of battle
    page.screenshot(path="verification/1_battle.png")

    # Click Left
    page.click("#left")

    # Wait for next pair (busy to be false and content to update)
    # Since items are Item A, Item B, Item C.
    # QuickRank:
    # 0, 1, 2.
    # Initial pair: 1 (B) vs 2 (C).
    # Click left (B wins).
    # Next pair: 0 (A) vs winner (B).

    # Verify next pair
    # We wait a bit for animation
    page.wait_for_timeout(500)
    page.screenshot(path="verification/2_next_pair.png")

    # Cancel
    page.click("#cancel")
    page.wait_for_selector("#inputSection", state="visible")
    page.screenshot(path="verification/3_cancelled.png")

    # Start again (Reset)
    page.click("#start")
    page.wait_for_selector("#battleSection", state="visible")

    # Verify we are back to first pair
    # If the bug was present and triggered, we might see something else, but here we just check normal flow
    page.screenshot(path="verification/4_restarted.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
