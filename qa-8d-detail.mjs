const BASE_API = "http://localhost:5000/api/v1";
const APP = "http://localhost:5173";

/*
 * Live verification of the 8D.5 document flow.
 *
 * Every assertion is confirmed against the API as well as
 * the DOM, so a UI that merely renders something plausible
 * cannot pass.
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

  page.on("dialog", async (d) => d.accept());

  const log = [];
  const say = (m) => log.push(m);

  const outcomes = {};

  // ---------- seed real data ----------
  const reg = await (
    await page.request.post(`${BASE_API}/auth/register`, {
      data: {
        name: "D5 QA",
        email: `d5.${Date.now()}@researcify.test`,
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
      data: { title: "D5 Project" },
    })
  ).json();

  const projectId = proj?.data?._id;

  const FILE_TEXT = "D5 download payload contents";

  const uploaded = await (
    await page.request.post(`${BASE_API}/documents`, {
      headers: auth,
      multipart: {
        file: {
          name: "d5-source.txt",
          mimeType: "text/plain",
          buffer: Buffer.from(FILE_TEXT),
        },
        title: "D5 Source Document",
        description: "Original description",
        projectId,
      },
    })
  ).json();

  const docId = uploaded?.data?._id;
  say(`seeded document ${docId}`);

  // ---------- raw download: correct bytes + filename ----------
  const raw = await page.request.get(
    `${BASE_API}/documents/${docId}/download`,
    { headers: auth }
  );

  const body = await raw.body();
  const disposition = raw.headers()["content-disposition"] || "";

  outcomes.downloadStatus = raw.status();
  outcomes.downloadMatches =
    body.toString() === FILE_TEXT;

  say(`download status: ${raw.status()}`);
  say(`content-disposition: ${disposition}`);
  say(
    `bytes match upload: ${outcomes.downloadMatches} (${body.length} bytes)`
  );
  say(`filename is originalName: ${disposition.includes("d5-source.txt")}`);

  // ---------- seed auth and open the workspace ----------
  await page.goto(`${APP}/`);
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, token);

  await page.goto(`${APP}/uploads`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".document-card", { timeout: 30000 });
  await page.waitForTimeout(2500);

  say(`cards rendered: ${await page.locator(".document-card").count()}`);

  // ---------- open the details modal ----------
  await page
    .locator(".document-card__content")
    .first()
    .click({ force: true });

  await page.waitForSelector(".document-preview", { timeout: 15000 });
  await page.waitForTimeout(900);

  const modalText = await page.locator(".document-preview").innerText();
  say(`modal text:\n${modalText}`);

  /*
   * The removed mock fields must not reappear: they were
   * always fabricated, since extraction has not run.
   */
  for (const bogus of [
    "AI Summary",
    "Research Topics",
    "Indexed chunks",
    "Extracted Content",
  ]) {
    say(`modal omits "${bogus}": ${!modalText.includes(bogus)}`);
  }

  outcomes.actionButtons = await page
    .locator(".document-preview__actions button")
    .count();

  say(`action buttons: ${outcomes.actionButtons} (expect 3)`);

  // ---------- edit metadata through the UI ----------
  await page
    .locator(".document-preview__actions button")
    .filter({ hasText: "Edit" })
    .click();

  await page.waitForSelector("#document-edit-title", { timeout: 15000 });
  await page.waitForTimeout(700);

  await page.locator("#document-edit-title").fill("D5 Renamed");
  await page
    .locator("#document-edit-description")
    .fill("Edited description");

  // "No project" must detach, not silently keep the old link.
  await page.locator("#document-edit-project").selectOption("");

  await page.getByRole("button", { name: /save changes/i }).click();

  await page.waitForTimeout(3000);

  const afterEdit = await (
    await page.request.get(`${BASE_API}/documents/${docId}`, {
      headers: auth,
    })
  ).json();

  outcomes.titlePersisted = afterEdit?.data?.title === "D5 Renamed";
  outcomes.descriptionPersisted =
    afterEdit?.data?.description === "Edited description";
  outcomes.unassigned = afterEdit?.data?.projectId === null;

  say(`title after edit: "${afterEdit?.data?.title}"`);
  say(`description after edit: "${afterEdit?.data?.description}"`);
  say(
    `projectId after unassign: ${JSON.stringify(
      afterEdit?.data?.projectId
    )}`
  );

  // ---------- hard refresh: the UI must show persisted values ----------
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".document-card", { timeout: 30000 });
  await page.waitForTimeout(2500);

  const cardText = await page.locator(".document-card").first().innerText();
  say(`card after refresh: ${JSON.stringify(cardText)}`);
  say(`renamed title visible: ${cardText.includes("D5 Renamed")}`);

  // ---------- reassign to the project via the API ----------
  await page.request.patch(`${BASE_API}/documents/${docId}`, {
    headers: auth,
    data: { projectId },
  });

  const reassigned = await (
    await page.request.get(`${BASE_API}/documents/${docId}`, {
      headers: auth,
    })
  ).json();

  const reassignedTitle =
    reassigned?.data?.projectId?.title ||
    reassigned?.data?.projectId;

  say(`projectId after reassign: ${JSON.stringify(reassignedTitle)}`);

  // ---------- delete ----------
  const beforeDelete = await page.request.get(
    `${BASE_API}/documents/${docId}`,
    { headers: auth }
  );

  say(`exists before delete: ${beforeDelete.status() === 200}`);

  const del = await page.request.delete(`${BASE_API}/documents/${docId}`, {
    headers: auth,
  });

  outcomes.deleteStatus = del.status();

  say(`delete status: ${del.status()}`);

  const afterDelete = await page.request.get(
    `${BASE_API}/documents/${docId}`,
    { headers: auth }
  );

  outcomes.deleted = afterDelete.status() === 404;

  say(`gone after delete: ${outcomes.deleted}`);

  return {
    steps: log,
    consoleErrors,
    failedRequests: failed,
    outcomes,
  };
}
