"use client";

import { useActionState } from "react";
import { login, type LoginFormState } from "./actions";
import { Field, fieldControlClassName } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: LoginFormState = {};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black"
    >
      <Field label="이메일" htmlFor="email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldControlClassName()}
        />
      </Field>

      <Field label="비밀번호" htmlFor="password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldControlClassName()}
        />
      </Field>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? "로그인 중…" : "로그인"}
      </Button>
    </form>
  );
}
