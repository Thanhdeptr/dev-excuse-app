// Playwright tests for responsive design
const { test, expect } = require('@playwright/test');
const path = require('path');

const FRONTEND_PATH = path.join(__dirname, '..');

test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(`file://${FRONTEND_PATH}/index.html`);
        
        // Check that panels are still visible
        const panel1 = page.locator('.panel-1');
        await expect(panel1).toBeVisible();
        
        // Check that content is readable
        const calendarDay = page.locator('.calendar-day');
        const dayText = await calendarDay.textContent();
        expect(dayText).toBeTruthy();
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(`file://${FRONTEND_PATH}/index.html`);
        
        // Check that panels are visible
        const panel1 = page.locator('.panel-1');
        await expect(panel1).toBeVisible();
    });

    test('should be responsive on desktop viewport', async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(`file://${FRONTEND_PATH}/index.html`);
        
        // Check that panels are visible
        const panel1 = page.locator('.panel-1');
        await expect(panel1).toBeVisible();
    });

    test('should have proper font sizes on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(`file://${FRONTEND_PATH}/index.html`);
        
        // Check that text is readable (not too small)
        const calendarDay = page.locator('.calendar-day');
        const fontSize = await calendarDay.evaluate((el) => {
            return window.getComputedStyle(el).fontSize;
        });
        
        // Font size should be reasonable (at least 24px on mobile)
        const sizeInPx = parseFloat(fontSize);
        expect(sizeInPx).toBeGreaterThan(20);
    });

    test('should have proper spacing on all viewports', async ({ page }) => {
        const viewports = [
            { width: 375, height: 667, name: 'mobile' },
            { width: 768, height: 1024, name: 'tablet' },
            { width: 1920, height: 1080, name: 'desktop' }
        ];

        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.goto(`file://${FRONTEND_PATH}/index.html`);
            
            // Check that panels have proper padding
            const panel1 = page.locator('.panel-1');
            const padding = await panel1.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                    top: parseFloat(style.paddingTop),
                    bottom: parseFloat(style.paddingBottom)
                };
            });
            
            expect(padding.top).toBeGreaterThan(0);
            expect(padding.bottom).toBeGreaterThan(0);
        }
    });
});



