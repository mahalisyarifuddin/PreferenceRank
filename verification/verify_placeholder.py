from playwright.sync_api import sync_playwright

def verify_placeholder():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("file:///app/PreferenceRank.html")

        # Verify initial placeholder (English)
        textarea = page.locator("#items")
        placeholder_en = textarea.get_attribute("placeholder")
        print(f"EN Placeholder: {repr(placeholder_en)}")

        expected_en = "Example:\nApple\nBanana\nCherry"
        assert placeholder_en == expected_en, f"Expected {repr(expected_en)}, got {repr(placeholder_en)}"

        # Take screenshot of English state
        page.screenshot(path="verification/placeholder_en.png")

        # Change language to Indonesian
        page.locator("#language").select_option("id")

        # Verify placeholder updated to Indonesian
        placeholder_id = textarea.get_attribute("placeholder")
        print(f"ID Placeholder: {repr(placeholder_id)}")

        expected_id = "Contoh:\nApel\nPisang\nCeri"
        assert placeholder_id == expected_id, f"Expected {repr(expected_id)}, got {repr(placeholder_id)}"

        # Take screenshot of Indonesian state
        page.screenshot(path="verification/placeholder_id.png")

        print("Verification successful!")
        browser.close()

if __name__ == "__main__":
    verify_placeholder()
