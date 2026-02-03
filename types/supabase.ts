export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          contact: string
          cpf: string | null
          created_at: string | null
          cro: string | null
          email: string
          id: string
          name: string
          specialty: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact: string
          cpf?: string | null
          created_at?: string | null
          cro?: string | null
          email: string
          id?: string
          name: string
          specialty?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact?: string
          cpf?: string | null
          created_at?: string | null
          cro?: string | null
          email?: string
          id?: string
          name?: string
          specialty?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_info: {
        Row: {
          address: string
          cnpj: string
          created_at: string | null
          email: string
          global_discount: number | null
          id: string
          logo_url: string | null
          name: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          address: string
          cnpj: string
          created_at?: string | null
          email: string
          global_discount?: number | null
          id?: string
          logo_url?: string | null
          name: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          cnpj?: string
          created_at?: string | null
          email?: string
          global_discount?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_id: string
          client_name: string
          created_at: string | null
          id: string
          issue_date: string
          service_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id: string
          client_name: string
          created_at?: string | null
          id?: string
          issue_date: string
          service_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          client_name?: string
          created_at?: string | null
          id?: string
          issue_date?: string
          service_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_methods: {
        Row: {
          active: boolean | null
          address: string | null
          created_at: string | null
          discount: number | null
          email: string | null
          id: string
          name: string
          phone: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          created_at?: string | null
          discount?: number | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          created_at?: string | null
          discount?: number | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_definitions: {
        Row: {
          base_price: number
          category: string | null
          code: string
          created_at: string | null
          display_order: number
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          base_price: number
          category?: string | null
          code: string
          created_at?: string | null
          display_order: number
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category?: string | null
          code?: string
          created_at?: string | null
          display_order?: number
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          client_name: string
          created_at: string | null
          deadline: string
          discount_value: number | null
          entry_date: string
          id: string
          material: string
          observations: string | null
          patient_name: string
          payment_method_id: string | null
          quantity: number
          status: string
          total_value: number
          type: string
          unit_value: number
          updated_at: string | null
        }
        Insert: {
          client_name: string
          created_at?: string | null
          deadline: string
          discount_value?: number | null
          entry_date: string
          id?: string
          material: string
          observations?: string | null
          patient_name: string
          payment_method_id?: string | null
          quantity: number
          status?: string
          total_value: number
          type: string
          unit_value: number
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string | null
          deadline?: string
          discount_value?: number | null
          entry_date?: string
          id?: string
          material?: string
          observations?: string | null
          patient_name?: string
          payment_method_id?: string | null
          quantity?: number
          status?: string
          total_value?: number
          type?: string
          unit_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean | null
          created_at: string | null
          description: string
          due_date: string
          id: string
          priority: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean | null
          created_at?: string | null
          description: string
          due_date: string
          id?: string
          priority: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean | null
          created_at?: string | null
          description?: string
          due_date?: string
          id?: string
          priority?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string
          id: string
          payment_method_id: string | null
          service_id: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          description: string
          id?: string
          payment_method_id?: string | null
          service_id?: string | null
          status: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          payment_method_id?: string | null
          service_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
