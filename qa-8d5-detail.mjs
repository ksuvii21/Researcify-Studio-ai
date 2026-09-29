const BASE_API = "http://localhost:5000/api/v1";

/*
 * 8D.5 / 8D.6 live UI regression.
 *
 * Uploads a real document through the API, then drives the
 * actual UI: card -> details modal -> download -> edit
 * metadata -> theme switch. Verifies only real API-backed
 * values are rendered, and that no mock-era vocabulary
 * (AI summary, tags, pages, words, chunks) leaks in.
 */
export default async function run(page) {
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  const failed = [];
  page.on("requestfailed", (r) =>
    failed.push(`${r.failure()?.errorText} ${r.url()}`)
  );

  const log = [];
  const say = (m) => log.push(m);

  const reg = await (
    await page.request.post(`${BASE_API}/auth/register`, {
      data: {
        name: "UI QA",
        email: `d5ui.${Date.now()}@researcify.test`,
        password: "testpass123",
        academicField: "Computer Science",
      },
    })
  ).json();

  const token = reg?.data?.token;
  if (!token) return { error: "registration failed" };

  const auth = { Authorization: `Bearer ${token}` };

  const proj = await (
    await page.request.post(`${BASE_API}/projects`, {
      headers: auth,
      data: { title: "UI Detail Project" },
    })
  ).json();

  const projectId = proj?.data?._id;

  const up = await (
    await page.request.post(`${BASE_API}/documents`, {
      headers: auth,
      multipart: {
        file: {
          name: "attention-paper.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("real document bytes for 8D.5 UI qa"),
        },
        title: "Transformer Survey",
        description: "Literature review source material.",
        projectId,
      },
    })
  ).json();

  const docId = up?.data?._id;
  say(`seeded document ${docId}`);

  await page.goto("http://localhost:5173/");
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, token);

  // ================= UPLOADS WORKSPACE =================
  await page.goto("http://localhost:5173/uploads", {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector(".document-card", { timeout: 30000 });
  await page.waitForTimeout(2000);

  const cardCount = await page.locator(".document-card").count();
  say(`document cards: ${cardCount}`);

  const cardText = await page.locator(".document-card").first().innerText();
  say(`card text: ${JSON.stringify(cardText.replace(/\n+/g, " | "))}`);

  say(`card shows 'Uploaded' status: ${cardText.includes("Uploaded")}`);

  // ================= DETAILS MODAL =================
  /*
   * The card body is a role="button" div containing text
   * nodes. Playwright's actionability check can stall on
   * it because the hit target is a child element, so click
   * through the locator directly.
   */
  const openDetails = async () => {
    await page.locator(".document-card__content").first().click({
      force: true,
    });

    await page.waitForSelector(".document-preview", { timeout: 15000 });
    await page.waitForTimeout(800);
  };

  await openDetails();

  const modalText = await page.locator(".document-preview").innerText();
  say(`details modal: ${JSON.stringify(modalText.replace(/\n+/g, " | "))}`);

  // Real fields must be present.
  say(`shows title: ${modalText.includes("Transformer Survey")}`);
  say(`shows project: ${modalText.includes("UI Detail Project")}`);
  say(`shows original filename: ${modalText.includes("attention-paper.txt")}`);
  say(`shows description: ${modalText.includes("Literature review source material")}`);
  say(`shows Not assigned fallback logic present: ${modalText.includes("Not assigned") || modalText.includes("UI Detail Project")}`);

  /*
   * Fabricated fields must NOT be present. Match only
   * strings the app would generate, never our own input.
   */
  const fabricated = [
    "AI Summary",
    "Research Topics",
    "Indexed chunks",
    "Pages",
    "words",
    "Extracted Text",
    "Ask AI About Document",
  ];

  const leaks = fabricated.filter((f) => modalText.includes(f));
  say(`fabricated-field leaks: ${JSON.stringify(leaks)} (expect [])`);

  // ================= DOWNLOAD =================
  const downloadPromise = page.waitForEvent("download", {
    timeout: 20000,
  });

  await page.getByRole("button", { name: /^download$/i }).click();

  let downloadName = "";
  try {
    const download = await downloadPromise;
    downloadName = download.suggestedFilename();
  } catch (err) {
    say(`download event error: ${err.message}`);
  }

  say(`download suggested filename: "${downloadName}" (expect attention-paper.txt)`);

  await page.waitForTimeout(1200);

  // ================= EDIT METADATA =================
  await openDetails();

  await page.getByRole("button", { name: /^edit$/i }).click();
  await page.waitForSelector("#document-edit-title", { timeout: 15000 });
  await page.waitForTimeout(500);

  await page.locator("#document-edit-title").fill("Transformer Survey Revised");
  await page.locator("#document-edit-description").fill("Edited via UI in 8D.5.");
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForTimeout(3000);

  const afterEdit = await page.locator(".document-card").first().innerText();
  say(`card after edit: ${JSON.stringify(afterEdit.replace(/\n+/g, " | "))}`);
  say(`title updated in UI: ${afterEdit.includes("Transformer Survey Revised")}`);

  // Confirm it persisted server-side.
  const apiDoc = await (
    await page.request.get(`${BASE_API}/documents/${docId}`, {
      headers: auth,
    })
  ).json();

  say(`API title after edit: "${apiDoc?.data?.title}"`);
  say(`API description after edit: "${apiDoc?.data?.description}"`);

  // ================= UNASSIGN VIA EDIT =================
  await openDetails();

  await page.getByRole("button", { name: /^edit$/i }).click();
  await page.waitForSelector("#document-edit-project", { timeout: 15000 });
  await page.waitForTimeout(500);

  await page.locator("#document-edit-project").selectOption("");
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForTimeout(3000);

  const apiDoc2 = await (
    await page.request.get(`${BASE_API}/documents/${docId}`, {
      headers: auth,
    })
  ).json();

  say(`projectId after unassign: ${JSON.stringify(apiDoc2?.data?.projectId)} (expect null)`);

  // ================= PROJECT COUNT DECREMENTS =================
  const projAfter = await (
    await page.request.get(`${BASE_API}/projects`, { headers: auth })
  ).json();

  const projRow = projAfter?.data?.find((p) => p._id === projectId);
  say(`project documentCount after unassign: ${projRow?.documentCount} (expect 0)`);

  // ================= THEMES =================
  await page.goto("http://localhost:5173/settings", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(2000);

  for (const theme of ["light", "dark"]) {
    await page.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
      window.localStorage.setItem("researcify_theme", t);
    }, theme);

    await page.goto("http://localhost:5173/uploads", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector(".document-card", { timeout: 30000 });
    await page.waitForTimeout(1500);

    const bg = await page.evaluate(() => {
      const card = document.querySelector(".document-card");
      return card ? getComputedStyle(card).backgroundColor : "none";
    });

    say(`${theme} theme: card bg = ${bg}`);
  }

  return {
    steps: log,
    consoleErrors,
    failedRequests: failed,
    docId,
    downloadName,
  };
}
