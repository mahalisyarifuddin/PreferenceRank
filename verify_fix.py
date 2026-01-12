from playwright.sync_api import sync_playwright, expect
import os
import time

def run():
    print("Starting verification script...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        file_path = os.path.abspath("PreferenceRank.html")
        page.goto(f"file://{file_path}")

        # Input items
        page.fill("#items", "Apple\nBanana\nCherry")

        # Click Start
        page.click("#start")

        # Complete the ranking
        while not page.is_visible("#results:not(.hidden)"):
            if page.is_visible("#battleSection:not(.hidden)"):
                 page.click("#left")
                 page.wait_for_timeout(200)
            else:
                 break

        print("Reached results screen.")

        # Check headers
        headers = page.locator("#results th[data-sort]")
        count = headers.count()
        print(f"Found {count} sortable headers")

        # 1. Verify tabindex
        for i in range(count):
            header = headers.nth(i)
            tabindex = header.get_attribute("tabindex")
            print(f"Header {i} tabindex: {tabindex}")
            assert tabindex == "0", f"Header {i} missing tabindex=0"

            # Verify aria-sort presence
            aria_sort = header.get_attribute("aria-sort")
            print(f"Header {i} aria-sort: {aria_sort}")
            assert aria_sort in ["none", "ascending", "descending"], f"Header {i} has invalid aria-sort: {aria_sort}"

        print("Verification: Headers have correct attributes.")

        # 2. Verify sorting with Enter key
        # Default sort is rank desc? Let's check.
        # Rank column is index 0.
        rank_header = headers.nth(0)

        # Focus on rank header
        rank_header.focus()
        page.keyboard.press("Enter")

        # Check if aria-sort changed
        # It should toggle. Initial state might be none or dependent on implementation
        # The code sets sort to 'rank' 'asc' initially? No, let's see constructor.
        # constructor: this.sortState = { column: 'rank', direction: 'asc' }
        # The `results()` method sorts `baseRanking` by score desc (so rank 1 is highest score).
        # But `this.sortState` starts as 'rank', 'asc'.
        # Wait, if sortState is 'rank' 'asc', then `sorters['rank']` is used.
        # `sorters.rank = (a, b) => (scores[b] - scores[a]) * sortDir`.
        # If asc (1), it sorts descending score (1000 -> 0), so Rank 1 -> Rank N.
        # If I click/enter again, it becomes desc (-1). So scores[a] - scores[b]. Ascending score (0 -> 1000). Rank N -> Rank 1.

        # Let's verify aria-sort value
        # After Enter, direction should flip.

        page.wait_for_timeout(100) # Wait for re-render
        new_rank_header = page.locator("#results th[data-sort='rank']")
        new_sort = new_rank_header.get_attribute("aria-sort")
        print(f"New sort state for rank: {new_sort}")

        # 3. Screenshot
        page.screenshot(path="/home/jules/verification/verification.png")
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    run()
