const BASE_API = "http://localhost:5000/api/v1";

/*
 * Theme check for the documents surfaces.
 *
 * Uses the app's real theme key (researcify-theme) and
 * reads computed colours after the ThemeProvider has
 * applied data-theme, so the two runs are genuinely
 * different rather than both falling back to the default.
 */
export default async function run(page) {
  const log = [];
  const say = (m) => log.push(m);

  const reg = await (
    await page.request.post(`${BASE_API}/auth/register`, {
      data: {
        name: "Theme QA",
        email: `theme.${Date.now()}@researcify.test`,
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
        name: "theme-doc.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("theme qa"),
      },
      title: "Theme Document",
    },
  });

  const results = {};

  for (const theme of ["dark", "light"]) {
    // Seed the theme BEFORE the app mounts so the provider
    // reads it as the initial value.
    await page.goto("http://localhost:5173/");

    await page.evaluate(
      ({ t, tok }) => {
        window.localStorage.setItem("researcify-theme", t);
        window.localStorage.setItem("researcify_token", tok);
      },
      { t: theme, tok: token }
    );

    await page.goto("http://localhost:5173/uploads", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector(".document-card", { timeout: 30000 });
    await page.waitForTimeout(2500);

    const measured = await page.evaluate(() => {
      const card = document.querySelector(".document-card");
      const body = document.body;

      return {
        appliedTheme: document.documentElement.getAttribute("data-theme"),
        cardBg: card ? getComputedStyle(card).backgroundColor : "none",
        cardColor: card ? getComputedStyle(card).color : "none",
        bodyBg: getComputedStyle(body).backgroundColor,
      };
    });

    results[theme] = measured;
    say(`${theme}: ${JSON.stringify(measured)}`);
  }

  // Open the details modal in light theme and sample it too.
  await page.goto("http://localhost:5173/uploads", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector(".document-card", { timeout: 30000 });
  await page.waitForTimeout(1500);

  await page.locator(".document-card__content").first().click({ force: true });
  await page.waitForSelector(".document-preview", { timeout: 15000 });
  await page.waitForTimeout(800);

  const modalTheme = await page.evaluate(() => {
    const modal = document.querySelector(".document-preview");
    return {
      theme: document.documentElement.getAttribute("data-theme"),
      modalBg: modal ? getComputedStyle(modal).backgroundColor : "none",
      actionButtons: document.querySelectorAll(
        ".document-preview__actions button"
      ).length,
    };
  });

  say(`modal: ${JSON.stringify(modalTheme)}`);

  const themesDiffer =
    results.dark?.cardBg !== results.light?.cardBg ||
    results.dark?.bodyBg !== results.light?.bodyBg;

  say(`themes produce different colours: ${themesDiffer}`);

  return { steps: log, themesDiffer, results };
}
