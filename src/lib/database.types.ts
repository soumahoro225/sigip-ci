export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      alertes: {
        Row: {
          date_creation: string
          id: string
          message: string
          projet_id: string
          severite: Database["public"]["Enums"]["niveau_risque"]
          statut: string
          type: string
        }
        Insert: {
          date_creation?: string
          id?: string
          message: string
          projet_id: string
          severite: Database["public"]["Enums"]["niveau_risque"]
          statut?: string
          type: string
        }
        Update: {
          date_creation?: string
          id?: string
          message?: string
          projet_id?: string
          severite?: Database["public"]["Enums"]["niveau_risque"]
          statut?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertes_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
        ]
      }
      communes: {
        Row: {
          departement_id: string
          geom: unknown
          id: string
          nom: string
        }
        Insert: {
          departement_id: string
          geom?: unknown
          id?: string
          nom: string
        }
        Update: {
          departement_id?: string
          geom?: unknown
          id?: string
          nom?: string
        }
        Relationships: [
          {
            foreignKeyName: "communes_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
        ]
      }
      departements: {
        Row: {
          geom: unknown
          id: string
          nom: string
          region_id: string
        }
        Insert: {
          geom?: unknown
          id?: string
          nom: string
          region_id: string
        }
        Update: {
          geom?: unknown
          id?: string
          nom?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departements_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      historique: {
        Row: {
          action: string
          date_action: string
          donnees: Json
          id: number
          projet_id: string | null
          utilisateur_id: string | null
        }
        Insert: {
          action: string
          date_action?: string
          donnees?: Json
          id?: never
          projet_id?: string | null
          utilisateur_id?: string | null
        }
        Update: {
          action?: string
          date_action?: string
          donnees?: Json
          id?: never
          projet_id?: string | null
          utilisateur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historique_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historique_utilisateur_id_fkey"
            columns: ["utilisateur_id"]
            isOneToOne: false
            referencedRelation: "profils"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          avancement_constate: number | null
          created_at: string
          date_inspection: string
          geom: unknown
          id: string
          inspecteur_id: string | null
          observations: string | null
          projet_id: string
        }
        Insert: {
          avancement_constate?: number | null
          created_at?: string
          date_inspection: string
          geom?: unknown
          id?: string
          inspecteur_id?: string | null
          observations?: string | null
          projet_id: string
        }
        Update: {
          avancement_constate?: number | null
          created_at?: string
          date_inspection?: string
          geom?: unknown
          id?: string
          inspecteur_id?: string | null
          observations?: string | null
          projet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_inspecteur_id_fkey"
            columns: ["inspecteur_id"]
            isOneToOne: false
            referencedRelation: "profils"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
        ]
      }
      ministeres: {
        Row: {
          description: string | null
          id: string
          nom: string
          sigle: string
        }
        Insert: {
          description?: string | null
          id?: string
          nom: string
          sigle: string
        }
        Update: {
          description?: string | null
          id?: string
          nom?: string
          sigle?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          chemin_stockage: string
          description: string | null
          geom: unknown
          id: string
          inspection_id: string | null
          prise_le: string | null
          projet_id: string
        }
        Insert: {
          chemin_stockage: string
          description?: string | null
          geom?: unknown
          id?: string
          inspection_id?: string | null
          prise_le?: string | null
          projet_id: string
        }
        Update: {
          chemin_stockage?: string
          description?: string | null
          geom?: unknown
          id?: string
          inspection_id?: string | null
          prise_le?: string | null
          projet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
        ]
      }
      profils: {
        Row: {
          actif: boolean
          created_at: string
          id: string
          ministere_id: string | null
          nom_complet: string
          role: Database["public"]["Enums"]["role_app"]
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          id: string
          ministere_id?: string | null
          nom_complet: string
          role?: Database["public"]["Enums"]["role_app"]
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          id?: string
          ministere_id?: string | null
          nom_complet?: string
          role?: Database["public"]["Enums"]["role_app"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profils_ministere_id_fkey"
            columns: ["ministere_id"]
            isOneToOne: false
            referencedRelation: "ministeres"
            referencedColumns: ["id"]
          },
        ]
      }
      projets: {
        Row: {
          avancement_financier: number
          avancement_physique: number
          budget_engage: number
          code_projet: string
          commune_id: string | null
          cout_total: number
          created_at: string
          date_debut: string | null
          date_fin_prevue: string | null
          date_fin_reelle: string | null
          departement_id: string | null
          description: string | null
          entreprise: string | null
          geom: unknown
          id: string
          is_demo: boolean
          latitude: number | null
          localite: string | null
          longitude: number | null
          ministere_id: string
          montant_decaisse: number
          niveau_risque: Database["public"]["Enums"]["niveau_risque"]
          nom: string
          region_id: string | null
          score_risque: number
          secteur_id: string
          statut: string
          updated_at: string
        }
        Insert: {
          avancement_financier?: number
          avancement_physique?: number
          budget_engage: number
          code_projet: string
          commune_id?: string | null
          cout_total: number
          created_at?: string
          date_debut?: string | null
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          departement_id?: string | null
          description?: string | null
          entreprise?: string | null
          geom?: unknown
          id?: string
          is_demo?: boolean
          latitude?: number | null
          localite?: string | null
          longitude?: number | null
          ministere_id: string
          montant_decaisse?: number
          niveau_risque?: Database["public"]["Enums"]["niveau_risque"]
          nom: string
          region_id?: string | null
          score_risque?: number
          secteur_id: string
          statut?: string
          updated_at?: string
        }
        Update: {
          avancement_financier?: number
          avancement_physique?: number
          budget_engage?: number
          code_projet?: string
          commune_id?: string | null
          cout_total?: number
          created_at?: string
          date_debut?: string | null
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          departement_id?: string | null
          description?: string | null
          entreprise?: string | null
          geom?: unknown
          id?: string
          is_demo?: boolean
          latitude?: number | null
          localite?: string | null
          longitude?: number | null
          ministere_id?: string
          montant_decaisse?: number
          niveau_risque?: Database["public"]["Enums"]["niveau_risque"]
          nom?: string
          region_id?: string | null
          score_risque?: number
          secteur_id?: string
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projets_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "communes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projets_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projets_ministere_id_fkey"
            columns: ["ministere_id"]
            isOneToOne: false
            referencedRelation: "ministeres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projets_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projets_secteur_id_fkey"
            columns: ["secteur_id"]
            isOneToOne: false
            referencedRelation: "secteurs"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          code: string | null
          geom: unknown
          id: string
          nom: string
        }
        Insert: {
          code?: string | null
          geom?: unknown
          id?: string
          nom: string
        }
        Update: {
          code?: string | null
          geom?: unknown
          id?: string
          nom?: string
        }
        Relationships: []
      }
      secteurs: {
        Row: {
          description: string | null
          id: string
          nom: string
        }
        Insert: {
          description?: string | null
          id?: string
          nom: string
        }
        Update: {
          description?: string | null
          id?: string
          nom?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      niveau_risque: "normal" | "surveillance" | "critique"
      role_app:
        | "super_admin"
        | "admin_ministere"
        | "directeur"
        | "analyste"
        | "inspecteur"
        | "lecture_seule"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      niveau_risque: ["normal", "surveillance", "critique"],
      role_app: [
        "super_admin",
        "admin_ministere",
        "directeur",
        "analyste",
        "inspecteur",
        "lecture_seule",
      ],
    },
  },
} as const

