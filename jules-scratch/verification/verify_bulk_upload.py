from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the login page
        page.goto("http://localhost:3000/login")
        page.wait_for_load_state()
        page.screenshot(path="jules-scratch/verification/login_page.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)