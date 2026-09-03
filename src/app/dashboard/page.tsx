import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: lectures } = await supabase
    .from("lectures")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your lectures
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Everything you&apos;ve recorded, transcribed, and summarized.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
        >
          New lecture
        </Link>
      </div>

      {lectures && lectures.length > 0 ? (
        <ul className="mt-8 divide-y divide-neutral-800 rounded-lg border border-neutral-800">
          {lectures.map((lecture) => (
            <li key={lecture.id}>
              <Link
                href={`/dashboard/${lecture.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-neutral-900"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{lecture.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {lecture.course ? `${lecture.course} · ` : ""}
                    {new Date(lecture.created_at).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={lecture.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-neutral-800 px-6 py-16 text-center">
          <p className="text-neutral-400">No lectures yet.</p>
          <Link
            href="/dashboard/new"
            className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
          >
            Record or upload your first one
          </Link>
        </div>
      )}
    </div>
  );
}
