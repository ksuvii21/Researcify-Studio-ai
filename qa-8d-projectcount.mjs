const BASE_API = "http://localhost:5000/api/v1";

export default async function run(page) {
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  const log = [];
  const say = (m) => log.push(m);

  // Register a fresh user through the API, then seed the token.
  const creds = {
    name: "Card Count QA",
    email: `cardcount.${Date.now()}@researcify.test`,
    password: "testpass123",
    academicField: "Computer Science",
  };

  const reg = await (await page.request.post(`${BASE_API}/auth/register`, { data: creds })).json();

  const token = reg?.data?.token;
  if (!token) return { error: "registration failed", reg };

  // Create a project and upload two documents into it.
  const proj = await (
    await page.request.post(`${BASE_API}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: "Card Count Project" },
    })
  ).json();

  const projectId = proj?.data?._id;

  for (const title of ["Card Doc One", "Card Doc Two"]) {
    await page.request.post(`${BASE_API}/documents`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        file: {
          name: `${title}.txt`,
          mimeType: "text/plain",
          buffer: Buffer.from("card count qa content"),
        },
        title,
        projectId,
      },
    });
  }

  // Seed the token the way the app reads it.
  await page.goto("http://localhost:5173/");
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, token);

  // ============ Projects list ============
  await page.goto("http://localhost:5173/projects", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".project-card", { timeout: 30000 });
  await page.waitForTimeout(2500);

  const cardText = await page
    .locator(".project-card")
    .filter({ hasText: "Card Count Project" })
    .first()
    .innerText();

  say(`projects list card text:\n${cardText}`);

  // Read the Documents stat specifically.
  const cardNumbers = await page.evaluate(() => {
    const card = [...document.querySelectorAll(".project-card")].find((c) =>
      c.innerText.includes("Card Count Project")
    );
    if (!card) return null;
    return [...card.querySelectorAll("strong")].map((s) => s.innerText.trim());
  });

  say(`card <strong> values: ${JSON.stringify(cardNumbers)}`);

  // ============ Project detail overview ============
  await page
    .locator(".project-card")
    .filter({ hasText: "Card Count Project" })
    .first()
    .locator(".project-card__footer button")
    .first()
    .click();

  await page.waitForSelector(".project-tabs", { timeout: 20000 });
  await page.waitForTimeout(2500);

  const overview = await page.evaluate(() =>
    [...document.querySelectorAll(".overview-card")].map(
      (c) =>
        `${c.querySelector(".overview-card__label")?.innerText} = ${c.querySelector(
          ".overview-card__value"
        )?.innerText}`
    )
  );

  say(`project overview stats:\n  ${overview.join("\n  ")}`);

  // ============ Documents tab ============
  await page.getByRole("button", { name: /^documents$/i }).click();
  await page.waitForTimeout(2500);

  const docRows = await page.locator(".project-document").count();
  say(`project documents tab rows: ${docRows}`);
  say(`project document titles: ${JSON.stringify(await page.locator(".project-document strong").allInnerTexts())}`);

  // ============ General Uploads page ============
  await page.goto("http://localhost:5173/uploads", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const uploadCards = await page.locator(".document-card").count();
  say(`uploads page cards: ${uploadCards}`);

  const bodyText = await page.locator("body").innerText();

  // Verify no mock-era values leak through.
  say(`contains mock "74"? chunks leak: ${bodyText.includes("74 chunks")}`);
  say(`contains mock "AI Education Literature Review": ${bodyText.includes("AI Education Literature Review")}`);

  return {
    steps: log,
    consoleErrors,
    projectId,
    cardNumbers,
    overview,
  };
}
