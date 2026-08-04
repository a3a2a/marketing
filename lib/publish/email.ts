// Provider-agnostic email sender used by the 캠페인 발행 (campaign publish)
// action. When RESEND_API_KEY is not configured (the default, since this app
// runs fully offline out of the box) we never touch the network — we just
// report a simulated result so the publish flow still works end-to-end in
// dev/demo environments.

export type SendEmailResult =
  | { status: "SENT"; message: string }
  | { status: "SIMULATED"; message: string }
  | { status: "FAILED"; message: string };

export type SendEmailInput = {
  to: string;
  subject: string;
  body: string;
};

function truncate(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

// Real send via the Resend API (https://resend.com/docs/api-reference/emails/send-email),
// called with plain fetch so the app doesn't need the `resend` SDK as a
// dependency. Activate by setting RESEND_API_KEY (and optionally
// RESEND_FROM_EMAIL, which Resend requires to be a verified sender/domain).
export async function sendEmail({
  to,
  subject,
  body,
}: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      status: "SIMULATED",
      message: `시뮬레이션 모드로 처리됨 (RESEND_API_KEY 미설정) — 수신자: ${to}, 제목: "${truncate(
        subject,
      )}"`,
    };
  }

  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text: body,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `Resend API 오류 (${res.status} ${res.statusText})${
          errText ? `: ${errText}` : ""
        }`,
      );
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return {
      status: "SENT",
      message: `이메일 발송 완료 (수신자: ${to}, Resend id: ${
        data.id ?? "알 수 없음"
      })`,
    };
  } catch (err) {
    return {
      status: "FAILED",
      message:
        err instanceof Error
          ? `이메일 발송 실패: ${err.message}`
          : "이메일 발송 중 알 수 없는 오류가 발생했습니다.",
    };
  }
}
