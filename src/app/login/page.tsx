import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verify?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Sign in</h1>
      <p className="text-brand-slate mb-6">Magic link via email — no password.</p>
      {sp.verify && (
        <p className="mb-4 rounded-md bg-green-50 text-green-800 text-sm p-3">
          Check your email for a sign-in link.
        </p>
      )}
      {sp.error && (
        <p className="mb-4 rounded-md bg-red-50 text-red-700 text-sm p-3">Sign-in error: {sp.error}</p>
      )}
      <LoginForm />
    </div>
  );
}
