import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Marketing Studio 관리자 계정으로 로그인하세요.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
