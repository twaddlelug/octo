import { HTTPException } from "hono/http-exception";
import { parse } from "node-html-parser";
import { fetchGitHub } from "../lib/github";
import type { ContributionsResponse } from "../types";

const TTL = {
  ONE_HOUR: 3600,
  SIX_HOURS: 21600,
} as const;

const parseHtml = (html: string): ContributionsResponse => {
  const root = parse(html);

  const tooltips = new Map(
    root
      .querySelectorAll("tool-tip[for]")
      .map((tip) => [tip.getAttribute("for"), tip.text.trim()]),
  );

  const contributions = root
    .querySelectorAll("td.ContributionCalendar-day[data-date]")
    .map((cell) => ({
      date: cell.getAttribute("data-date") ?? "",
      count: parseInt(tooltips.get(cell.getAttribute("id")) ?? "0", 10) || 0,
      level: parseInt(cell.getAttribute("data-level") ?? "0", 10),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const heading = root.querySelector("h2.f4.text-normal.mb-2");
  const totalMatch = heading?.text.match(/([\d,]+)\s+contributions?/);
  const total = totalMatch
    ? parseInt(totalMatch[1].replace(/,/g, ""), 10)
    : contributions.reduce((sum, c) => sum + c.count, 0);

  return { total, contributions };
};

const parseYearParam = (param: string | undefined): number | null => {
  if (!param) return null;

  const year = parseInt(param, 10);
  const currentYear = new Date().getFullYear();

  if (Number.isNaN(year) || year < 2005 || year > currentYear) {
    throw new HTTPException(400, { message: "invalid year parameter" });
  }

  return year;
};

const isPastYear = (year: number | null): boolean =>
  year !== null && year < new Date().getFullYear();

const getContributions = async (
  username: string,
  year: number | null,
): Promise<ContributionsResponse> => {
  const range = year ? `?from=${year}-01-01&to=${year}-12-31` : "";
  const res = await fetchGitHub(`users/${username}/contributions${range}`);

  if (res.status === 404)
    throw new HTTPException(404, { message: "user not found" });
  if (!res.ok) throw new HTTPException(502, { message: "bad gateway" });

  return parseHtml(await res.text());
};

export { getContributions, parseYearParam, isPastYear, TTL };
