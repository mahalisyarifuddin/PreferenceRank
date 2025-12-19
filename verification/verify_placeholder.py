from playwright.sync_api import sync_playwright

def verify_placeholder():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("file:///app/PreferenceRank.html")

        items_textarea = page.locator("#items")

        # Verify initial placeholder (English)
        placeholder_en = items_textarea.get_attribute("placeholder")
        print(f"EN Placeholder: {placeholder_en}")

        # Should be empty initially as per current code
        # After my changes, it should be the new text.
        # So I will assert checking for the new text, expecting this script to fail initially if I ran it before changes.
        # But for the purpose of the plan, I write the script to verify the *desired* state.

        assert "Example:" in placeholder_en
        assert "Coffee" in placeholder_en

        # Change language to Indonesian
        page.locator("#language").select_option("id")

        # Verify placeholder updated
        placeholder_id = items_textarea.get_attribute("placeholder")
        print(f"ID Placeholder: {placeholder_id}")
        assert "Contoh:" in placeholder_id
        assert "Kopi" in placeholder_id

        browser.close()

if __name__ == "__main__":
    verify_placeholder()
