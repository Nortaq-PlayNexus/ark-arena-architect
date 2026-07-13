import { test, expect } from "../playwright-fixture";

test("core mode switches work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("mode-shape")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("mode-grid").click();
  await expect(page.getByTestId("mode-grid")).toBeVisible();
  await page.getByTestId("mode-caves").click();
  await expect(page.getByText("Custom Caves")).toBeVisible();
  await page.getByTestId("mode-shape").click();
  await expect(page.getByTestId("mode-shape")).toHaveAttribute("aria-pressed", "true");
});

test("suite hub routes render", async ({ page }) => {
  await page.goto("/ini");
  await expect(page.getByRole("heading", { name: "Snippets & backups" })).toBeVisible({ timeout: 20_000 });

  await page.goto("/companions");
  await expect(page.getByRole("heading", { name: /Launch guide/i })).toBeVisible({ timeout: 20_000 });

  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: /Suite preferences/i })).toBeVisible({ timeout: 20_000 });
});

test("toolkit spawn grids deep link", async ({ page }) => {
  await page.goto("/toolkit?tab=spawn-grids");
  const tab = page.getByRole("tab", { name: /spawn grids/i });
  await expect(tab).toBeVisible({ timeout: 20_000 });
  await expect(tab).toHaveAttribute("data-state", "active");
});
