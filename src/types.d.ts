export interface PinnedRepo {
  repo: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface ContributionsResponse {
  total: number;
  contributions: ContributionDay[];
}
