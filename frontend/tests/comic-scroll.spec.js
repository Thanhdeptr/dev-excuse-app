// Playwright tests for comic scroll animation
const { test, expect } = require('@playwright/test');
const path = require('path');

const FRONTEND_PATH = path.join(__dirname, '..');

test.describe('Comic Scroll Animation', () => {
    test.beforeEach(async ({ page }) => {
        // Load the HTML file
        await page.goto(`file://${FRONTEND_PATH}/index.html`);
    });

    test('should show first panel on page load', async ({ page }) => {
        const panel1 = page.locator('.panel-1');
        await expect(panel1).toHaveClass(/visible/);
    });

    test('should show panels when scrolling', async ({ page }) => {
        // Check that panel 1 is visible
        const panel1 = page.locator('.panel-1');
        await expect(panel1).toHaveClass(/visible/);

        // Scroll to panel 2
        await page.evaluate(() => {
            document.querySelector('.panel-2').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Wait for scroll animation
        await page.waitForTimeout(1000);
        
        // Check that panel 2 becomes visible
        const panel2 = page.locator('.panel-2');
        await expect(panel2).toHaveClass(/visible/);
    });

    test('should show all panels when scrolling through entire page', async ({ page }) => {
        const panels = [
            '.panel-1',
            '.panel-2',
            '.panel-3',
            '.panel-4'
        ];

        for (const panelSelector of panels) {
            // Scroll to panel
            await page.evaluate((selector) => {
                document.querySelector(selector).scrollIntoView({ behavior: 'smooth' });
            }, panelSelector);
            
            // Wait for animation
            await page.waitForTimeout(800);
            
            // Check visibility
            const panel = page.locator(panelSelector);
            await expect(panel).toHaveClass(/visible/);
        }
    });

    test('should have correct panel structure', async ({ page }) => {
        // Check that all 4 panels exist
        const panels = page.locator('.comic-panel');
        await expect(panels).toHaveCount(4);
        
        // Check panel data attributes
        for (let i = 1; i <= 4; i++) {
            const panel = page.locator(`[data-panel="${i}"]`);
            await expect(panel).toBeVisible();
        }
    });

    test('should have smooth scroll behavior', async ({ page }) => {
        const html = page.locator('html');
        const scrollBehavior = await html.evaluate((el) => {
            return window.getComputedStyle(el).scrollBehavior;
        });
        
        // Check that smooth scroll is enabled
        expect(scrollBehavior).toBe('smooth');
    });
});

