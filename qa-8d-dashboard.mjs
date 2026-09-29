const BASE_API = "http://localhost:5000/api/v1";
const APP = "http://localhost:5173";

/*
 * 8D.6: the dashboard's Recent Documents section must show
 * real UploadedDocument records, not mock content.
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
        name: "D6 QA",
        email: `d6.${Date.now()}@researcify.test`,
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
      data: { title: "D6 Project" },
    })
  ).json();

  // One project-scoped document, one general document.
  for (const [title, pid] of [
    ["D6 Project Document", proj?.data?._id],
    ["D6 General Document", null],
  ]) {
    await page.request.post(`${BASE_API}/documents`, {
      headers: auth,
      multipart: {
        file: {
          name: `${title}.txt`,
          mimeType: "text/plain",
          buffer: Buffer.from("d6 qa"),
        },
        title,
        ...(pid ? { projectId: pid } : {}),
      },
    });
  }

  await page.goto(`${APP}/`);
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, token);

  await page.goto(`${APP}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".dashboard-home", { timeout: 30000 });
  await page.waitForTimeout(4000);

  const section = page.locator(".recent-documents");
  const sectionCount = await section.count();

  say(`Recent Documents section present: ${sectionCount > 0}`);

  if (sectionCount) {
    say(`section text:\n${await section.innerText()}`);
  }

  const rows = await page.locator(".recent-document").count();
  say(`document rows rendered: ${rows} (expect 2)`);

  const rowTitles = await page
    .locator(".recent-document__info strong")
    .allInnerTexts();

  say(`row titles: ${JSON.stringify(rowTitles)}`);

  say(
    `project doc shows project name: ${(await section.innerText()).includes(
      "D6 Project"
    )}`
  );

  say(
    `general doc shows "Not assigned": ${(await section.innerText()).includes(
      "Not assigned"
    )}`
  );

  say(
    `shows "Uploaded" status: ${(await section.innerText()).includes(
      "Uploaded"
    )}`
  );

  // The dashboard body must not carry known mock strings.
  const body = await page.locator("body").innerText();

  for (const mock of [
    "Generative AI and Personalized Learning Environments",
    "Human-AI Collaboration: Emerging Research Directions",
    "R. Sharma",
    "S. Patel",
  ]) {
    say(`dashboard omits mock "${mock.slice(0, 30)}": ${!body.includes(mock)}`);
  }

  return {
    steps: log,
    consoleErrors,
    failedRequests: failed,
    rows,
    rowTitles,
  };
}
