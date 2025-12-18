from playwright.sync_api import sync_playwright

def verify_aria_labels():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("file:///app/PreferenceRank.html")

        # Verify initial ARIA labels (English by default)
        language_select = page.locator("#language")
        theme_select = page.locator("#theme")

        aria_label_lang = language_select.get_attribute("aria-label")
        aria_label_theme = theme_select.get_attribute("aria-label")

        print(f"EN Language ARIA: {aria_label_lang}")
        print(f"EN Theme ARIA: {aria_label_theme}")

        assert aria_label_lang == "Language"
        assert aria_label_theme == "Theme"

        # Change language to Indonesian
        language_select.select_option("id")

        # Verify ARIA labels updated to Indonesian
        aria_label_lang_id = language_select.get_attribute("aria-label")
        aria_label_theme_id = theme_select.get_attribute("aria-label")

        print(f"ID Language ARIA: {aria_label_lang_id}")
        print(f"ID Theme ARIA: {aria_label_theme_id}")

        assert aria_label_lang_id == "Bahasa"
        assert aria_label_theme_id == "Tema"

        page.screenshot(path="verification/verification.png")
        browser.close()

if __name__ == "__main__":
    verify_aria_labels()
