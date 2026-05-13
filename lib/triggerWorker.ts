export async function triggerWorker({
  runProcess = true,
  runAnalysis = false,
}) {
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/actions/workflows/main.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ref: "master",

        inputs: {
          run_process: String(runProcess),
          run_analysis: String(runAnalysis),
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API Error (${response.status}): ${errorText}`);
  }

  return true;
}
