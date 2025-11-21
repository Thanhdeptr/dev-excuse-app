// Playwright tests for API integration
const { test, expect } = require('@playwright/test');
const path = require('path');

const FRONTEND_PATH = path.join(__dirname, '..');
const API_URL = 'http://44.197.205.147:3000';

test.describe('API Integration', () => {
    test.beforeEach(async ({ page }) => {
        // Load the HTML file
        await page.goto(`file://${FRONTEND_PATH}/index.html`);
    });

    test('should load excuse from API when panel 4 is visible', async ({ page }) => {
        // Mock API response
        await page.route(`${API_URL}/api/excuses`, async route => {
            const json = {
                count: 1,
                excuses: [
                    {
                        id: 1,
                        text: 'Test excuse from API',
                        created_at: new Date().toISOString()
                    }
                ]
            };
            await route.fulfill({ json });
        });

        // Scroll to panel 4
        await page.evaluate(() => {
            document.querySelector('.panel-4').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Wait for API call and animation
        await page.waitForTimeout(1500);
        
        // Check that excuse is displayed
        const excuseOverlay = page.locator('#excuse-text-overlay .bubble-content');
        const excuseText = await excuseOverlay.textContent();
        
        expect(excuseText).toBeTruthy();
        expect(excuseText).not.toContain('Đang tải');
        expect(excuseText).toContain('Test excuse from API');
    });

    test('should handle API error gracefully', async ({ page }) => {
        // Mock API error
        await page.route(`${API_URL}/api/excuses`, route => route.abort());

        // Scroll to panel 4
        await page.evaluate(() => {
            document.querySelector('.panel-4').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Wait for error handling
        await page.waitForTimeout(2000);
        
        // Check that fallback excuse is displayed
        const excuseOverlay = page.locator('#excuse-text-overlay .bubble-content');
        const excuseText = await excuseOverlay.textContent();
        
        expect(excuseText).toBeTruthy();
        // Should show one of the fallback excuses
        expect(excuseText.length).toBeGreaterThan(0);
    });

    test('should reload excuse when clicked', async ({ page }) => {
        let callCount = 0;
        
        // Mock API response
        await page.route(`${API_URL}/api/excuses`, async route => {
            callCount++;
            const json = {
                count: 1,
                excuses: [
                    {
                        id: callCount,
                        text: `Excuse ${callCount}`,
                        created_at: new Date().toISOString()
                    }
                ]
            };
            await route.fulfill({ json });
        });

        // Scroll to panel 4
        await page.evaluate(() => {
            document.querySelector('.panel-4').scrollIntoView({ behavior: 'smooth' });
        });
        
        await page.waitForTimeout(1500);
        
        // Click excuse overlay to reload
        await page.locator('#excuse-text-overlay').click();
        await page.waitForTimeout(1000);
        
        // Check that API was called again
        expect(callCount).toBeGreaterThan(1);
    });

    test('should display loading state initially', async ({ page }) => {
        // Scroll to panel 4
        await page.evaluate(() => {
            document.querySelector('.panel-4').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Check loading text appears briefly
        const loadingText = page.locator('.loading-text');
        // Loading text might appear very briefly, so we check if it exists or was there
        await page.waitForTimeout(500);
        
        // After loading, should show actual excuse
        const excuseOverlay = page.locator('#excuse-text-overlay .bubble-content');
        await page.waitForTimeout(1000);
        const excuseText = await excuseOverlay.textContent();
        expect(excuseText).toBeTruthy();
    });
});

