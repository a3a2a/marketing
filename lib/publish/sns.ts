// Provider-agnostic SNS poster used by the 캠페인 발행 (campaign publish)
// action. When the X API credentials are not configured (the default) we
// never touch the network — we just report a simulated result so the
// publish flow still works end-to-end in dev/demo environments.

export type PostToSnsResult =
  | { status: "SENT"; message: string }
  | { status: "SIMULATED"; message: string }
  | { status: "FAILED"; message: string };

export type PostToSnsInput = {
  text: string;
};

function truncate(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

// Real post via the X (Twitter) API v2 "create tweet" endpoint
// (POST https://api.x.com/2/tweets), called with plain fetch. Posting on
// behalf of a user requires an OAuth 2.0 User Context access token — X_API_KEY
// identifies the app/credentials pair and X_ACCESS_TOKEN is the bearer token
// sent on the request. Activate by setting both env vars.
export async function postToSns({
  text,
}: PostToSnsInput): Promise<PostToSnsResult> {
  const apiKey = process.env.X_API_KEY;
  const accessToken = process.env.X_ACCESS_TOKEN;

  if (!apiKey || !accessToken) {
    return {
      status: "SIMULATED",
      message: `시뮬레이션 모드로 처리됨 (X_API_KEY / X_ACCESS_TOKEN 미설정) — 게시 내용: "${truncate(
        text,
      )}"`,
    };
  }

  try {
    const res = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `X API 오류 (${res.status} ${res.statusText})${
          errText ? `: ${errText}` : ""
        }`,
      );
    }

    const data = (await res.json().catch(() => ({}))) as {
      data?: { id?: string };
    };
    return {
      status: "SENT",
      message: `SNS(X) 게시 완료 (tweet id: ${
        data.data?.id ?? "알 수 없음"
      })`,
    };
  } catch (err) {
    return {
      status: "FAILED",
      message:
        err instanceof Error
          ? `SNS(X) 게시 실패: ${err.message}`
          : "SNS 게시 중 알 수 없는 오류가 발생했습니다.",
    };
  }
}
