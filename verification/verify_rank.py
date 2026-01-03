import os
from playwright.sync_api import sync_playwright

def verify_rank():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Determine the file path
        cwd = os.getcwd()
        filepath = f"file://{cwd}/PreferenceRank.html"

        print(f"Loading {filepath}")
        page.goto(filepath)

        # Test Quick Rank
        print("Testing Quick Rank...")
        # Fill items
        page.fill('#items', 'A\nB\nC\nD')

        # Check Quick Rank
        page.check('#quickRank')

        # Click Start
        page.click('#start')

        # Verify we are in battle section
        assert page.is_visible('#battleSection')

        # Make choices until finished
        step = 0
        while page.is_visible('#battleSection') and not page.is_visible('#results'):
            if page.is_visible('#left'):
                page.click('#left')
                step += 1
                page.wait_for_timeout(200) # Wait for animation/debounce
            else:
                break
            if step > 50:
                print("Too many steps, aborting")
                break

        # Verify results
        page.wait_for_selector('#results', state='visible')
        print("Quick Rank Results visible")

        results_html = page.inner_html('#results')
        print("Results content length:", len(results_html))
        assert "A" in results_html

        page.screenshot(path="verification/quick_rank_results.png")

        # Restart New
        page.click('#restartNew')

        # Test Full Rank
        print("Testing Full Rank...")
        page.fill('#items', 'X\nY\nZ')
        page.uncheck('#quickRank')
        page.click('#start')

        # Make choices
        step = 0
        while page.is_visible('#battleSection') and not page.is_visible('#results'):
             if page.is_visible('#right'):
                page.click('#right')
                step += 1
                page.wait_for_timeout(200)
             else:
                break

        page.wait_for_selector('#results', state='visible')
        print("Full Rank Results visible")
        page.screenshot(path="verification/full_rank_results.png")

        browser.close()

if __name__ == "__main__":
    verify_rank()
