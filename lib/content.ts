import type { ContentTone, ContentType } from "@prisma/client";

// ---------------------------------------------------------------------------
// Label maps (Korean UI labels for Prisma enum values)
// ---------------------------------------------------------------------------

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  BLOG: "블로그",
  SNS: "SNS",
  EMAIL: "이메일",
};

export const CONTENT_STATUS_LABELS: Record<"DRAFT" | "PUBLISHED", string> = {
  DRAFT: "초안",
  PUBLISHED: "발행됨",
};

export const CONTENT_TONE_LABELS: Record<ContentTone, string> = {
  FRIENDLY: "친근한",
  PROFESSIONAL: "전문적인",
  HUMOROUS: "유머러스",
  TRUSTWORTHY: "신뢰감있는",
};

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: "BLOG", label: "블로그" },
  { value: "SNS", label: "SNS" },
  { value: "EMAIL", label: "이메일" },
];

export const CONTENT_TONE_OPTIONS: { value: ContentTone; label: string }[] = [
  { value: "FRIENDLY", label: "친근한" },
  { value: "PROFESSIONAL", label: "전문적인" },
  { value: "HUMOROUS", label: "유머러스" },
  { value: "TRUSTWORTHY", label: "신뢰감있는" },
];

// ---------------------------------------------------------------------------
// Draft body template generator (deterministic, in-process — no external
// API calls). Combines Title / Product / Audience / Tone / Keywords into a
// formatted draft appropriate to the selected content type.
// ---------------------------------------------------------------------------

export interface DraftGenerationInput {
  title: string;
  type: ContentType;
  product: string;
  audience: string;
  tone: ContentTone;
  keywords?: string | null;
}

const TONE_PHRASES: Record<
  ContentTone,
  { intro: string; body: string; cta: string; closing: string }
> = {
  FRIENDLY: {
    intro: "안녕하세요! 오늘은 조금 특별한 이야기를 들려드리려고 해요.",
    body: "편하게 읽으실 수 있도록 쉽게 풀어봤어요.",
    cta: "지금 바로 확인해보세요 :)",
    closing: "항상 응원할게요!",
  },
  PROFESSIONAL: {
    intro: "본 자료는 다음과 같은 배경과 목적으로 작성되었습니다.",
    body: "핵심 내용을 다음과 같이 정리하였습니다.",
    cta: "자세한 내용은 지금 확인하시기 바랍니다.",
    closing: "감사합니다.",
  },
  HUMOROUS: {
    intro: "잠깐, 이거 안 보면 후회하실지도 몰라요 (진짜로요).",
    body: "재미는 챙기고 정보는 놓치지 않게 준비했어요.",
    cta: "고민은 배송만 늦출 뿐! 지금 바로 확인 고고!",
    closing: "다음에 또 재미있게 찾아올게요!",
  },
  TRUSTWORTHY: {
    intro: "믿을 수 있는 정보만 담아 정직하게 안내해 드립니다.",
    body: "검증된 내용을 바탕으로 신뢰할 수 있는 정보를 전달합니다.",
    cta: "믿고 지금 바로 만나보세요.",
    closing: "항상 신뢰로 보답하겠습니다.",
  },
};

function splitKeywords(keywords?: string | null): string[] {
  if (!keywords) return [];
  return keywords
    .split(/[,\n·/]+/)
    .map((k) => k.trim())
    .filter(Boolean);
}

function toHashtag(text: string): string {
  return "#" + text.replace(/\s+/g, "");
}

function buildBlogBody(input: DraftGenerationInput): string {
  const { title, product, audience, tone, keywords } = input;
  const phrase = TONE_PHRASES[tone];
  const keywordList = splitKeywords(keywords);
  const keywordLine =
    keywordList.length > 0
      ? `이번 글에서는 ${keywordList.join(", ")}에 대해서도 함께 짚어드립니다.`
      : "";

  return [
    `# ${title}`,
    "",
    `${phrase.intro} ${product}를(을) 찾고 계신 ${audience} 여러분을 위해 이 글을 준비했습니다.`,
    "",
    `${product}는(은) ${audience}의 고민을 해결해 줄 수 있는 선택지입니다. ${phrase.body}`,
    "",
    keywordLine ||
      `${product}가 ${audience}에게 어떤 가치를 줄 수 있는지 구체적으로 살펴보겠습니다.`,
    "",
    `${audience} 분들이 실제로 느낄 수 있는 변화와 이점을 중심으로, ${product}의 특징을 하나씩 소개해 드리겠습니다.`,
    "",
    `지금까지 ${title}에 대해 알아보았습니다. ${phrase.cta}`,
  ]
    .filter((line) => line !== "")
    .join("\n\n");
}

function buildSnsBody(input: DraftGenerationInput): string {
  const { title, product, audience, tone, keywords } = input;
  const phrase = TONE_PHRASES[tone];

  const hook =
    tone === "HUMOROUS"
      ? `${audience} 여러분, ${product} 아직도 안 써보셨다고요?! 🙀`
      : tone === "TRUSTWORTHY"
        ? `${audience}를(을) 위한 믿을 수 있는 선택, ${product}.`
        : `${title} - ${audience}를(을) 위한 ${product} 이야기.`;

  const bodyLine = `${phrase.body} ${product}로 ${audience}의 하루가 더 편해집니다. ${phrase.cta}`;

  const keywordTags = splitKeywords(keywords);
  const baseTags = [product, audience, title]
    .flatMap((v) => v.split(/\s+/))
    .filter(Boolean);
  const allTagsSource = [...keywordTags, ...baseTags];
  const uniqueTags: string[] = [];
  for (const tag of allTagsSource) {
    const hashtag = toHashtag(tag);
    if (!uniqueTags.includes(hashtag) && hashtag.length > 1) {
      uniqueTags.push(hashtag);
    }
    if (uniqueTags.length >= 5) break;
  }
  while (uniqueTags.length < 3) {
    uniqueTags.push(toHashtag(`마케팅${uniqueTags.length + 1}`));
  }

  return [hook, "", bodyLine, "", uniqueTags.join(" ")].join("\n");
}

function buildEmailBody(input: DraftGenerationInput): string {
  const { title, product, audience, tone, keywords } = input;
  const phrase = TONE_PHRASES[tone];
  const keywordList = splitKeywords(keywords);
  const keywordLine =
    keywordList.length > 0
      ? `이번 안내에서는 특히 ${keywordList.join(", ")} 부분을 중점적으로 전해 드립니다.`
      : "";

  return [
    `제목: ${title}`,
    "",
    `안녕하세요, ${audience} 고객님.`,
    "",
    `${phrase.intro}`,
    "",
    `${product}를(을) 소개해 드리고자 이렇게 메일 드립니다. ${phrase.body}`,
    "",
    keywordLine,
    "",
    `${phrase.cta}`,
    "",
    `감사합니다.`,
    `${phrase.closing}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function generateDraftBody(input: DraftGenerationInput): string {
  switch (input.type) {
    case "BLOG":
      return buildBlogBody(input);
    case "SNS":
      return buildSnsBody(input);
    case "EMAIL":
      return buildEmailBody(input);
    default:
      return "";
  }
}
