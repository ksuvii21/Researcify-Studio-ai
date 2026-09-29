import fs from "node:fs";

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

const log = [];
const say = (m) => log.push(m);

export default async function run(page) {
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  const failed = [];
  page.on("requestfailed", (r) =>
    failed.push(`${r.failure()?.errorText} ${r.url()}`)
  );

  const patches = [];
  page.on("response", (r) => {
    if (r.request().method() === "PATCH" && r.url().includes("/notes/")) {
      patches.push(r.status());
    }
  });

  page.on("dialog", async (d) => {
    say(`      [confirm] "${d.message()}"`);
    await d.accept();
  });

  // ---- Seed token FIRST, on the origin, before any protected nav ----
  await page.goto("http://localhost:5173/");
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, TOKEN);

  // Verify auth took effect before proceeding.
  await page.goto("http://localhost:5173/dashboard", {
    waitUntil: "networkidle",
  });
  await page.waitForSelector(".dashboard-home", { timeout: 30000 });
  await page.waitForFunction(
    () => !!document.querySelector(".dashboard-home")?.isConnected,
    { timeout: 15000 }
  );
  say(`0.  authenticated (dashboard loaded, url=${page.url().replace("http://localhost:5173", "")})`);

  // ================= 8C.5 PAPER NOTES =================
  await page.goto("http://localhost:5173/library", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector(".library-paper", { timeout: 25000 });
  await page.waitForTimeout(2000);

  const paperTitle = await page
    .locator(".library-paper h2")
    .first()
    .innerText();
  say(`1.  paper: "${paperTitle}"`);

  await page.locator(".library-paper__title").first().click();
  await page.waitForSelector(".paper-detail-header", { timeout: 20000 });
  await page.waitForTimeout(2500);

  say(`2.  paper notes section present: ${(await page.locator(".paper-detail-notes").count()) > 0}`);
  say(`2b. existing paper notes: ${await page.locator(".paper-note").count()}`);

  await page.getByRole("button", { name: /add note/i }).first().click();
  await page.waitForSelector(".app-modal", { timeout: 10000 });
  await page.waitForTimeout(700);
  say(`3.  paper picker shown? ${(await page.locator("#note-form-paper").count()) > 0} (expect false)`);

  await page.locator("#note-form-title").fill("Attention observations");
  await page
    .locator("#note-form-content")
    .fill("Multi-head attention lets the model attend to information jointly.");
  await page.getByRole("button", { name: /create note/i }).last().click();
  await page.waitForTimeout(2800);
  say(`4.  paper notes now: ${await page.locator(".paper-note").count()}`);

  const bound = await page.evaluate(async () => {
    const t = window.localStorage.getItem("researcify_token");
    const r = await fetch(
      "http://localhost:5000/api/v1/notes?search=Attention observations",
      { headers: { Authorization: "Bearer " + t } }
    );
    const j = await r.json();
    const n = j.data[0];
    return {
      paperBound: !!n?.paperId,
      paperTitle: n?.paperId?.title,
      id: n?._id,
    };
  });
  say(`5.  paperId auto-bound: ${bound.paperBound} -> "${bound.paperTitle}"`);

  await page.reload();
  await page.waitForTimeout(2500);
  say(`6.  after refresh: ${await page.locator(".paper-note").count()} note(s)`);

  await page.locator(".paper-note__actions button").nth(1).click();
  await page.waitForTimeout(2000);
  await page.reload();
  await page.waitForTimeout(2500);
  say(`7/8. pin persisted: ${(await page.locator(".paper-note__actions button.active").count()) > 0}`);

  // ================= 8C.6 EDITOR + AUTOSAVE =================
  const noteId = bound.id;
  await page.goto(`http://localhost:5173/notes/${noteId}`, {
    waitUntil: "networkidle",
  });
  await page.waitForSelector(".note-workspace", { timeout: 25000 });

  /*
   * Guard against inspecting a detached document: the
   * input must be connected AND React-owned.
   */
  await page.waitForFunction(
    () => {
      const el = document.querySelector(".note-title-input");
      if (!el || !el.isConnected) return false;
      return Object.keys(el).some((k) =>
        k.startsWith("__reactProps")
      );
    },
    { timeout: 20000 }
  );

  await page.waitForTimeout(1500);

  say(`9/10. editor at ${page.url().replace("http://localhost:5173", "")}`);

  const statusOf = () => page.locator(".note-save-status").innerText();
  say(`11. initial status: "${await statusOf()}"`);

  // 12-15 change title, watch the status transitions
  const titleInput = page.locator(".note-title-input");
  await titleInput.click();
  await titleInput.press("End");
  await page.keyboard.type(" revised", { delay: 40 });
  await page.waitForTimeout(300);
  say(`12. after typing: "${await statusOf()}" (expect Unsaved changes)`);

  await page.waitForTimeout(750);
  say(`13/14. mid-flight: "${await statusOf()}"`);

  await page.waitForTimeout(2500);
  say(`15. settled: "${await statusOf()}" (expect Saved)`);
  say(`     PATCHes so far: ${patches.length}`);

  // 16-17 persists
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".note-workspace", { timeout: 25000 });
  await page.waitForTimeout(2000);
  say(`16/17. title after refresh = "${await page.locator(".note-title-input").inputValue()}"`);

  // 18-20 rapid edits, final wins
  const area = page.locator(".note-editor__content");
  for (let i = 1; i <= 6; i += 1) {
    await area.click();
    await area.press("Control+a");
    await page.keyboard.type(`Rapid revision ${i}`, { delay: 15 });
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(3200);
  say(`18/19/20. after 6 rapid edits: "${await statusOf()}"`);

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".note-workspace", { timeout: 25000 });
  await page.waitForTimeout(2000);
  say(`20b. persisted content = "${await page.locator(".note-editor__content").inputValue()}"`);

  // 21-23 edit while a save is in flight
  await area.click();
  await area.press("Control+a");
  await page.keyboard.type("Edit during save A", { delay: 15 });
  await page.waitForTimeout(1080); // let the PATCH fire
  await area.click();
  await area.press("Control+a");
  await page.keyboard.type("Edit during save B", { delay: 15 });
  await page.waitForTimeout(700);
  say(`21/22. during in-flight save: "${await statusOf()}"`);

  await page.waitForTimeout(3000);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".note-workspace", { timeout: 25000 });
  await page.waitForTimeout(2000);
  const raced = await page.locator(".note-editor__content").inputValue();
  say(`23. final revision = "${raced}" (expect "Edit during save B")`);

  // ================= 27-31 NAVIGATION =================
  await page.goto("http://localhost:5173/notes", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector(".note-card", { timeout: 25000 });
  await page.waitForTimeout(1800);
  await page
    .locator(".note-card")
    .filter({ hasText: "Attention observations" })
    .first()
    .locator("footer button")
    .click();
  await page.waitForSelector(".note-workspace", { timeout: 20000 });
  await page.waitForTimeout(1500);
  say(`31. workspace Open Note -> ${page.url().replace("http://localhost:5173", "")}`);

  await page.goto("http://localhost:5173/projects", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector(".project-card", { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.locator(".project-card__footer button").first().click();
  await page.waitForSelector(".project-tabs", { timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: /^notes$/i }).click();
  await page.waitForTimeout(2200);
  const projNotes = await page.locator(".project-note-card").count();
  say(`28. project Notes tab -> ${projNotes} note(s)`);

  if (projNotes > 0) {
    await page.locator(".project-note-card__actions button").first().click();
    await page.waitForSelector(".note-workspace", { timeout: 20000 });
    await page.waitForTimeout(1200);
    say(`29/30. project note -> ${page.url().replace("http://localhost:5173", "")}`);
  }

  // ================= 32-35 DASHBOARD =================
  await page.goto("http://localhost:5173/dashboard", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector(".dashboard-home", { timeout: 25000 });
  await page.waitForTimeout(3500);

  const dash = await page.evaluate(() =>
    [...document.querySelectorAll(".overview-card")].map(
      (c) =>
        `${c.querySelector(".overview-card__label")?.innerText} = ${c
          .querySelector(".overview-card__value")
          ?.innerText} (${c.querySelector("small")?.innerText})`
    )
  );
  say("32/35. dashboard:");
  dash.forEach((s) => say(`      ${s}`));

  const backendTotal = await page.evaluate(async () => {
    const t = window.localStorage.getItem("researcify_token");
    const r = await fetch(
      "http://localhost:5000/api/v1/notes?archived=all",
      { headers: { Authorization: "Bearer " + t } }
    );
    const j = await r.json();
    return j.data.length;
  });
  say(`32b. backend notes (archived=all) = ${backendTotal}`);

  return {
    steps: log,
    consoleErrors,
    failedRequests: failed,
    patchStatuses: patches,
    noteId,
  };
}