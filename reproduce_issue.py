from playwright.sync_api import sync_playwright
import os
import time

def run():
    print("Starting reproduction script...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        file_path = os.path.abspath("PreferenceRank.html")
        page.goto(f"file://{file_path}")

        # Input items
        page.fill("#items", "Apple\nBanana\nCherry")

        # Click Start
        page.click("#start")

        # Complete the ranking (A vs B, A vs C, B vs C)
        # Just click Left until results appear
        while not page.is_visible("#results:not(.hidden)"):
            if page.is_visible("#battleSection:not(.hidden)"):
                 page.click("#left")
                 # Wait for animation/transition
                 page.wait_for_timeout(200)
            else:
                 # Should not happen unless finished
                 break

        print("Reached results screen.")

        # Check headers
        headers = page.locator("#results th[data-sort]")
        count = headers.count()
        print(f"Found {count} sortable headers")

        focusable_count = 0
        for i in range(count):
            header = headers.nth(i)
            tabindex = header.get_attribute("tabindex")
            print(f"Header {i} tabindex: {tabindex}")
            if tabindex == "0":
                focusable_count += 1

        if focusable_count == 0:
            print("FAILURE: Headers are not focusable via keyboard.")
        else:
            print("SUCCESS: Headers are focusable.")

        browser.close()

if __name__ == "__main__":
    run()
