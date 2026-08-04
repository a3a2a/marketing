"use client";

import { useState, useTransition } from "react";
import type { PublishMode } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { publishCampaign } from "./publish-actions";

const RESULT_TEXT_CLASSES: Record<PublishMode, string> = {
  SENT: "text-emerald-600 dark:text-emerald-400",
  SIMULATED: "text-indigo-600 dark:text-indigo-400",
  FAILED: "text-rose-600 dark:text-rose-400",
};

export default function PublishButton({ campaignId }: { campaignId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    mode: PublishMode;
    message: string;
  } | null>(null);

  function handleClick() {
    startTransition(async () => {
      const res = await publishCampaign(campaignId);
      setResult(res);
    });
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={pending}>
        {pending ? "발행 중..." : "지금 발행"}
      </Button>
      {result && (
        <p className={`text-sm ${RESULT_TEXT_CLASSES[result.mode]}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
