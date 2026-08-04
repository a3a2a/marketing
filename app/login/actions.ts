"use server";

import { redirect } from "next/navigation";
import { verifyCredentials } from "@/auth/credentials";
import { createSession, destroySession } from "@/auth/cookies";

export interface LoginFormState {
  error?: string;
}

export async function login(
  _prevState: LoginFormState | undefined,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await verifyCredentials(email, password);
  if (!user) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다" };
  }

  await createSession(user);
  redirect("/");
}

// Bound as a <form action={logout}> in components/Nav.tsx.
export async function logout(_formData: FormData): Promise<void> {
  await destroySession();
  redirect("/login");
}
