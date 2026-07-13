import { test, expect } from "../playwright-fixture";

/**
 * Layout / regression checks (no committed PNGs). To capture baselines locally:
 *   npx playwright test tests/visual.spec.ts --update-snapshots
 */
test.describe("layout smoke", () => {
  test("home header, main landmark, mode rail", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /ARENA WORKSPACE/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("mode-shape")).toBeVisible();
    await expect(page.getByTestId("mode-grid")).toBeVisible();
    await expect(page.getByTestId("mode-caves")).toBeVisible();
    await expect(page.locator("#main-content")).toBeVisible();
  });
});
