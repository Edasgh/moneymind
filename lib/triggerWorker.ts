export async function triggerWorker({
  runProcess = true,
  runAnalysis = false,
}) {
  await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/actions/workflows/main.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ref: "main",

        inputs: {
          run_process: String(runProcess),
          run_analysis: String(runAnalysis),
        },
      }),
    },
  );
}
