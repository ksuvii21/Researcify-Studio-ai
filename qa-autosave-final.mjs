import fs from "node:fs";

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

const NOTE_ID = "6abb8ea2a887aa8d61df0c6d";

export default async function run(page) {
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  const patchBodies = [];
  page.on("request", (r) => {
    if (r.method() === "PATCH" && r.url().includes("/notes/")) {
      patchBodies.push(r.postData());
    }
  });

  // Seed token, then navigate.
  await page.goto("http://localhost:5173/", { waitUntil: "load" });
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, TOKEN);

  await page.goto(`http://localhost:5173/notes/${NOTE_ID}`, {
    waitUntil: "load",
  });

  // Wait until the editor is genuinely mounted and React-owned.
  await page.waitForFunction(
    () => {
      const el = document.querySelector(".note-title-input");
      if (!el || !el.isConnected) return false;
      if (!Object.keys(el).some((k) => k.startsWith("__reactProps"))) {
        return false;
      }
      return document.body.innerText.includes("Notes");
    },
    { timeout: 60000 }
  );

  await page.waitForTimeout(2500);

  const out = {};
  const titleInput = page.locator(".note-title-input");
  const status = () => page.locator(".note-save-status").innerText();

  out.url = page.url();
  out.initialTitle = await titleInput.inputValue();
  out.initialStatus = await status();

  // ---- edit title ----
  await titleInput.click();
  await titleInput.press("End");
  await page.keyboard.type(" REV", { delay: 70 });

  await page.waitForTimeout(300);
  out.step12_afterTyping = await status();

  await page.waitForTimeout(900);
  out.step13_midFlight = await status();

  await page.waitForTimeout(3000);
  out.step15_settled = await status();
  out.patchesAfterTitle = patchBodies.length;
  out.lastPatchBody = patchBodies[patchBodies.length - 1];

  // ---- reload, confirm persistence ----
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(
    () => !!document.querySelector(".note-title-input")?.isConnected,
    { timeout: 60000 }
  );
  await page.waitForTimeout(2000);
  out.step17_titleAfterReload = await page
    .locator(".note-title-input")
    .inputValue();

  // ---- rapid content edits: final must win ----
  const area = page.locator(".note-editor__content");
  for (let i = 1; i <= 6; i += 1) {
    await area.click();
    await area.press("Control+a");
    await page.keyboard.type(`Rapid revision ${i}`, { delay: 12 });
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(4000);
  out.step20_status = await status();

  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(
    () => !!document.querySelector(".note-editor__content")?.isConnected,
    { timeout: 60000 }
  );
  await page.waitForTimeout(2000);
  out.step20b_contentAfterReload = await page
    .locator(".note-editor__content")
    .inputValue();

  // ---- edit during an in-flight save ----
  await area.click();
  await area.press("Control+a");
  await page.keyboard.type("Edit during save A", { delay: 12 });
  await page.waitForTimeout(1100);
  await area.click();
  await area.press("Control+a");
  await page.keyboard.type("Edit during save B", { delay: 12 });
  await page.waitForTimeout(800);
  out.step22_statusDuringRace = await status();

  await page.waitForTimeout(4000);
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(
    () => !!document.querySelector(".note-editor__content")?.isConnected,
    { timeout: 60000 }
  );
  await page.waitForTimeout(2000);
  out.step23_finalContent = await page
    .locator(".note-editor__content")
    .inputValue();

  out.totalPatches = patchBodies.length;

  return { ...out, consoleErrors };
}