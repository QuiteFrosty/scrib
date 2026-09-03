import type { LectureStatus } from "@/types/database";

const LABELS: Record<LectureStatus, string> = {
  uploaded: "Queued",
  transcribing: "Transcribing…",
  summarizing: "Generating notes…",
  ready: "Ready",
  error: "Failed",
};

const STYLES: Record<LectureStatus, string> = {
  uploaded: "bg-neutral-800 text-neutral-300",
  transcribing: "bg-amber-500/15 text-amber-400",
  summarizing: "bg-amber-500/15 text-amber-400",
  ready: "bg-emerald-500/15 text-emerald-400",
  error: "bg-red-500/15 text-red-400",
};

export function StatusBadge({ status }: { status: LectureStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}

export const PROCESSING_STATUSES: LectureStatus[] = [
  "uploaded",
  "transcribing",
  "summarizing",
];
