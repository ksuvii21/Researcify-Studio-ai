import fs from "node:fs";

const TOKEN = fs
  .readFileSync(process.env.TEMP + "\\p8a_tok.txt", "utf8")
  .trim();

export default async function run(page, ui) {
  await page.goto("http://localhost:5173/");
  await page.evaluate((t) => {
    window.localStorage.setItem("researcify_token", t);
  }, TOKEN);

  const api = [];
  page.on("response", (res) => {
    if (res.url().includes("/api/v1/projects")) {
      api.push(res.status());
    }
  });

  // ---------- 12-14. Dashboard ----------
  await page.goto("http://localhost:5173/dashboard");
  await page.waitForSelector(".dashboard-home", { timeout: 25000 });
  await page.waitForTimeout(4000);

  const dash = await page.evaluate(() => {
    const overview = [
      ...document.querySelectorAll(".overview-card"),
    ].map((c) => ({
      label: c.querySelector(".overview-card__label")?.innerText,
      value: c.querySelector(".overview-card__value")?.innerText,
      note: c.querySelector("small")?.innerText,
    }));
    return {
      overview,
      recentProjects: [
        ...document.querySelectorAll(
          ".dashboard-projects .project-card h3"
        ),
      ].map((h) => h.innerText),
      continueTitle: document.querySelector(
        ".continue-research__project h3"
      )?.innerText,
      projectsState: document
        .querySelector(".dashboard-projects__state")
        ?.innerText?.replace(/\s+/g, " ")
        .trim(),
    };
  });

  return { steps: ["12-14. dashboard"], dash, api };
}