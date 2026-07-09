export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          graduation_year: number | null;
          school: string | null;
          major: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          graduation_year?: number | null;
          school?: string | null;
          major?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          graduation_year?: number | null;
          school?: string | null;
          major?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          position: string;
          category: string;
          city: string;
          source: string;
          status: string;
          track: string;
          apply_date: string;
          job_url: string | null;
          description: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          position: string;
          category: string;
          city: string;
          source: string;
          status?: string;
          track?: string;
          apply_date: string;
          job_url?: string | null;
          description?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string;
          position?: string;
          category?: string;
          city?: string;
          source?: string;
          status?: string;
          track?: string;
          apply_date?: string;
          job_url?: string | null;
          description?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      timeline_events: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          event_type: string;
          event_date: string;
          title: string;
          track: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          event_type: string;
          event_date: string;
          title: string;
          track?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          event_type?: string;
          event_date?: string;
          title?: string;
          track?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          round: string;
          interview_date: string;
          questions: string | null;
          answers: string | null;
          notes: string | null;
          result: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          round: string;
          interview_date: string;
          questions?: string | null;
          answers?: string | null;
          notes?: string | null;
          result?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          round?: string;
          interview_date?: string;
          questions?: string | null;
          answers?: string | null;
          notes?: string | null;
          result?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          title: string;
          remind_at: string;
          type: string;
          track: string;
          read_at: string | null;
          is_done: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          title: string;
          remind_at: string;
          type: string;
          track?: string;
          read_at?: string | null;
          is_done?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          application_id?: string | null;
          title?: string;
          remind_at?: string;
          type?: string;
          track?: string;
          read_at?: string | null;
          is_done?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};