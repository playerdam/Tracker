// Røgtest: booter appen, logger, navigerer alle faner, åbner afslut-vagt.
// Fanger klassen af fejl der før har dræbt hele appen ved boot.
const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const now = Date.now();
    localStorage.setItem("mise_session", JSON.stringify({ access_token: "demo", refresh_token: "demo", expires_at: now + 86400000 }));
    localStorage.setItem("mise_onboarded", "1");
    localStorage.setItem("mise_state_v2", JSON.stringify({
      counters: [{ id: "c1", label: "Østers åbnet", count: 10, unit: "stk", cat: "aabnet-mad", subs: [] }],
      wines: [], log: [], customCats: [], shiftHistory: [], _updatedAt: now,
    }));
    localStorage.removeItem("mise_shift");
  });
});

test("app booter, logger og navigerer uden JS-fejl", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/");
  await expect(page.locator("#vagtDash .vd2-hero")).toBeVisible({ timeout: 15000 });

  // Skift til Detaljer (Aktivitet/Detaljer er ét toggle) og bump en tæller — ringen skal følge med
  await page.locator('[data-sec="details"]').click();
  await page.locator(".vr-plus").first().click();
  await expect(page.locator("#vd-ring-num")).toHaveText("11");

  // Alle faner skal kunne åbnes
  for (const tab of ["vin", "social", "feed", "lab", "vagt"]) {
    await page.locator(`.bnav-btn[data-tab="${tab}"]`).click();
    await page.waitForTimeout(250);
  }
  await expect(page.locator("#view-vagt")).toHaveClass(/active/);

  // Start vagt → afslut-flowets trin 1 åbner
  await page.locator("#vagtShiftCard").click();
  await expect(page.locator("#vagtShiftCard .vd2-timer")).toBeVisible();
  await page.locator("#vagtShiftCard").click();
  await expect(page.locator("#shiftStep1")).toBeVisible();

  expect(errors).toEqual([]);
});
