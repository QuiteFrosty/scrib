import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            Scrib
          </Link>
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            {user?.email && <span>{user.email}</span>}
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-md border border-neutral-700 px-3 py-1.5 transition hover:border-neutral-500"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
