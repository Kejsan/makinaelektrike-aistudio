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

        # Fill in the login form
        page.locator('input[type="email"]').fill("h+admin@m.com")
        page.locator('input[type="password"]').fill("123456")

        # Click the login button
        page.get_by_role("button", name="Login").click()

        # Wait for the navigation to the admin page
        page.wait_for_url("http://localhost:3000/admin")

        # Wait for the main heading to be visible
        expect(page.get_by_role("heading", name="Admin Dashboard")).to_be_visible()

        # Click the "Bulk upload dealers" button
        page.get_by_role("button", name="Bulk upload dealers").click()

        # Wait for the modal to appear
        expect(page.get_by_role("heading", name="Bulk upload dealers")).to_be_visible()

        # Create a dummy CSV file
        with open("jules-scratch/verification/dealers.csv", "w") as f:
            f.write("name,address,city,lat,lng,brands,languages,typeOfCars,modelsAvailable\n")
            f.write("Test Dealer,123 Main St,Testville,40.7128,-74.0060,TestBrand,English,New,TestModel\n")

        # Upload the file
        page.get_by_label("Select CSV or Excel file").set_input_files("jules-scratch/verification/dealers.csv")

        # Wait for the validation preview to appear
        expect(page.get_by_text("Validation preview")).to_be_visible()
        expect(page.get_by_text("1 valid rows")).to_be_visible()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)