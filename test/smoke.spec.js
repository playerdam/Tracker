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

  // Stats-fanen er rent overblik — ingen Detaljer-sektion, achievements foldes ud on-demand
  await page.locator('.bnav-btn[data-tab="stats"]').click();
  await page.waitForTimeout(250);
  await expect(page.locator("#statsRows")).toHaveCount(0);
  await expect(page.locator("#statsToAchieve")).toBeHidden();
  await page.locator("#statsToAchieveToggle").click();
  await expect(page.locator("#statsToAchieve")).toBeVisible();
  await expect(page.locator("#statsToAchieve .badge-item").first()).toBeVisible();

  // Tællere ændres nu kun via Administrér tællere (nået fra "Alle kategorier") — bump og se ringen på Overblik følge med
  await page.locator("#statsQuick .vd2-qtile-more").click();
  await page.waitForTimeout(200);
  await page.locator("#catOvManage").click();
  await page.waitForTimeout(250);
  await page.locator(".st-cat-card-btn").first().click();
  await page.locator('.bnav-btn[data-tab="vagt"]').click();
  await expect(page.locator("#vd-ring-num")).toHaveText("11");

  // Historik-fanen skal kunne åbnes
  await page.locator('.bnav-btn[data-tab="history"]').click();
  await page.waitForTimeout(250);
  await expect(page.locator("#view-history")).toHaveClass(/active/);

  // "+"-knappen åbner AI-logoverlay
  await page.locator('.bnav-btn[data-action="qlog"]').click();
  await expect(page.locator("#qlogOverlay")).toHaveClass(/open/);
  await page.locator("#qlogOverlayClose").click();
  await expect(page.locator("#qlogOverlay")).not.toHaveClass(/open/);

  // Profil-fanen viser konto, hold og indstillinger
  await page.locator('.bnav-btn[data-tab="profile"]').click();
  await expect(page.locator("#view-profile")).toHaveClass(/active/);
  await expect(page.locator("#profileCareerStrip")).toBeVisible();
  await expect(page.locator("#socialTeamContent")).toBeVisible();

  // Burgermenuen skal kunne åbnes og navigere til de flyttede faner (Vin, Rangliste, Feed, Lab)
  await page.locator("#burgerBtn").click();
  await expect(page.locator("#logDrawer")).toHaveClass(/open/);
  await page.locator("#logDrawerClose").click();
  await expect(page.locator("#logDrawer")).not.toHaveClass(/open/);

  for (const [btnId, viewId] of [
    ["#menuDrawerVin", "#view-vin"],
    ["#menuDrawerSocial", "#view-social"],
    ["#menuDrawerFeed", "#view-feed"],
    ["#menuDrawerLab", "#view-lab"],
  ]) {
    await page.locator("#burgerBtn").click();
    await page.locator(btnId).click();
    await page.waitForTimeout(250);
    await expect(page.locator(viewId)).toHaveClass(/active/);
  }

  // Tilbage til Overblik → Start vagt → afslut-vagt-flowets trin 1 åbner
  await page.locator('.bnav-btn[data-tab="vagt"]').click();
  await page.locator("#vagtShiftCard").click();
  await expect(page.locator("#vagtShiftCard .vd2-timer")).toBeVisible();
  await page.locator("#vagtShiftCard").click();
  await expect(page.locator("#shiftStep1")).toBeVisible();

  expect(errors).toEqual([]);
});
