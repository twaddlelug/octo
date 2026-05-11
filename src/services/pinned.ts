import { HTTPException } from "hono/http-exception";
import { parse } from "node-html-parser";
import { fetchGitHub } from "../lib/github";
import type { PinnedRepo } from "../types";

const TTL = {
  TWO_HOURS: 7200,
} as const;

const parseHtml = (html: string): PinnedRepo[] => {
  const root = parse(html);
  const pinned: PinnedRepo[] = [];

  for (const item of root.querySelectorAll(".pinned-item-list-item-content")) {
    const anchor = item.querySelector("a.text-bold");
    if (!anchor) continue;

    const repo = anchor.text.trim();
    const href = anchor.getAttribute("href") ?? "";
    const description =
      item.querySelector("p.pinned-item-desc")?.text.trim() ?? "";
    const language =
      item.querySelector("[itemprop='programmingLanguage']")?.text.trim() ?? "";

    let stars = 0;
    let forks = 0;

    for (const link of item.querySelectorAll("a.pinned-item-meta")) {
      const linkHref = link.getAttribute("href") ?? "";
      const count = parseInt(link.text.trim().replace(/,/g, ""), 10) || 0;
      if (linkHref.includes("/stargazers")) stars = count;
      else if (linkHref.includes("/forks")) forks = count;
    }

    pinned.push({
      repo,
      url: `https://github.com${href}`,
      description,
      language,
      stars,
      forks,
    });
  }

  return pinned;
};

const getPinned = async (username: string): Promise<PinnedRepo[]> => {
  const res = await fetchGitHub(username);

  if (res.status === 404)
    throw new HTTPException(404, { message: "user not found" });
  if (!res.ok) throw new HTTPException(502, { message: "bad gateway" });

  return parseHtml(await res.text());
};

export { getPinned, TTL };
