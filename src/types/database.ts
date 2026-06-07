type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string | null
          updated_at?: string
        }
        Relationships: Relationship[]
      }
      cabinet_items: {
        Row: {
          id: string
          user_id: string
          ingredient_name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ingredient_name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          ingredient_name?: string
          sort_order?: number
        }
        Relationships: Relationship[]
      }
      favourite_cocktails: {
        Row: {
          id: string
          user_id: string
          cocktail_id: string
          cocktail_name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cocktail_id: string
          cocktail_name: string
          created_at?: string
        }
        Update: {
          cocktail_name?: string
        }
        Relationships: Relationship[]
      }
      saved_preferences: {
        Row: {
          user_id: string
          house_strictness: number
          updated_at: string
        }
        Insert: {
          user_id: string
          house_strictness?: number
          updated_at?: string
        }
        Update: {
          house_strictness?: number
          updated_at?: string
        }
        Relationships: Relationship[]
      }
      conversation_sessions: {
        Row: {
          id: string
          user_id: string
          user_request: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_request?: string | null
          created_at?: string
        }
        Update: {
          user_request?: string | null
        }
        Relationships: Relationship[]
      }
      conversation_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'hostess' | 'system'
          content: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'hostess' | 'system'
          content: Record<string, unknown>
          created_at?: string
        }
        Update: {
          content?: Record<string, unknown>
        }
        Relationships: Relationship[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
