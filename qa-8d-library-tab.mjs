const BASE_API = "http://localhost:5000/api/v1";

/*
 * Verifies the LibraryPreview card now renders real
 * papers/documents instead of the removed fabricated rows.
 */
export default async function run(page) {
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  const log = [];
  const say = (m) => log.push(m);

  const reg = await (
    await page.request.post(`${BASE_API}/auth/register`, {
      data: {
        name: "Lib QA",
        email: `lib.${Date.now()}@researcify.test`,
        password: "testpass123",
        academicField: "Computer Science",
      },
    })
  ).json();

  const token = reg?.data?.token;
  const auth = { Authorization: `Bearer ${token}` };

  await page.request.post(`${BASE_API}/documents`, {
    headers: auth,
    multipart: {
      file: {
        name: "lib-doc.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("lib qa"),
      },
      title: "Lib Real Document",
    },
  });

  await page.goto("http://localhost:5173/");
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, token);

  await page.goto("http://localhost:5173/dashboard", {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector(".library-preview", { timeout: 30000 });
  await page.waitForTimeout(4000);

  const section = page.locator(".library-preview");

  const initial = await section.innerText();
  say(`library (Recent tab):\n${initial}`);

  await page
    .locator(".library-preview__tabs button")
    .filter({ hasText: "Uploaded" })
    .click();

  await page.waitForTimeout(1500);

  const uploaded = await section.innerText();
  say(`library (Uploaded tab):\n${uploaded}`);

  say(`shows real uploaded doc: ${uploaded.includes("Lib Real Document")}`);

  // The fabricated rows and invented authors must be gone.
  for (const fake of [
    "R. Sharma",
    "S. Patel",
    "L. Chen",
    "Human-AI Collaboration: Emerging Research Directions",
    "Explainable AI in Adaptive Learning Systems",
  ]) {
    say(`library omits fake "${fake}": ${!(await section.innerText()).includes(fake)}`);
  }

  return { steps: log, consoleErrors };
}
