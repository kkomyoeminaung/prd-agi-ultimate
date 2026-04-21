class E2EAgent:
    def generate_playwright_test(self):
        """Optional agent that generates E2E browser tests."""
        return """import { test, expect } from '@playwright/test';\ntest('E2E sequence', async ({ page }) => {\n  await page.goto('/');\n});"""

e2e_agent = E2EAgent()
