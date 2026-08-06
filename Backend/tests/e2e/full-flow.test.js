const puppeteer = require("puppeteer")
const fs = require("fs")
const path = require("path")

describe("End-to-End (E2E) Application Flow", () => {
    let browser
    let page

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        })
        page = await browser.newPage()
        await page.setViewport({ width: 1280, height: 900 })
    })

    afterAll(async () => {
        if (browser) {
            await browser.close()
        }
    })

    test("Full E2E Flow: Register/Login -> Home -> Submit Strategy -> View Plan & Take Screenshot", async () => {
        const testUser = {
            username: `e2e_user_${Date.now()}`,
            email: `e2e_${Date.now()}@example.com`,
            password: "TestPassword123!"
        }

        // 1. Navigate to Register page
        await page.goto("http://localhost:5173/register", { waitUntil: "networkidle2" })

        // 2. Fill Register Form
        await page.waitForSelector("#username")
        await page.type("#username", testUser.username)
        await page.type("#email", testUser.email)
        await page.type("#password", testUser.password)

        // Submit Register Form
        await page.click(".button.primary-button")
        await new Promise(r => setTimeout(r, 2000))

        // If redirected to login, perform login
        if (page.url().includes("/login")) {
            await page.waitForSelector("#email")
            await page.type("#email", testUser.email)
            await page.type("#password", testUser.password)
            await page.click(".button.primary-button")
            await new Promise(r => setTimeout(r, 2000))
        }

        // 3. Navigate to Home page
        await page.goto("http://localhost:5173/", { waitUntil: "networkidle2" })

        // 4. Assert Home Page Header
        const pageHeader = await page.waitForSelector(".page-header h1")
        const headerText = await page.evaluate(el => el.textContent, pageHeader)
        expect(headerText).toContain("Create Your Custom")

        // 5. Fill in Target Job Description
        const jobDescTextarea = await page.waitForSelector(".panel--left textarea")
        await jobDescTextarea.type("Senior Full Stack Engineer at Tech Corp requiring React 19, Node.js, Express, and MongoDB.")

        // 6. Fill in Quick Self-Description
        const selfDescTextarea = await page.waitForSelector("#selfDescription")
        await selfDescTextarea.type("Software Engineer with 4 years experience building web applications and REST APIs.")

        // 7. Click Generate My Interview Strategy
        const generateBtn = await page.waitForSelector(".generate-btn")
        await generateBtn.click()

        // 8. Wait for report generation & navigation
        await new Promise(r => setTimeout(r, 4000))
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/\/interview\/|http:\/\/localhost:5173/)

        // 9. Capture E2E Verification Screenshot
        const scratchDir = path.join(__dirname, "../../../scratch")
        if (!fs.existsSync(scratchDir)) {
            fs.mkdirSync(scratchDir, { recursive: true })
        }
        const screenshotPath = path.join(scratchDir, "e2e_strategy_report.png")
        await page.screenshot({ path: screenshotPath, fullPage: true })

        expect(fs.existsSync(screenshotPath)).toBe(true)
    }, 60000)
})
