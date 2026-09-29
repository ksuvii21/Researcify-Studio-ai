const BASE_API = "http://localhost:5000/api/v1";

/*
 * Focused check: does the project DETAIL overview show the real
 * document count, and does the card still show it too?
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
        name: "Overview QA",
        email: `overview.${Date.now()}@researcify.test`,
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
      data: { title: "Overview Count Project" },
    })
  ).json();

  const projectId = proj?.data?._id;

  // Three documents: two in the project, one general.
  for (const [title, pid] of [
    ["Overview Doc A", projectId],
    ["Overview Doc B", projectId],
    ["Overview General", null],
  ]) {
    await page.request.post(`${BASE_API}/documents`, {
      headers: auth,
      multipart: {
        file: {
          name: `${title}.txt`,
          mimeType: "text/plain",
          buffer: Buffer.from("overview qa"),
        },
        title,
        ...(pid ? { projectId: pid } : {}),
      },
    });
  }

  await page.goto("http://localhost:5173/");
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, token);

  // ---- detail page overview stats ----
  await page.goto(`http://localhost:5173/projects/${projectId}`, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector(".project-overview-stat", { timeout: 30000 });
  await page.waitForTimeout(3000);

  const stats = await page.evaluate(() =>
    [...document.querySelectorAll(".project-overview-stat")].map((s) =>
      s.innerText.replace(/\n+/g, " | ").trim()
    )
  );

  say(`detail overview stats: ${JSON.stringify(stats)}`);

  const documentsStat = stats.find((s) => /document/i.test(s));
  say(`documents stat reads: "${documentsStat}" (expect 2)`);

  // ---- card on the list page ----
  await page.goto("http://localhost:5173/projects", {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector(".project-card", { timeout: 30000 });
  await page.waitForTimeout(2500);

  const cardStats = await page.evaluate(() => {
    const card = [...document.querySelectorAll(".project-card")].find((c) =>
      c.innerText.includes("Overview Count Project")
    );
    if (!card) return null;
    return [...card.querySelectorAll(".project-card__stats > *")].map((n) =>
      n.innerText.replace(/\n+/g, " | ").trim()
    );
  });

  say(`list card stats: ${JSON.stringify(cardStats)}`);

  // ---- raw API shape ----
  const apiList = await (
    await page.request.get(`${BASE_API}/projects`, { headers: auth })
  ).json();

  const apiProject = apiList?.data?.find((p) => p._id === projectId);
  say(`API project.documentCount = ${JSON.stringify(apiProject?.documentCount)}`);

  // ---- uploads page shows all three ----
  await page.goto("http://localhost:5173/uploads", {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(3000);

  const uploadCards = await page.locator(".document-card").count();
  say(`uploads page total cards = ${uploadCards} (expect 3)`);

  return { steps: log, consoleErrors, documentCount: apiProject?.documentCount };
}
