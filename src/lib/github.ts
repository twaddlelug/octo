const BASE_URL = "https://github.com";

const fetchGitHub = async (path: string): Promise<Response> =>
  fetch(`${BASE_URL}/${path}`, {
    headers: {
      "User-Agent": "octo-cf-worker/1.0",
      Accept: "text/html",
    },
    redirect: "manual",
  });

export { fetchGitHub };
