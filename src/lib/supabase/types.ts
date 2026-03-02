export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number;
          checksum: string;
          finished_at: string | null;
          id: string;
          logs: string | null;
          migration_name: string;
          rolled_back_at: string | null;
          started_at: string;
        };
        Insert: {
          applied_steps_count?: number;
          checksum: string;
          finished_at?: string | null;
          id: string;
          logs?: string | null;
          migration_name: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Update: {
          applied_steps_count?: number;
          checksum?: string;
          finished_at?: string | null;
          id?: string;
          logs?: string | null;
          migration_name?: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Relationships: [];
      };
      Account: {
        Row: {
          access_token: string | null;
          expires_at: number | null;
          id: string;
          id_token: string | null;
          provider: string;
          providerAccountId: string;
          refresh_token: string | null;
          scope: string | null;
          session_state: string | null;
          token_type: string | null;
          type: string;
          userId: string;
        };
        Insert: {
          access_token?: string | null;
          expires_at?: number | null;
          id: string;
          id_token?: string | null;
          provider: string;
          providerAccountId: string;
          refresh_token?: string | null;
          scope?: string | null;
          session_state?: string | null;
          token_type?: string | null;
          type: string;
          userId: string;
        };
        Update: {
          access_token?: string | null;
          expires_at?: number | null;
          id?: string;
          id_token?: string | null;
          provider?: string;
          providerAccountId?: string;
          refresh_token?: string | null;
          scope?: string | null;
          session_state?: string | null;
          token_type?: string | null;
          type?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Account_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
        ];
      };
      Address: {
        Row: {
          address: string;
          createdAt: string;
          email: string | null;
          id: string;
          name: string;
          orgId: string;
          phone: string;
          website: string | null;
        };
        Insert: {
          address: string;
          createdAt?: string;
          email?: string | null;
          id: string;
          name: string;
          orgId: string;
          phone: string;
          website?: string | null;
        };
        Update: {
          address?: string;
          createdAt?: string;
          email?: string | null;
          id?: string;
          name?: string;
          orgId?: string;
          phone?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      AuditLog: {
        Row: {
          action: string;
          actorId: string;
          afterJSON: Json | null;
          at: string;
          beforeJSON: Json | null;
          entityId: string;
          entityType: string;
          id: string;
          orgId: string;
        };
        Insert: {
          action: string;
          actorId: string;
          afterJSON?: Json | null;
          at?: string;
          beforeJSON?: Json | null;
          entityId: string;
          entityType: string;
          id: string;
          orgId: string;
        };
        Update: {
          action?: string;
          actorId?: string;
          afterJSON?: Json | null;
          at?: string;
          beforeJSON?: Json | null;
          entityId?: string;
          entityType?: string;
          id?: string;
          orgId?: string;
        };
        Relationships: [];
      };
      Category: {
        Row: {
          id: string;
          name: string;
          sortOrder: number;
          teamId: string;
        };
        Insert: {
          id: string;
          name: string;
          sortOrder?: number;
          teamId: string;
        };
        Update: {
          id?: string;
          name?: string;
          sortOrder?: number;
          teamId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Category_teamId_fkey";
            columns: ["teamId"];
            isOneToOne: false;
            referencedRelation: "Team";
            referencedColumns: ["id"];
          },
        ];
      };
      Department: {
        Row: {
          createdAt: string;
          id: string;
          name: string;
          orgId: string;
        };
        Insert: {
          createdAt?: string;
          id: string;
          name: string;
          orgId: string;
        };
        Update: {
          createdAt?: string;
          id?: string;
          name?: string;
          orgId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Department_orgId_fkey";
            columns: ["orgId"];
            isOneToOne: false;
            referencedRelation: "Organization";
            referencedColumns: ["id"];
          },
        ];
      };
      EmailOTP: {
        Row: {
          attempts: number;
          codeHash: string;
          consumedAt: string | null;
          createdAt: string;
          email: string;
          expiresAt: string;
          id: string;
        };
        Insert: {
          attempts?: number;
          codeHash: string;
          consumedAt?: string | null;
          createdAt?: string;
          email: string;
          expiresAt: string;
          id: string;
        };
        Update: {
          attempts?: number;
          codeHash?: string;
          consumedAt?: string | null;
          createdAt?: string;
          email?: string;
          expiresAt?: string;
          id?: string;
        };
        Relationships: [];
      };
      ErrorReport: {
        Row: {
          body: string;
          createdAt: string;
          createdBy: string;
          id: string;
          procedureId: string;
          status: Database["public"]["Enums"]["ErrorReportStatus"];
        };
        Insert: {
          body: string;
          createdAt?: string;
          createdBy: string;
          id: string;
          procedureId: string;
          status?: Database["public"]["Enums"]["ErrorReportStatus"];
        };
        Update: {
          body?: string;
          createdAt?: string;
          createdBy?: string;
          id?: string;
          procedureId?: string;
          status?: Database["public"]["Enums"]["ErrorReportStatus"];
        };
        Relationships: [
          {
            foreignKeyName: "ErrorReport_procedureId_fkey";
            columns: ["procedureId"];
            isOneToOne: false;
            referencedRelation: "Procedure";
            referencedColumns: ["id"];
          },
        ];
      };
      Favorite: {
        Row: {
          procedureId: string;
          userId: string;
        };
        Insert: {
          procedureId: string;
          userId: string;
        };
        Update: {
          procedureId?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Favorite_procedureId_fkey";
            columns: ["procedureId"];
            isOneToOne: false;
            referencedRelation: "Procedure";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Favorite_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
        ];
      };
      Idea: {
        Row: {
          body: string;
          createdAt: string;
          createdBy: string;
          id: string;
          status: Database["public"]["Enums"]["IdeaStatus"];
          teamId: string;
          title: string;
        };
        Insert: {
          body: string;
          createdAt?: string;
          createdBy: string;
          id: string;
          status?: Database["public"]["Enums"]["IdeaStatus"];
          teamId: string;
          title: string;
        };
        Update: {
          body?: string;
          createdAt?: string;
          createdBy?: string;
          id?: string;
          status?: Database["public"]["Enums"]["IdeaStatus"];
          teamId?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Idea_teamId_fkey";
            columns: ["teamId"];
            isOneToOne: false;
            referencedRelation: "Team";
            referencedColumns: ["id"];
          },
        ];
      };
      IngestionJob: {
        Row: {
          createdAt: string;
          error: string | null;
          fileKey: string | null;
          id: string;
          orgId: string;
          outputVersionId: string | null;
          procedureId: string;
          sourceType: string;
          status: Database["public"]["Enums"]["IngestionJobStatus"];
        };
        Insert: {
          createdAt?: string;
          error?: string | null;
          fileKey?: string | null;
          id: string;
          orgId: string;
          outputVersionId?: string | null;
          procedureId: string;
          sourceType: string;
          status: Database["public"]["Enums"]["IngestionJobStatus"];
        };
        Update: {
          createdAt?: string;
          error?: string | null;
          fileKey?: string | null;
          id?: string;
          orgId?: string;
          outputVersionId?: string | null;
          procedureId?: string;
          sourceType?: string;
          status?: Database["public"]["Enums"]["IngestionJobStatus"];
        };
        Relationships: [
          {
            foreignKeyName: "IngestionJob_orgId_fkey";
            columns: ["orgId"];
            isOneToOne: false;
            referencedRelation: "Organization";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "IngestionJob_outputVersionId_fkey";
            columns: ["outputVersionId"];
            isOneToOne: false;
            referencedRelation: "ProcedureVersion";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "IngestionJob_procedureId_fkey";
            columns: ["procedureId"];
            isOneToOne: false;
            referencedRelation: "Procedure";
            referencedColumns: ["id"];
          },
        ];
      };
      Invitation: {
        Row: {
          acceptedAt: string | null;
          createdAt: string;
          email: string;
          expiresAt: string;
          invitedByUserId: string | null;
          orgId: string;
          role: string;
          status: Database["public"]["Enums"]["InvitationStatus"];
          tokenHash: string;
          updatedAt: string;
        };
        Insert: {
          acceptedAt?: string | null;
          createdAt?: string;
          email: string;
          expiresAt: string;
          invitedByUserId?: string | null;
          orgId: string;
          role: string;
          status?: Database["public"]["Enums"]["InvitationStatus"];
          tokenHash: string;
          updatedAt: string;
        };
        Update: {
          acceptedAt?: string | null;
          createdAt?: string;
          email?: string;
          expiresAt?: string;
          invitedByUserId?: string | null;
          orgId?: string;
          role?: string;
          status?: Database["public"]["Enums"]["InvitationStatus"];
          tokenHash?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Invitation_invitedByUserId_fkey";
            columns: ["invitedByUserId"];
            isOneToOne: false;
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Invitation_orgId_fkey";
            columns: ["orgId"];
            isOneToOne: false;
            referencedRelation: "Organization";
            referencedColumns: ["id"];
          },
        ];
      };
      NewsPost: {
        Row: {
          bodyJSON: Json;
          createdAt: string;
          createdBy: string;
          id: string;
          pinned: boolean;
          teamId: string;
          title: string;
        };
        Insert: {
          bodyJSON: Json;
          createdAt?: string;
          createdBy: string;
          id: string;
          pinned?: boolean;
          teamId: string;
          title: string;
        };
        Update: {
          bodyJSON?: Json;
          createdAt?: string;
          createdBy?: string;
          id?: string;
          pinned?: boolean;
          teamId?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "NewsPost_teamId_fkey";
            columns: ["teamId"];
            isOneToOne: false;
            referencedRelation: "Team";
            referencedColumns: ["id"];
          },
        ];
      };
      Organization: {
        Row: {
          createdAt: string;
          currentPeriodEnd: string | null;
          entitlementsJSON: Json;
          id: string;
          name: string;
          ownerUserId: string;
          plan: string;
          slug: string;
          stripeCustomerId: string | null;
          stripeSubscriptionId: string | null;
          stripeSubscriptionStatus:
            | Database["public"]["Enums"]["StripeSubscriptionStatus"]
            | null;
        };
        Insert: {
          createdAt?: string;
          currentPeriodEnd?: string | null;
          entitlementsJSON?: Json;
          id: string;
          name: string;
          ownerUserId: string;
          plan?: string;
          slug: string;
          stripeCustomerId?: string | null;
          stripeSubscriptionId?: string | null;
          stripeSubscriptionStatus?:
            | Database["public"]["Enums"]["StripeSubscriptionStatus"]
            | null;
        };
        Update: {
          createdAt?: string;
          currentPeriodEnd?: string | null;
          entitlementsJSON?: Json;
          id?: string;
          name?: string;
          ownerUserId?: string;
          plan?: string;
          slug?: string;
          stripeCustomerId?: string | null;
          stripeSubscriptionId?: string | null;
          stripeSubscriptionStatus?:
            | Database["public"]["Enums"]["StripeSubscriptionStatus"]
            | null;
        };
        Relationships: [
          {
            foreignKeyName: "Organization_ownerUserId_fkey";
            columns: ["ownerUserId"];
            isOneToOne: false;
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
        ];
      };
      OrgMembership: {
        Row: {
          createdAt: string;
          id: string;
          orgId: string;
          role: Database["public"]["Enums"]["OrgMembershipRole"];
          userId: string;
        };
        Insert: {
          createdAt?: string;
          id: string;
          orgId: string;
          role: Database["public"]["Enums"]["OrgMembershipRole"];
          userId: string;
        };
        Update: {
          createdAt?: string;
          id?: string;
          orgId?: string;
          role?: Database["public"]["Enums"]["OrgMembershipRole"];
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "OrgMembership_orgId_fkey";
            columns: ["orgId"];
            isOneToOne: false;
            referencedRelation: "Organization";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "OrgMembership_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "User";
            referencedColumns: ["id"];
          },
        ];
      };
      Procedure: {
        Row: {
          categoryId: string | null;
          createdAt: string;
          description: string | null;
          id: string;
          pendingVersionId: string | null;
          publishedVersionId: string | null;
          slug: string;
          status: Database["public"]["Enums"]["ProcedureStatus"];
          style: Database["public"]["Enums"]["ProcedureStyle"];
          teamId: string;
          title: string;
          updatedAt: string;
        };
        Insert: {
          categoryId?: string | null;
          createdAt?: string;
          description?: string | null;
          id: string;
          pendingVersionId?: string | null;
          publishedVersionId?: string | null;
          slug: string;
          status: Database["public"]["Enums"]["ProcedureStatus"];
          style: Database["public"]["Enums"]["ProcedureStyle"];
          teamId: string;
          title: string;
          updatedAt: string;
        };
        Update: {
          categoryId?: string | null;
          createdAt?: string;
          description?: string | null;
          id?: string;
          pendingVersionId?: string | null;
          publishedVersionId?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["ProcedureStatus"];
          style?: Database["public"]["Enums"]["ProcedureStyle"];
          teamId?: string;
          title?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Procedure_categoryId_fkey";
            columns: ["categoryId"];
            isOneToOne: false;
            referencedRelation: "Category";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Procedure_pendingVersionId_fkey";
            columns: ["pendingVersionId"];
            isOneToOne: false;
            referencedRelation: "ProcedureVersion";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Procedure_publishedVersionId_fkey";
            columns: ["publishedVersionId"];
            isOneToOne: false;
            referencedRelation: "ProcedureVersion";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Procedure_teamId_fkey";
            columns: ["teamId"];
            isOneToOne: false;
            referencedRelation: "Team";
            referencedColumns: ["id"];
          },
        ];
      };
      ProcedureChunk: {
        Row: {
          chunkIndex: number;
          chunkText: string;
          createdAt: string;
          embedding: string | null;
          id: string;
          procedureId: string;
          teamId: string;
          title: string;
        };
        Insert: {
          chunkIndex: number;
          chunkText: string;
          createdAt?: string;
          embedding?: string | null;
          id: string;
          procedureId: string;
          teamId: string;
          title: string;
        };
        Update: {
          chunkIndex?: number;
          chunkText?: string;
          createdAt?: string;
          embedding?: string | null;
          id?: string;
          procedureId?: string;
          teamId?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ProcedureChunk_procedureId_fkey";
            columns: ["procedureId"];
            isOneToOne: false;
            referencedRelation: "Procedure";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ProcedureChunk_teamId_fkey";
            columns: ["teamId"];
            isOneToOne: false;
            referencedRelation: "Team";
            referencedColumns: ["id"];
          },
        ];
      };
      ProcedureVersion: {
        Row: {
          contentJSON: Json;
          contentText: string | null;
          createdAt: string;
          createdBy: string;
          id: string;
          procedureId: string;
          style: Database["public"]["Enums"]["ProcedureStyle"];
        };
        Insert: {
          contentJSON: Json;
          contentText?: string | null;
          createdAt?: string;
          createdBy: string;
          id: string;
          procedureId: string;
          style: Database["public"]["Enums"]["ProcedureStyle"];
        };
        Update: {
          contentJSON?: Json;
          contentText?: string | null;
          createdAt?: string;
          createdBy?: string;
          id?: string;
          procedureId?: string;
          style?: Database["public"]["Enums"]["ProcedureStyle"];
        };
        Relationships: [
          {
            foreignKeyName: "ProcedureVersion_procedureId_fkey";
            columns: ["procedureId"];
            isOneToOne: false;
            referencedRelation: "Procedure";
            referencedColumns: ["id"];
          },
        ];
      };
      Team: {
        Row: {
          createdAt: string;
          departmentId: string;
          id: string;
          name: string;
        };
        Insert: {
          createdAt?: string;
          departmentId: string;
          id: string;
          name: string;
        };
        Update: {
          createdAt?: string;
          departmentId?: string;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Team_departmentId_fkey";
            columns: ["departmentId"];
            isOneToOne: false;
            referencedRelation: "Department";
            referencedColumns: ["id"];
          },
        ];
      };
      User: {
        Row: {
          createdAt: string;
          email: string;
          emailVerifiedAt: string | null;
          id: string;
          image: string | null;
          name: string | null;
        };
        Insert: {
          createdAt?: string;
          email: string;
          emailVerifiedAt?: string | null;
          id: string;
          image?: string | null;
          name?: string | null;
        };
        Update: {
          createdAt?: string;
          email?: string;
          emailVerifiedAt?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
        };
        Relationships: [];
      };
      VerificationToken: {
        Row: {
          expires: string;
          identifier: string;
          token: string;
        };
        Insert: {
          expires: string;
          identifier: string;
          token: string;
        };
        Update: {
          expires?: string;
          identifier?: string;
          token?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_procedure_chunks: {
        Args: {
          match_count: number;
          query_embedding: string;
          similarity_threshold: number;
          team_id: string;
        };
        Returns: {
          chunkText: string;
          id: string;
          procedureId: string;
          similarity: number;
          teamId: string;
          title: string;
        }[];
      };
      match_process_chunks: {
        Args: {
          match_count: number;
          query_embedding: string;
          similarity_threshold: number;
          team_id: string;
        };
        Returns: {
          chunkText: string;
          id: string;
          processId: string;
          similarity: number;
          teamId: string;
          title: string;
        }[];
      };
    };
    Enums: {
      ErrorReportStatus: "OPEN" | "RESOLVED" | "ARCHIVED";
      IdeaStatus: "NEW" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
      IngestionJobStatus:
        | "QUEUED"
        | "PARSING"
        | "GENERATING"
        | "FAILED"
        | "READY";
      InvitationStatus: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
      OrgMembershipRole: "OWNER" | "ADMIN" | "MEMBER";
      ProcedureStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      ProcedureStyle: "RAW" | "STEPS" | "FLOW" | "YESNO";
      StripeSubscriptionStatus:
        | "active"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "trialing"
        | "paused";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ErrorReportStatus: ["OPEN", "RESOLVED", "ARCHIVED"],
      IdeaStatus: ["NEW", "IN_PROGRESS", "COMPLETED", "ARCHIVED"],
      IngestionJobStatus: [
        "QUEUED",
        "PARSING",
        "GENERATING",
        "FAILED",
        "READY",
      ],
      InvitationStatus: ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"],
      OrgMembershipRole: ["OWNER", "ADMIN", "MEMBER"],
      ProcedureStatus: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      ProcedureStyle: ["RAW", "STEPS", "FLOW", "YESNO"],
      StripeSubscriptionStatus: [
        "active",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "canceled",
        "unpaid",
        "trialing",
        "paused",
      ],
    },
  },
} as const;
