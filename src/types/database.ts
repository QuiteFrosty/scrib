export type LectureStatus =
  | "uploaded"
  | "transcribing"
  | "summarizing"
  | "ready"
  | "error";

export type Flashcard = {
  question: string;
  answer: string;
};

export type Lecture = {
  id: string;
  user_id: string;
  title: string;
  course: string | null;
  audio_path: string;
  duration_seconds: number | null;
  status: LectureStatus;
  error_message: string | null;
  transcript: string | null;
  summary: string | null;
  key_points: string[] | null;
  flashcards: Flashcard[] | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      lectures: {
        Row: Lecture;
        Insert: Partial<Lecture> & {
          user_id: string;
          title: string;
          audio_path: string;
        };
        Update: Partial<Lecture>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
