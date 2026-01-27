from playwright.sync_api import sync_playwright, expect
import os

def run_verification(page):
    # Load the local HTML file
    # Ensure absolute path
    file_path = f"file://{os.getcwd()}/PreferenceRank.html"
    print(f"Navigating to {file_path}")
    page.goto(file_path)

    # Check title
    expect(page).to_have_title("PreferenceRank")

    # Enter items
    # The label has "Enter items, one per line:"
    items_input = page.get_by_label("Enter items, one per line:")
    items_input.fill("Item 1\nItem 2\nItem 3\nItem 4")

    # Check estimate (Full Rank by default)
    # 4 items -> 6 comparisons
    # Text should be "4 items (~6 comparisons)"
    count_div = page.locator("#itemCount")
    expect(count_div).to_have_text("4 items (~6 comparisons)")

    # Take screenshot 1: Full Rank
    page.screenshot(path="verification/full_rank.png")
    print("Screenshot taken: verification/full_rank.png")

    # Switch to Quick Rank
    # The label is linked to checkbox #quickRank
    quick_rank_checkbox = page.locator("#quickRank")
    quick_rank_checkbox.check()

    # Check estimate (Quick Rank)
    # 4 items -> ~6 comparisons
    expect(count_div).to_have_text("4 items (~6 comparisons)")

    # Let's try more items to see a difference
    items_input.fill("\n".join([f"Item {i}" for i in range(50)]))

    # Quick Rank for 50 items -> ~213
    expect(count_div).to_have_text("50 items (~213 comparisons)")

    # Take screenshot 2: Quick Rank
    page.screenshot(path="verification/quick_rank.png")
    print("Screenshot taken: verification/quick_rank.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_verification(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            # Take screenshot on failure
            page.screenshot(path="verification/failure.png")
            raise e
        finally:
            browser.close()
