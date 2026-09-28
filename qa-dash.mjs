import fs from "node:fs";

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

export default async function run(page, ui) {
  await page.goto("http://localhost:5173/");
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, TOKEN);

  // Seed a project so the dashboard has something.
  await page.goto("http://localhost:5173/projects");
  await page.waitForSelector(".projects-page", { timeout: 20000 });
  await page.waitForTimeout(1500);

  await page.getByRole("button", { name: /new project/i }).first().click();
  await page.waitForSelector(".app-modal", { timeout: 10000 });
  await page.locator("#project-form-title").fill("Dashboard Probe Project");
  await page.getByRole("button", { name: /create project/i }).click();
  await page.waitForTimeout(2500);

  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(6000);

  return await page.evaluate(() => {
    const home = document.querySelector(".dashboard-home");
    return {
      url: location.href,
      bodyStart: document.body.innerText
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 260),
      hasDashboardHome: !!home,
      dashboardHomeChildren: home
        ? [...home.children].map(
            (c) => c.className || c.tagName
          )
        : [],
      overviewCards: document.querySelectorAll(".overview-card").length,
      overviewSection: !!document.querySelector(".research-overview-grid"),
      projectCards: document.querySelectorAll(
        ".dashboard-projects .project-card"
      ).length,
      projectsState: document
        .querySelector(".dashboard-projects__state")
        ?.innerText?.replace(/\s+/g, " ")
        .trim(),
      continueH3: document.querySelector(
        ".continue-research__project h3"
      )?.innerText,
      sidebarPresent: !!document.querySelector(
        ".dashboard-sidebar, aside"
      ),
    };
  });
}