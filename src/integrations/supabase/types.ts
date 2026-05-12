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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          amount: number
          amount_paid: number | null
          bank_id: string | null
          category: string | null
          chart_account_id: string | null
          classification_id: string | null
          cost_center: string | null
          cost_center_id: string | null
          created_at: string
          created_by: string | null
          discount: number | null
          document_number: string | null
          document_type_id: string | null
          due_date: string
          id: string
          installment_number: number | null
          installment_total: number | null
          interest: number | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          penalty: number | null
          status: string
          supplier: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          amount_paid?: number | null
          bank_id?: string | null
          category?: string | null
          chart_account_id?: string | null
          classification_id?: string | null
          cost_center?: string | null
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number | null
          document_number?: string | null
          document_type_id?: string | null
          due_date: string
          id?: string
          installment_number?: number | null
          installment_total?: number | null
          interest?: number | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          penalty?: number | null
          status?: string
          supplier: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          bank_id?: string | null
          category?: string | null
          chart_account_id?: string | null
          classification_id?: string | null
          cost_center?: string | null
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number | null
          document_number?: string | null
          document_type_id?: string | null
          due_date?: string
          id?: string
          installment_number?: number | null
          installment_total?: number | null
          interest?: number | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          penalty?: number | null
          status?: string
          supplier?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "fin_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "fin_chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "fin_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "fin_cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "fin_document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "fin_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount: number
          amount_paid: number | null
          attendance_id: string | null
          bank_id: string | null
          chart_account_id: string | null
          classification_id: string | null
          cost_center_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount: number | null
          document_number: string | null
          document_type_id: string | null
          due_date: string
          id: string
          installment_number: number | null
          installment_total: number | null
          interest: number | null
          notes: string | null
          patient_id: string | null
          penalty: number | null
          received_at: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          amount_paid?: number | null
          attendance_id?: string | null
          bank_id?: string | null
          chart_account_id?: string | null
          classification_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number | null
          document_number?: string | null
          document_type_id?: string | null
          due_date: string
          id?: string
          installment_number?: number | null
          installment_total?: number | null
          interest?: number | null
          notes?: string | null
          patient_id?: string | null
          penalty?: number | null
          received_at?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          attendance_id?: string | null
          bank_id?: string | null
          chart_account_id?: string | null
          classification_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number | null
          document_number?: string | null
          document_type_id?: string | null
          due_date?: string
          id?: string
          installment_number?: number | null
          installment_total?: number | null
          interest?: number | null
          notes?: string | null
          patient_id?: string | null
          penalty?: number | null
          received_at?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "fin_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "fin_chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "fin_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "fin_cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "fin_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "fin_document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      adverse_events: {
        Row: {
          actions_taken: string | null
          created_at: string
          description: string
          event_type: string
          id: string
          occurred_at: string
          patient_id: string
          reported_by: string
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          actions_taken?: string | null
          created_at?: string
          description: string
          event_type: string
          id?: string
          occurred_at?: string
          patient_id: string
          reported_by: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          actions_taken?: string | null
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          occurred_at?: string
          patient_id?: string
          reported_by?: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adverse_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adverse_events_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_appointment_types: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
          requires_return_days: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
          requires_return_days?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          requires_return_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      agenda_insurances: {
        Row: {
          active: boolean
          agenda_id: string
          code: string | null
          created_at: string
          daily_limit: number | null
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          agenda_id: string
          code?: string | null
          created_at?: string
          daily_limit?: number | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          agenda_id?: string
          code?: string | null
          created_at?: string
          daily_limit?: number | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_insurances_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "schedule_agendas"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_permissions: {
        Row: {
          agenda_id: string
          can_admin: boolean
          can_cancel: boolean
          can_create: boolean
          can_edit: boolean
          can_fit_in: boolean
          can_open_attendance: boolean
          can_reschedule: boolean
          can_view: boolean
          created_at: string
          id: string
          profile_id: string | null
          role_name: string | null
          updated_at: string
        }
        Insert: {
          agenda_id: string
          can_admin?: boolean
          can_cancel?: boolean
          can_create?: boolean
          can_edit?: boolean
          can_fit_in?: boolean
          can_open_attendance?: boolean
          can_reschedule?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          profile_id?: string | null
          role_name?: string | null
          updated_at?: string
        }
        Update: {
          agenda_id?: string
          can_admin?: boolean
          can_cancel?: boolean
          can_create?: boolean
          can_edit?: boolean
          can_fit_in?: boolean
          can_open_attendance?: boolean
          can_reschedule?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          profile_id?: string | null
          role_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_permissions_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "schedule_agendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_procedures: {
        Row: {
          active: boolean
          agenda_id: string
          code: string | null
          created_at: string
          custom_name: string | null
          duration_minutes: number | null
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          agenda_id: string
          code?: string | null
          created_at?: string
          custom_name?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          agenda_id?: string
          code?: string | null
          created_at?: string
          custom_name?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_procedures_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "schedule_agendas"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_statuses: {
        Row: {
          active: boolean
          allowed_transitions: string[] | null
          color: string
          created_at: string
          display_order: number
          icon: string | null
          id: string
          is_system: boolean
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_transitions?: string[] | null
          color?: string
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_system?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_transitions?: string[] | null
          color?: string
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      agenda_type_orientations: {
        Row: {
          active: boolean
          appointment_type_id: string
          created_at: string
          display_order: number
          field_type: string
          id: string
          options: Json | null
          question: string
          required: boolean
        }
        Insert: {
          active?: boolean
          appointment_type_id: string
          created_at?: string
          display_order?: number
          field_type?: string
          id?: string
          options?: Json | null
          question: string
          required?: boolean
        }
        Update: {
          active?: boolean
          appointment_type_id?: string
          created_at?: string
          display_order?: number
          field_type?: string
          id?: string
          options?: Json | null
          question?: string
          required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "agenda_type_orientations_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "agenda_appointment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      allergies: {
        Row: {
          allergen: string
          allergy_type: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          reaction: string | null
          registered_by: string | null
          severity: Database["public"]["Enums"]["allergy_severity"]
        }
        Insert: {
          allergen: string
          allergy_type: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          reaction?: string | null
          registered_by?: string | null
          severity?: Database["public"]["Enums"]["allergy_severity"]
        }
        Update: {
          allergen?: string
          allergy_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reaction?: string | null
          registered_by?: string | null
          severity?: Database["public"]["Enums"]["allergy_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allergies_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_logs: {
        Row: {
          action: string
          appointment_id: string
          changed_by: string | null
          created_at: string
          details: Json | null
          id: string
          new_status: string | null
          old_status: string | null
        }
        Insert: {
          action: string
          appointment_id: string
          changed_by?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          old_status?: string | null
        }
        Update: {
          action?: string
          appointment_id?: string
          changed_by?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          old_status?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          agenda_id: string | null
          appointment_type: string
          attendance_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          insurance: string | null
          is_fit_in: boolean | null
          is_new_patient: boolean | null
          is_return: boolean | null
          location: string | null
          notes: string | null
          origin_channel: string | null
          patient_id: string | null
          phone: string | null
          priority: string | null
          professional_id: string | null
          provisional_birth_date: string | null
          provisional_gender: string | null
          provisional_name: string | null
          provisional_phone: string | null
          room: string | null
          scheduled_at: string
          specialty: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          agenda_id?: string | null
          appointment_type: string
          attendance_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          insurance?: string | null
          is_fit_in?: boolean | null
          is_new_patient?: boolean | null
          is_return?: boolean | null
          location?: string | null
          notes?: string | null
          origin_channel?: string | null
          patient_id?: string | null
          phone?: string | null
          priority?: string | null
          professional_id?: string | null
          provisional_birth_date?: string | null
          provisional_gender?: string | null
          provisional_name?: string | null
          provisional_phone?: string | null
          room?: string | null
          scheduled_at: string
          specialty?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          agenda_id?: string | null
          appointment_type?: string
          attendance_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          insurance?: string | null
          is_fit_in?: boolean | null
          is_new_patient?: boolean | null
          is_return?: boolean | null
          location?: string | null
          notes?: string | null
          origin_channel?: string | null
          patient_id?: string | null
          phone?: string | null
          priority?: string | null
          professional_id?: string | null
          provisional_birth_date?: string | null
          provisional_gender?: string | null
          provisional_name?: string | null
          provisional_phone?: string | null
          room?: string | null
          scheduled_at?: string
          specialty?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "schedule_agendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendances: {
        Row: {
          attendance_type: string
          closed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          insurance_name: string | null
          insurance_type: string
          notes: string | null
          opened_at: string
          patient_id: string
          professional_id: string | null
          sector: string | null
          status: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          attendance_type?: string
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          insurance_name?: string | null
          insurance_type?: string
          notes?: string | null
          opened_at?: string
          patient_id: string
          professional_id?: string | null
          sector?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          attendance_type?: string
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          insurance_name?: string | null
          insurance_type?: string
          notes?: string | null
          opened_at?: string
          patient_id?: string
          professional_id?: string | null
          sector?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          bed_type: string
          created_at: string
          expected_discharge: string | null
          id: string
          notes: string | null
          patient_id: string | null
          room: string
          sector: string | null
          status: string
          unit: string
          updated_at: string
        }
        Insert: {
          bed_number: string
          bed_type?: string
          created_at?: string
          expected_discharge?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          room: string
          sector?: string | null
          status?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          bed_number?: string
          bed_type?: string
          created_at?: string
          expected_discharge?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          room?: string
          sector?: string | null
          status?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_accounts: {
        Row: {
          amount: number
          attendance_id: string | null
          competence: string | null
          created_at: string
          id: string
          inconsistencies: string | null
          insurance_name: string | null
          notes: string | null
          patient_id: string | null
          reviewed_by: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          attendance_id?: string | null
          competence?: string | null
          created_at?: string
          id?: string
          inconsistencies?: string | null
          insurance_name?: string | null
          notes?: string | null
          patient_id?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          attendance_id?: string | null
          competence?: string | null
          created_at?: string
          id?: string
          inconsistencies?: string | null
          insurance_name?: string | null
          notes?: string | null
          patient_id?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_accounts_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_accounts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_accounts_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      braden_scale: {
        Row: {
          activity: number
          evaluated_at: string
          evaluated_by: string
          friction_shear: number
          id: string
          mobility: number
          moisture: number
          notes: string | null
          nutrition: number
          patient_id: string
          sensory_perception: number
          total_score: number | null
        }
        Insert: {
          activity: number
          evaluated_at?: string
          evaluated_by: string
          friction_shear: number
          id?: string
          mobility: number
          moisture: number
          notes?: string | null
          nutrition: number
          patient_id: string
          sensory_perception: number
          total_score?: number | null
        }
        Update: {
          activity?: number
          evaluated_at?: string
          evaluated_by?: string
          friction_shear?: number
          id?: string
          mobility?: number
          moisture?: number
          notes?: string | null
          nutrition?: number
          patient_id?: string
          sensory_perception?: number
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "braden_scale_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "braden_scale_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          budget_id: string
          created_at: string
          description: string
          id: string
          notes: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          budget_id: string
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          budget_id?: string
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          attendance_id: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          patient_id: string
          status: string
          total_amount: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          attendance_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          attendance_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_closings: {
        Row: {
          balance: number
          closing_date: string
          created_at: string
          id: string
          notes: string | null
          status: string
          total_expense: number
          total_income: number
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          balance?: number
          closing_date: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          total_expense?: number
          total_income?: number
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          balance?: number
          closing_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          total_expense?: number
          total_income?: number
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_closings_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_armazenamento: {
        Row: {
          carga_id: string | null
          created_at: string
          data_esterilizacao: string
          data_validade: string
          id: string
          kit_id: string | null
          local_armazenamento: string | null
          lote: string
          material_id: string | null
          prateleira: string | null
          quantidade: number
          reservado_para: string | null
          status: string
          updated_at: string
        }
        Insert: {
          carga_id?: string | null
          created_at?: string
          data_esterilizacao: string
          data_validade: string
          id?: string
          kit_id?: string | null
          local_armazenamento?: string | null
          lote: string
          material_id?: string | null
          prateleira?: string | null
          quantidade?: number
          reservado_para?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          carga_id?: string | null
          created_at?: string
          data_esterilizacao?: string
          data_validade?: string
          id?: string
          kit_id?: string | null
          local_armazenamento?: string | null
          lote?: string
          material_id?: string | null
          prateleira?: string | null
          quantidade?: number
          reservado_para?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_armazenamento_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cme_cargas_esterilizacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_armazenamento_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_armazenamento_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_carga_itens: {
        Row: {
          carga_id: string
          created_at: string
          id: string
          kit_id: string | null
          material_id: string | null
          quantidade: number
          recebimento_id: string | null
        }
        Insert: {
          carga_id: string
          created_at?: string
          id?: string
          kit_id?: string | null
          material_id?: string | null
          quantidade?: number
          recebimento_id?: string | null
        }
        Update: {
          carga_id?: string
          created_at?: string
          id?: string
          kit_id?: string | null
          material_id?: string | null
          quantidade?: number
          recebimento_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cme_carga_itens_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cme_cargas_esterilizacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_carga_itens_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_carga_itens_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_carga_itens_recebimento_id_fkey"
            columns: ["recebimento_id"]
            isOneToOne: false
            referencedRelation: "cme_recebimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_cargas_esterilizacao: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          data_liberacao: string | null
          equipamento_id: string | null
          id: string
          indicador_biologico: string | null
          indicador_quimico: string | null
          integrador: string | null
          liberado_por: string | null
          lote: string
          metodo: string
          numero_carga: string
          observacoes: string | null
          operador_id: string | null
          pressao: number | null
          resultado: string | null
          temperatura: number | null
          tempo_minutos: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          data_liberacao?: string | null
          equipamento_id?: string | null
          id?: string
          indicador_biologico?: string | null
          indicador_quimico?: string | null
          integrador?: string | null
          liberado_por?: string | null
          lote: string
          metodo?: string
          numero_carga: string
          observacoes?: string | null
          operador_id?: string | null
          pressao?: number | null
          resultado?: string | null
          temperatura?: number | null
          tempo_minutos?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          data_liberacao?: string | null
          equipamento_id?: string | null
          id?: string
          indicador_biologico?: string | null
          indicador_quimico?: string | null
          integrador?: string | null
          liberado_por?: string | null
          lote?: string
          metodo?: string
          numero_carga?: string
          observacoes?: string | null
          operador_id?: string | null
          pressao?: number | null
          resultado?: string | null
          temperatura?: number | null
          tempo_minutos?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_cargas_esterilizacao_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "cme_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_cargas_esterilizacao_liberado_por_fkey"
            columns: ["liberado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_cargas_esterilizacao_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_devolucoes: {
        Row: {
          created_at: string
          data_devolucao: string
          destino_final: string | null
          distribuicao_id: string | null
          id: string
          material_danificado: boolean | null
          motivo: string
          observacoes: string | null
          responsavel_id: string | null
          setor_devolvente: string
          usado: boolean | null
          validade_expirada: boolean | null
          violacao_embalagem: boolean | null
        }
        Insert: {
          created_at?: string
          data_devolucao?: string
          destino_final?: string | null
          distribuicao_id?: string | null
          id?: string
          material_danificado?: boolean | null
          motivo: string
          observacoes?: string | null
          responsavel_id?: string | null
          setor_devolvente: string
          usado?: boolean | null
          validade_expirada?: boolean | null
          violacao_embalagem?: boolean | null
        }
        Update: {
          created_at?: string
          data_devolucao?: string
          destino_final?: string | null
          distribuicao_id?: string | null
          id?: string
          material_danificado?: boolean | null
          motivo?: string
          observacoes?: string | null
          responsavel_id?: string | null
          setor_devolvente?: string
          usado?: boolean | null
          validade_expirada?: boolean | null
          violacao_embalagem?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cme_devolucoes_distribuicao_id_fkey"
            columns: ["distribuicao_id"]
            isOneToOne: false
            referencedRelation: "cme_distribuicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_devolucoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_distribuicoes: {
        Row: {
          armazenamento_id: string | null
          created_at: string
          data_distribuicao: string
          entregue_por: string | null
          finalidade: string | null
          id: string
          kit_id: string | null
          lote: string
          material_id: string | null
          observacoes: string | null
          profissional_solicitante: string | null
          quantidade: number
          recebido_por: string | null
          setor_destino: string
          status: string
          updated_at: string
        }
        Insert: {
          armazenamento_id?: string | null
          created_at?: string
          data_distribuicao?: string
          entregue_por?: string | null
          finalidade?: string | null
          id?: string
          kit_id?: string | null
          lote: string
          material_id?: string | null
          observacoes?: string | null
          profissional_solicitante?: string | null
          quantidade?: number
          recebido_por?: string | null
          setor_destino: string
          status?: string
          updated_at?: string
        }
        Update: {
          armazenamento_id?: string | null
          created_at?: string
          data_distribuicao?: string
          entregue_por?: string | null
          finalidade?: string | null
          id?: string
          kit_id?: string | null
          lote?: string
          material_id?: string | null
          observacoes?: string | null
          profissional_solicitante?: string | null
          quantidade?: number
          recebido_por?: string | null
          setor_destino?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_distribuicoes_armazenamento_id_fkey"
            columns: ["armazenamento_id"]
            isOneToOne: false
            referencedRelation: "cme_armazenamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_distribuicoes_entregue_por_fkey"
            columns: ["entregue_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_distribuicoes_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_distribuicoes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_equipamentos: {
        Row: {
          created_at: string
          fabricante: string | null
          id: string
          localizacao: string | null
          modelo: string | null
          nome: string
          numero_serie: string | null
          observacoes: string | null
          proxima_manutencao: string | null
          status: string
          tipo: string
          ultima_manutencao: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fabricante?: string | null
          id?: string
          localizacao?: string | null
          modelo?: string | null
          nome: string
          numero_serie?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          status?: string
          tipo?: string
          ultima_manutencao?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fabricante?: string | null
          id?: string
          localizacao?: string | null
          modelo?: string | null
          nome?: string
          numero_serie?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          status?: string
          tipo?: string
          ultima_manutencao?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cme_etapas_processamento: {
        Row: {
          checklist: Json | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          embalagem_utilizada: string | null
          equipamento_utilizado: string | null
          etapa: string
          id: string
          inspecao_visual: boolean | null
          integridade_ok: boolean | null
          observacoes: string | null
          recebimento_id: string
          responsavel_id: string | null
          selagem_ok: boolean | null
          tipo_limpeza: string | null
        }
        Insert: {
          checklist?: Json | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          embalagem_utilizada?: string | null
          equipamento_utilizado?: string | null
          etapa: string
          id?: string
          inspecao_visual?: boolean | null
          integridade_ok?: boolean | null
          observacoes?: string | null
          recebimento_id: string
          responsavel_id?: string | null
          selagem_ok?: boolean | null
          tipo_limpeza?: string | null
        }
        Update: {
          checklist?: Json | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          embalagem_utilizada?: string | null
          equipamento_utilizado?: string | null
          etapa?: string
          id?: string
          inspecao_visual?: boolean | null
          integridade_ok?: boolean | null
          observacoes?: string | null
          recebimento_id?: string
          responsavel_id?: string | null
          selagem_ok?: boolean | null
          tipo_limpeza?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cme_etapas_processamento_recebimento_id_fkey"
            columns: ["recebimento_id"]
            isOneToOne: false
            referencedRelation: "cme_recebimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_etapas_processamento_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_kit_itens: {
        Row: {
          created_at: string
          id: string
          kit_id: string
          material_id: string
          obrigatorio: boolean | null
          observacoes: string | null
          quantidade: number
        }
        Insert: {
          created_at?: string
          id?: string
          kit_id: string
          material_id: string
          obrigatorio?: boolean | null
          observacoes?: string | null
          quantidade?: number
        }
        Update: {
          created_at?: string
          id?: string
          kit_id?: string
          material_id?: string
          obrigatorio?: boolean | null
          observacoes?: string | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "cme_kit_itens_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_kit_itens_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_kits: {
        Row: {
          codigo: string | null
          created_at: string
          especialidade: string | null
          id: string
          instrucoes_montagem: string | null
          metodo_esterilizacao: string | null
          nome: string
          observacoes: string | null
          setores_uso: string | null
          status: string
          tipo_embalagem: string | null
          updated_at: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          especialidade?: string | null
          id?: string
          instrucoes_montagem?: string | null
          metodo_esterilizacao?: string | null
          nome: string
          observacoes?: string | null
          setores_uso?: string | null
          status?: string
          tipo_embalagem?: string | null
          updated_at?: string
        }
        Update: {
          codigo?: string | null
          created_at?: string
          especialidade?: string | null
          id?: string
          instrucoes_montagem?: string | null
          metodo_esterilizacao?: string | null
          nome?: string
          observacoes?: string | null
          setores_uso?: string | null
          status?: string
          tipo_embalagem?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cme_logs_rastreabilidade: {
        Row: {
          acao: string
          created_at: string
          detalhes: Json | null
          entidade_id: string
          entidade_tipo: string
          id: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          detalhes?: Json | null
          entidade_id: string
          entidade_tipo: string
          id?: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          detalhes?: Json | null
          entidade_id?: string
          entidade_tipo?: string
          id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cme_logs_rastreabilidade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_materiais: {
        Row: {
          categoria: string | null
          codigo: string
          complexidade: string | null
          created_at: string
          criticidade: string
          descricao: string | null
          embalagem_especifica: boolean | null
          especialidade: string | null
          id: string
          metodo_esterilizacao: string | null
          necessita_montagem_kit: boolean | null
          nome: string
          observacoes: string | null
          setor_principal: string | null
          status: string
          tempo_processamento_min: number | null
          tipo: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          codigo: string
          complexidade?: string | null
          created_at?: string
          criticidade?: string
          descricao?: string | null
          embalagem_especifica?: boolean | null
          especialidade?: string | null
          id?: string
          metodo_esterilizacao?: string | null
          necessita_montagem_kit?: boolean | null
          nome: string
          observacoes?: string | null
          setor_principal?: string | null
          status?: string
          tempo_processamento_min?: number | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          codigo?: string
          complexidade?: string | null
          created_at?: string
          criticidade?: string
          descricao?: string | null
          embalagem_especifica?: boolean | null
          especialidade?: string | null
          id?: string
          metodo_esterilizacao?: string | null
          necessita_montagem_kit?: boolean | null
          nome?: string
          observacoes?: string | null
          setor_principal?: string | null
          status?: string
          tempo_processamento_min?: number | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      cme_nao_conformidades: {
        Row: {
          acao_corretiva: string | null
          carga_id: string | null
          created_at: string
          data_ocorrencia: string
          data_resolucao: string | null
          descricao: string
          equipamento_id: string | null
          id: string
          kit_id: string | null
          material_id: string | null
          observacoes: string | null
          responsavel_id: string | null
          severidade: string
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          acao_corretiva?: string | null
          carga_id?: string | null
          created_at?: string
          data_ocorrencia?: string
          data_resolucao?: string | null
          descricao: string
          equipamento_id?: string | null
          id?: string
          kit_id?: string | null
          material_id?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          severidade?: string
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          acao_corretiva?: string | null
          carga_id?: string | null
          created_at?: string
          data_ocorrencia?: string
          data_resolucao?: string | null
          descricao?: string
          equipamento_id?: string | null
          id?: string
          kit_id?: string | null
          material_id?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          severidade?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_nao_conformidades_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cme_cargas_esterilizacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_nao_conformidades_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "cme_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_nao_conformidades_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_nao_conformidades_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_nao_conformidades_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_recebimentos: {
        Row: {
          created_at: string
          data_recebimento: string
          id: string
          kit_id: string | null
          material_id: string | null
          observacoes: string | null
          prioridade: string | null
          profissional_entregou: string | null
          quantidade: number
          recebido_por: string | null
          setor_origem: string
          situacao_sujidade: string | null
          status: string
          tipo_material: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_recebimento?: string
          id?: string
          kit_id?: string | null
          material_id?: string | null
          observacoes?: string | null
          prioridade?: string | null
          profissional_entregou?: string | null
          quantidade?: number
          recebido_por?: string | null
          setor_origem: string
          situacao_sujidade?: string | null
          status?: string
          tipo_material: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_recebimento?: string
          id?: string
          kit_id?: string | null
          material_id?: string | null
          observacoes?: string | null
          prioridade?: string | null
          profissional_entregou?: string | null
          quantidade?: number
          recebido_por?: string | null
          setor_origem?: string
          situacao_sujidade?: string | null
          status?: string
          tipo_material?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_recebimentos_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_recebimentos_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_recebimentos_recebido_por_fkey"
            columns: ["recebido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_testes_qualidade: {
        Row: {
          acao_corretiva: string | null
          carga_id: string | null
          created_at: string
          data_teste: string
          equipamento_id: string | null
          id: string
          lote_indicador: string | null
          observacoes: string | null
          responsavel_id: string | null
          resultado: string
          situacao: string | null
          tipo_teste: string
        }
        Insert: {
          acao_corretiva?: string | null
          carga_id?: string | null
          created_at?: string
          data_teste?: string
          equipamento_id?: string | null
          id?: string
          lote_indicador?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          resultado?: string
          situacao?: string | null
          tipo_teste: string
        }
        Update: {
          acao_corretiva?: string | null
          carga_id?: string | null
          created_at?: string
          data_teste?: string
          equipamento_id?: string | null
          id?: string
          lote_indicador?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          resultado?: string
          situacao?: string | null
          tipo_teste?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_testes_qualidade_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cme_cargas_esterilizacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_testes_qualidade_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "cme_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_testes_qualidade_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doc_protocol_document_types: {
        Row: {
          active: boolean
          category: string | null
          code: string | null
          color: string | null
          created_at: string
          display_order: number
          id: string
          integrates_tiss: boolean
          name: string
          notes: string | null
          passes_inloco_audit: boolean
          requires_acceptance: boolean
          requires_attachment: boolean
          requires_label: boolean
          requires_protocol: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          code?: string | null
          color?: string | null
          created_at?: string
          display_order?: number
          id?: string
          integrates_tiss?: boolean
          name: string
          notes?: string | null
          passes_inloco_audit?: boolean
          requires_acceptance?: boolean
          requires_attachment?: boolean
          requires_label?: boolean
          requires_protocol?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          code?: string | null
          color?: string | null
          created_at?: string
          display_order?: number
          id?: string
          integrates_tiss?: boolean
          name?: string
          notes?: string | null
          passes_inloco_audit?: boolean
          requires_acceptance?: boolean
          requires_attachment?: boolean
          requires_label?: boolean
          requires_protocol?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      doc_protocol_flow_profiles: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      doc_protocol_flow_rules: {
        Row: {
          active: boolean | null
          allows_return: boolean | null
          created_at: string | null
          document_type_id: string | null
          flow_profile_id: string
          id: string
          item_type: string | null
          notes: string | null
          required_previous_sector_id: string | null
          return_is_restricted: boolean | null
          rule_order: number | null
          sector_destination_id: string
          sector_origin_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          allows_return?: boolean | null
          created_at?: string | null
          document_type_id?: string | null
          flow_profile_id: string
          id?: string
          item_type?: string | null
          notes?: string | null
          required_previous_sector_id?: string | null
          return_is_restricted?: boolean | null
          rule_order?: number | null
          sector_destination_id: string
          sector_origin_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          allows_return?: boolean | null
          created_at?: string | null
          document_type_id?: string | null
          flow_profile_id?: string
          id?: string
          item_type?: string | null
          notes?: string | null
          required_previous_sector_id?: string | null
          return_is_restricted?: boolean | null
          rule_order?: number | null
          sector_destination_id?: string
          sector_origin_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doc_protocol_flow_rules_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_flow_rules_flow_profile_id_fkey"
            columns: ["flow_profile_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_flow_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_flow_rules_required_previous_sector_id_fkey"
            columns: ["required_previous_sector_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_flow_rules_sector_destination_id_fkey"
            columns: ["sector_destination_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_flow_rules_sector_origin_id_fkey"
            columns: ["sector_origin_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      doc_protocol_items: {
        Row: {
          accepted_at: string | null
          account_number: string | null
          attendance_date: string | null
          attendance_id: string | null
          attendance_type: string | null
          billing_account_id: string | null
          competence: string | null
          created_at: string
          current_status: string
          document_reference: string | null
          document_type_id: string | null
          id: string
          insurance_name: string | null
          item_date: string | null
          item_reason_id: string | null
          item_status: string
          item_type: string | null
          manual_title: string | null
          medical_record: string | null
          notes: string | null
          patient_id: string | null
          pending_reason: string | null
          priority: string | null
          protocol_id: string
          protocol_reference: string | null
          return_reason: string | null
          returned_at: string | null
          sector_current_id: string | null
          sector_origin_id: string | null
          sla_deadline: string | null
          snapshot: Json | null
          sort_order: number | null
          tags: string[] | null
        }
        Insert: {
          accepted_at?: string | null
          account_number?: string | null
          attendance_date?: string | null
          attendance_id?: string | null
          attendance_type?: string | null
          billing_account_id?: string | null
          competence?: string | null
          created_at?: string
          current_status?: string
          document_reference?: string | null
          document_type_id?: string | null
          id?: string
          insurance_name?: string | null
          item_date?: string | null
          item_reason_id?: string | null
          item_status?: string
          item_type?: string | null
          manual_title?: string | null
          medical_record?: string | null
          notes?: string | null
          patient_id?: string | null
          pending_reason?: string | null
          priority?: string | null
          protocol_id: string
          protocol_reference?: string | null
          return_reason?: string | null
          returned_at?: string | null
          sector_current_id?: string | null
          sector_origin_id?: string | null
          sla_deadline?: string | null
          snapshot?: Json | null
          sort_order?: number | null
          tags?: string[] | null
        }
        Update: {
          accepted_at?: string | null
          account_number?: string | null
          attendance_date?: string | null
          attendance_id?: string | null
          attendance_type?: string | null
          billing_account_id?: string | null
          competence?: string | null
          created_at?: string
          current_status?: string
          document_reference?: string | null
          document_type_id?: string | null
          id?: string
          insurance_name?: string | null
          item_date?: string | null
          item_reason_id?: string | null
          item_status?: string
          item_type?: string | null
          manual_title?: string | null
          medical_record?: string | null
          notes?: string | null
          patient_id?: string | null
          pending_reason?: string | null
          priority?: string | null
          protocol_id?: string
          protocol_reference?: string | null
          return_reason?: string | null
          returned_at?: string | null
          sector_current_id?: string | null
          sector_origin_id?: string | null
          sla_deadline?: string | null
          snapshot?: Json | null
          sort_order?: number | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "doc_protocol_items_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_items_billing_account_id_fkey"
            columns: ["billing_account_id"]
            isOneToOne: false
            referencedRelation: "billing_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_items_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_items_item_reason_id_fkey"
            columns: ["item_reason_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_items_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_items_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "doc_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_items_sector_current_id_fkey"
            columns: ["sector_current_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_items_sector_origin_id_fkey"
            columns: ["sector_origin_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      doc_protocol_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      doc_protocol_movements: {
        Row: {
          acceptance_type: string | null
          accepted_at: string | null
          accepted_by: string | null
          action: string | null
          context: Json | null
          created_at: string
          from_status: string | null
          id: string
          item_id: string | null
          movement_type: string
          notes: string | null
          performed_at: string | null
          performed_by: string | null
          protocol_id: string | null
          reason_id: string | null
          sector_destination_id: string | null
          sector_origin_id: string | null
          session_id: string | null
          status: string
          to_status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          acceptance_type?: string | null
          accepted_at?: string | null
          accepted_by?: string | null
          action?: string | null
          context?: Json | null
          created_at?: string
          from_status?: string | null
          id?: string
          item_id?: string | null
          movement_type: string
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
          protocol_id?: string | null
          reason_id?: string | null
          sector_destination_id?: string | null
          sector_origin_id?: string | null
          session_id?: string | null
          status?: string
          to_status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          acceptance_type?: string | null
          accepted_at?: string | null
          accepted_by?: string | null
          action?: string | null
          context?: Json | null
          created_at?: string
          from_status?: string | null
          id?: string
          item_id?: string | null
          movement_type?: string
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
          protocol_id?: string | null
          reason_id?: string | null
          sector_destination_id?: string | null
          sector_origin_id?: string | null
          session_id?: string | null
          status?: string
          to_status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doc_protocol_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_movements_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_movements_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "doc_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_movements_reason_id_fkey"
            columns: ["reason_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_movements_sector_destination_id_fkey"
            columns: ["sector_destination_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocol_movements_sector_origin_id_fkey"
            columns: ["sector_origin_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      doc_protocol_reasons: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          name: string
          notes: string | null
          type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          name: string
          notes?: string | null
          type?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          notes?: string | null
          type?: string
        }
        Relationships: []
      }
      doc_protocol_sectors: {
        Row: {
          active: boolean
          allowed_destinations: string[] | null
          allowed_doc_types: string[] | null
          can_return: boolean
          code: string | null
          color: string | null
          created_at: string
          display_order: number
          icon: string | null
          id: string
          name: string
          notes: string | null
          participates_flow: boolean
          requires_acceptance: boolean
          responsible_profile_id: string | null
          sla_hours: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_destinations?: string[] | null
          allowed_doc_types?: string[] | null
          can_return?: boolean
          code?: string | null
          color?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          name: string
          notes?: string | null
          participates_flow?: boolean
          requires_acceptance?: boolean
          responsible_profile_id?: string | null
          sla_hours?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_destinations?: string[] | null
          allowed_doc_types?: string[] | null
          can_return?: boolean
          code?: string | null
          color?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          name?: string
          notes?: string | null
          participates_flow?: boolean
          requires_acceptance?: boolean
          responsible_profile_id?: string | null
          sla_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      doc_protocols: {
        Row: {
          acceptance_type: string | null
          accepted_at: string | null
          accepted_items: number | null
          batch_number: string | null
          cancel_reason: string | null
          created_at: string
          emitter_id: string | null
          external_protocol: string | null
          flow_profile_id: string | null
          id: string
          last_movement_at: string | null
          notes: string | null
          pending_items: number | null
          priority: string
          protocol_date: string
          protocol_number: string
          protocol_type: string
          reason_id: string | null
          received_at: string | null
          receiver_id: string | null
          returned_items: number | null
          sector_destination_id: string | null
          sector_origin_id: string | null
          sent_at: string | null
          session_id: string | null
          status: string
          total_items: number
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          acceptance_type?: string | null
          accepted_at?: string | null
          accepted_items?: number | null
          batch_number?: string | null
          cancel_reason?: string | null
          created_at?: string
          emitter_id?: string | null
          external_protocol?: string | null
          flow_profile_id?: string | null
          id?: string
          last_movement_at?: string | null
          notes?: string | null
          pending_items?: number | null
          priority?: string
          protocol_date?: string
          protocol_number: string
          protocol_type?: string
          reason_id?: string | null
          received_at?: string | null
          receiver_id?: string | null
          returned_items?: number | null
          sector_destination_id?: string | null
          sector_origin_id?: string | null
          sent_at?: string | null
          session_id?: string | null
          status?: string
          total_items?: number
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          acceptance_type?: string | null
          accepted_at?: string | null
          accepted_items?: number | null
          batch_number?: string | null
          cancel_reason?: string | null
          created_at?: string
          emitter_id?: string | null
          external_protocol?: string | null
          flow_profile_id?: string | null
          id?: string
          last_movement_at?: string | null
          notes?: string | null
          pending_items?: number | null
          priority?: string
          protocol_date?: string
          protocol_number?: string
          protocol_type?: string
          reason_id?: string | null
          received_at?: string | null
          receiver_id?: string | null
          returned_items?: number | null
          sector_destination_id?: string | null
          sector_origin_id?: string | null
          sent_at?: string | null
          session_id?: string | null
          status?: string
          total_items?: number
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doc_protocols_emitter_id_fkey"
            columns: ["emitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocols_flow_profile_id_fkey"
            columns: ["flow_profile_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_flow_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocols_reason_id_fkey"
            columns: ["reason_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocols_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocols_sector_destination_id_fkey"
            columns: ["sector_destination_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doc_protocols_sector_origin_id_fkey"
            columns: ["sector_origin_id"]
            isOneToOne: false
            referencedRelation: "doc_protocol_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_notes: {
        Row: {
          assessment: string | null
          content: string
          created_at: string
          id: string
          note_type: string
          objective: string | null
          patient_id: string
          plan: string | null
          professional_id: string
          subjective: string | null
        }
        Insert: {
          assessment?: string | null
          content: string
          created_at?: string
          id?: string
          note_type: string
          objective?: string | null
          patient_id: string
          plan?: string | null
          professional_id: string
          subjective?: string | null
        }
        Update: {
          assessment?: string | null
          content?: string
          created_at?: string
          id?: string
          note_type?: string
          objective?: string | null
          patient_id?: string
          plan?: string | null
          professional_id?: string
          subjective?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evolution_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolution_notes_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_gallery_items: {
        Row: {
          annotations: Json | null
          category: string
          created_at: string
          equipment: string | null
          exam_date: string
          exam_request_id: string | null
          exam_time: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          laterality: string | null
          metadata: Json | null
          mime_type: string | null
          observations: string | null
          origin: string | null
          patient_id: string
          professional_name: string | null
          report_text: string | null
          report_url: string | null
          status: string
          subcategory: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          annotations?: Json | null
          category?: string
          created_at?: string
          equipment?: string | null
          exam_date?: string
          exam_request_id?: string | null
          exam_time?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string
          file_url: string
          id?: string
          laterality?: string | null
          metadata?: Json | null
          mime_type?: string | null
          observations?: string | null
          origin?: string | null
          patient_id: string
          professional_name?: string | null
          report_text?: string | null
          report_url?: string | null
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          annotations?: Json | null
          category?: string
          created_at?: string
          equipment?: string | null
          exam_date?: string
          exam_request_id?: string | null
          exam_time?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          laterality?: string | null
          metadata?: Json | null
          mime_type?: string | null
          observations?: string | null
          origin?: string | null
          patient_id?: string
          professional_name?: string | null
          report_text?: string | null
          report_url?: string | null
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_gallery_items_exam_request_id_fkey"
            columns: ["exam_request_id"]
            isOneToOne: false
            referencedRelation: "exam_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_gallery_items_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_gallery_items_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_requests: {
        Row: {
          collected_at: string | null
          created_at: string
          exam_category: string
          exam_type: string
          id: string
          observations: string | null
          patient_id: string
          priority: string
          requested_by: string
          result_date: string | null
          result_text: string | null
          status: string
          updated_at: string
        }
        Insert: {
          collected_at?: string | null
          created_at?: string
          exam_category?: string
          exam_type: string
          id?: string
          observations?: string | null
          patient_id: string
          priority?: string
          requested_by: string
          result_date?: string | null
          result_text?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          collected_at?: string | null
          created_at?: string
          exam_category?: string
          exam_type?: string
          id?: string
          observations?: string | null
          patient_id?: string
          priority?: string
          requested_by?: string
          result_date?: string | null
          result_text?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_bank_statements: {
        Row: {
          amount: number
          balance: number | null
          bank_id: string
          description: string
          document_number: string | null
          id: string
          imported_at: string
          movement_id: string | null
          reconciled: boolean
          statement_date: string
        }
        Insert: {
          amount: number
          balance?: number | null
          bank_id: string
          description: string
          document_number?: string | null
          id?: string
          imported_at?: string
          movement_id?: string | null
          reconciled?: boolean
          statement_date: string
        }
        Update: {
          amount?: number
          balance?: number | null
          bank_id?: string
          description?: string
          document_number?: string | null
          id?: string
          imported_at?: string
          movement_id?: string | null
          reconciled?: boolean
          statement_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_bank_statements_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "fin_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_bank_statements_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "fin_cash_movements"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_banks: {
        Row: {
          account_number: string | null
          account_type: string
          active: boolean
          agency: string | null
          bank_name: string
          company_id: string | null
          created_at: string
          current_balance: number
          id: string
          initial_balance: number
          notes: string | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string
          active?: boolean
          agency?: string | null
          bank_name: string
          company_id?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          notes?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          account_type?: string
          active?: boolean
          agency?: string | null
          bank_name?: string
          company_id?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_banks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "fin_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_budgets: {
        Row: {
          actual_amount: number
          budgeted_amount: number
          chart_account_id: string | null
          company_id: string | null
          cost_center_id: string | null
          created_at: string
          id: string
          notes: string | null
          period: string
          updated_at: string
        }
        Insert: {
          actual_amount?: number
          budgeted_amount?: number
          chart_account_id?: string | null
          company_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          period: string
          updated_at?: string
        }
        Update: {
          actual_amount?: number
          budgeted_amount?: number
          chart_account_id?: string | null
          company_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          period?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_budgets_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "fin_chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_budgets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "fin_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_budgets_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "fin_cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_cash_movements: {
        Row: {
          amount: number
          bank_id: string
          category: string | null
          created_at: string
          created_by: string | null
          description: string
          document_number: string | null
          id: string
          movement_date: string
          movement_type: string
          payment_method_id: string | null
          reconciled: boolean
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          amount: number
          bank_id: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          document_number?: string | null
          id?: string
          movement_date?: string
          movement_type?: string
          payment_method_id?: string | null
          reconciled?: boolean
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          amount?: number
          bank_id?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          document_number?: string | null
          id?: string
          movement_date?: string
          movement_type?: string
          payment_method_id?: string | null
          reconciled?: boolean
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_cash_movements_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "fin_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_cash_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_cash_movements_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "fin_payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_chart_of_accounts: {
        Row: {
          account_type: string
          active: boolean
          code: string
          created_at: string
          id: string
          is_synthetic: boolean
          level: number
          name: string
          notes: string | null
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          account_type?: string
          active?: boolean
          code: string
          created_at?: string
          id?: string
          is_synthetic?: boolean
          level?: number
          name: string
          notes?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          is_synthetic?: boolean
          level?: number
          name?: string
          notes?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "fin_chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_classifications: {
        Row: {
          active: boolean
          classification_type: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          classification_type?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          classification_type?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      fin_companies: {
        Row: {
          active: boolean
          address: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          group_id: string | null
          id: string
          ie: string | null
          is_matrix: boolean
          name: string
          phone: string | null
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          group_id?: string | null
          id?: string
          ie?: string | null
          is_matrix?: boolean
          name: string
          phone?: string | null
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          group_id?: string | null
          id?: string
          ie?: string | null
          is_matrix?: boolean
          name?: string
          phone?: string | null
          trade_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_companies_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "fin_company_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_company_groups: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fin_cost_center_groups: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fin_cost_centers: {
        Row: {
          active: boolean
          code: string
          created_at: string
          group_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          group_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          group_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_cost_centers_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "fin_cost_center_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_customers: {
        Row: {
          active: boolean
          address: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          patient_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          patient_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          patient_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_customers_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_document_types: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      fin_journal_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string | null
          cost_center_id: string | null
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          id: string
          notes: string | null
          reference_number: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          entry_date?: string
          id?: string
          notes?: string | null
          reference_number?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          id?: string
          notes?: string | null
          reference_number?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_journal_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_journal_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "fin_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_journal_entries_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "fin_cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_journal_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_journal_lines: {
        Row: {
          account_id: string
          created_at: string
          credit: number
          debit: number
          description: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "fin_chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "fin_journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_payment_methods: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      fin_reconciliations: {
        Row: {
          bank_id: string
          created_at: string
          id: string
          matched_count: number | null
          notes: string | null
          period_end: string
          period_start: string
          reconciled_at: string | null
          reconciled_by: string | null
          status: string
          unmatched_count: number | null
        }
        Insert: {
          bank_id: string
          created_at?: string
          id?: string
          matched_count?: number | null
          notes?: string | null
          period_end: string
          period_start: string
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: string
          unmatched_count?: number | null
        }
        Update: {
          bank_id?: string
          created_at?: string
          id?: string
          matched_count?: number | null
          notes?: string | null
          period_end?: string
          period_start?: string
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: string
          unmatched_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_reconciliations_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "fin_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_reconciliations_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_recurring_expenses: {
        Row: {
          active: boolean
          amount: number
          chart_account_id: string | null
          classification_id: string | null
          cost_center_id: string | null
          created_at: string
          day_of_month: number | null
          description: string
          end_date: string | null
          frequency: string
          id: string
          last_generated: string | null
          notes: string | null
          start_date: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          amount: number
          chart_account_id?: string | null
          classification_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          day_of_month?: number | null
          description: string
          end_date?: string | null
          frequency?: string
          id?: string
          last_generated?: string | null
          notes?: string | null
          start_date: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          amount?: number
          chart_account_id?: string | null
          classification_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          day_of_month?: number | null
          description?: string
          end_date?: string | null
          frequency?: string
          id?: string
          last_generated?: string | null
          notes?: string | null
          start_date?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_recurring_expenses_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "fin_chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_recurring_expenses_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "fin_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_recurring_expenses_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "fin_cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_recurring_expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "fin_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_suppliers: {
        Row: {
          active: boolean
          address: string | null
          bank_account: string | null
          bank_agency: string | null
          bank_name: string | null
          bank_pix: string | null
          city: string | null
          cnpj: string | null
          contact_person: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          ie: string | null
          name: string
          notes: string | null
          payment_days: number | null
          payment_terms: string | null
          phone: string | null
          state: string | null
          trade_name: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          bank_pix?: string | null
          city?: string | null
          cnpj?: string | null
          contact_person?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ie?: string | null
          name: string
          notes?: string | null
          payment_days?: number | null
          payment_terms?: string | null
          phone?: string | null
          state?: string | null
          trade_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          bank_pix?: string | null
          city?: string | null
          cnpj?: string | null
          contact_person?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ie?: string | null
          name?: string
          notes?: string | null
          payment_days?: number | null
          payment_terms?: string | null
          phone?: string | null
          state?: string | null
          trade_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      fluid_balance: {
        Row: {
          created_at: string
          direction: string
          id: string
          notes: string | null
          patient_id: string
          recorded_at: string
          recorded_by: string
          shift: string | null
          type: string
          volume_ml: number
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          notes?: string | null
          patient_id: string
          recorded_at?: string
          recorded_by: string
          shift?: string | null
          type: string
          volume_ml: number
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          notes?: string | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string
          shift?: string | null
          type?: string
          volume_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "fluid_balance_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fluid_balance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      glasgow_scale: {
        Row: {
          evaluated_at: string
          evaluated_by: string
          eye_response: number
          id: string
          motor_response: number
          notes: string | null
          patient_id: string
          pupil_left: string | null
          pupil_right: string | null
          total_score: number | null
          verbal_response: number
        }
        Insert: {
          evaluated_at?: string
          evaluated_by: string
          eye_response: number
          id?: string
          motor_response: number
          notes?: string | null
          patient_id: string
          pupil_left?: string | null
          pupil_right?: string | null
          total_score?: number | null
          verbal_response: number
        }
        Update: {
          evaluated_at?: string
          evaluated_by?: string
          eye_response?: number
          id?: string
          motor_response?: number
          notes?: string | null
          patient_id?: string
          pupil_left?: string | null
          pupil_right?: string | null
          total_score?: number | null
          verbal_response?: number
        }
        Relationships: [
          {
            foreignKeyName: "glasgow_scale_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "glasgow_scale_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_settings: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          attendance_id: string | null
          budget_id: string | null
          created_at: string
          created_by: string | null
          id: string
          invoice_number: string | null
          issued_at: string | null
          notes: string | null
          patient_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          attendance_id?: string | null
          budget_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          notes?: string | null
          patient_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          attendance_id?: string | null
          budget_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          notes?: string | null
          patient_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_collections: {
        Row: {
          collected_at: string
          collection_site: string | null
          collector_id: string | null
          created_at: string
          id: string
          incident: string | null
          notes: string | null
          patient_id: string | null
          request_item_id: string | null
          status: string
        }
        Insert: {
          collected_at?: string
          collection_site?: string | null
          collector_id?: string | null
          created_at?: string
          id?: string
          incident?: string | null
          notes?: string | null
          patient_id?: string | null
          request_item_id?: string | null
          status?: string
        }
        Update: {
          collected_at?: string
          collection_site?: string | null
          collector_id?: string | null
          created_at?: string
          id?: string
          incident?: string | null
          notes?: string | null
          patient_id?: string | null
          request_item_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_collections_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_collections_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_collections_request_item_id_fkey"
            columns: ["request_item_id"]
            isOneToOne: false
            referencedRelation: "lab_request_items"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_critical_communications: {
        Row: {
          communicated_at: string
          communicated_by: string | null
          communicated_to: string
          communication_method: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string | null
          request_item_id: string | null
          result_id: string | null
        }
        Insert: {
          communicated_at?: string
          communicated_by?: string | null
          communicated_to: string
          communication_method?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          request_item_id?: string | null
          result_id?: string | null
        }
        Update: {
          communicated_at?: string
          communicated_by?: string | null
          communicated_to?: string
          communication_method?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          request_item_id?: string | null
          result_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_critical_communications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_critical_communications_request_item_id_fkey"
            columns: ["request_item_id"]
            isOneToOne: false
            referencedRelation: "lab_request_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_critical_communications_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "lab_results"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_equipment: {
        Row: {
          active: boolean | null
          connection_type: string | null
          created_at: string
          host: string | null
          id: string
          interface_code: string | null
          manufacturer: string | null
          message_format: string | null
          model: string | null
          name: string
          notes: string | null
          parsing_rules: Json | null
          port: number | null
          protocol: string | null
          responsible: string | null
          sector_id: string | null
          serial_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          connection_type?: string | null
          created_at?: string
          host?: string | null
          id?: string
          interface_code?: string | null
          manufacturer?: string | null
          message_format?: string | null
          model?: string | null
          name: string
          notes?: string | null
          parsing_rules?: Json | null
          port?: number | null
          protocol?: string | null
          responsible?: string | null
          sector_id?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          connection_type?: string | null
          created_at?: string
          host?: string | null
          id?: string
          interface_code?: string | null
          manufacturer?: string | null
          message_format?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          parsing_rules?: Json | null
          port?: number | null
          protocol?: string | null
          responsible?: string | null
          sector_id?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_equipment_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "lab_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_exam_components: {
        Row: {
          active: boolean | null
          code: string | null
          created_at: string | null
          critical_max: number | null
          critical_min: number | null
          exam_id: string
          group_name: string | null
          id: string
          name: string
          options: string[] | null
          ref_age_max: number | null
          ref_age_min: number | null
          ref_gender: string | null
          ref_method: string | null
          reference_max: number | null
          reference_min: number | null
          reference_text: string | null
          result_type: string | null
          sort_order: number | null
          unit: string | null
        }
        Insert: {
          active?: boolean | null
          code?: string | null
          created_at?: string | null
          critical_max?: number | null
          critical_min?: number | null
          exam_id: string
          group_name?: string | null
          id?: string
          name: string
          options?: string[] | null
          ref_age_max?: number | null
          ref_age_min?: number | null
          ref_gender?: string | null
          ref_method?: string | null
          reference_max?: number | null
          reference_min?: number | null
          reference_text?: string | null
          result_type?: string | null
          sort_order?: number | null
          unit?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string | null
          created_at?: string | null
          critical_max?: number | null
          critical_min?: number | null
          exam_id?: string
          group_name?: string | null
          id?: string
          name?: string
          options?: string[] | null
          ref_age_max?: number | null
          ref_age_min?: number | null
          ref_gender?: string | null
          ref_method?: string | null
          reference_max?: number | null
          reference_min?: number | null
          reference_text?: string | null
          result_type?: string | null
          sort_order?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_exam_components_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "lab_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_exam_mappings: {
        Row: {
          active: boolean
          created_at: string
          criticality: string | null
          equipment_id: string | null
          exam_id: string
          expected_hours: number | null
          external_code: string
          external_material: string | null
          external_method: string | null
          external_name: string | null
          external_sector: string | null
          id: string
          loinc_code: string | null
          partner_id: string | null
          tuss_code: string | null
          updated_at: string
          version: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          criticality?: string | null
          equipment_id?: string | null
          exam_id: string
          expected_hours?: number | null
          external_code: string
          external_material?: string | null
          external_method?: string | null
          external_name?: string | null
          external_sector?: string | null
          id?: string
          loinc_code?: string | null
          partner_id?: string | null
          tuss_code?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          criticality?: string | null
          equipment_id?: string | null
          exam_id?: string
          expected_hours?: number | null
          external_code?: string
          external_material?: string | null
          external_method?: string | null
          external_name?: string | null
          external_sector?: string | null
          id?: string
          loinc_code?: string | null
          partner_id?: string | null
          tuss_code?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_exam_mappings_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "lab_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_exam_mappings_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "lab_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_exam_mappings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "lab_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_exams: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          critical_max: number | null
          critical_min: number | null
          criticality: string
          fasting_hours: number | null
          id: string
          material_id: string | null
          method_id: string | null
          name: string
          notes: string | null
          preparation_instructions: string | null
          processing_time_min: number | null
          reference_max: number | null
          reference_min: number | null
          reference_text: string | null
          requires_fasting: boolean
          result_mode: string | null
          result_type: string | null
          sector_id: string | null
          sla_minutes: number | null
          tube_id: string | null
          tuss_code: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          critical_max?: number | null
          critical_min?: number | null
          criticality?: string
          fasting_hours?: number | null
          id?: string
          material_id?: string | null
          method_id?: string | null
          name: string
          notes?: string | null
          preparation_instructions?: string | null
          processing_time_min?: number | null
          reference_max?: number | null
          reference_min?: number | null
          reference_text?: string | null
          requires_fasting?: boolean
          result_mode?: string | null
          result_type?: string | null
          sector_id?: string | null
          sla_minutes?: number | null
          tube_id?: string | null
          tuss_code?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          critical_max?: number | null
          critical_min?: number | null
          criticality?: string
          fasting_hours?: number | null
          id?: string
          material_id?: string | null
          method_id?: string | null
          name?: string
          notes?: string | null
          preparation_instructions?: string | null
          processing_time_min?: number | null
          reference_max?: number | null
          reference_min?: number | null
          reference_text?: string | null
          requires_fasting?: boolean
          result_mode?: string | null
          result_type?: string | null
          sector_id?: string | null
          sla_minutes?: number | null
          tube_id?: string | null
          tuss_code?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_exams_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "lab_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_exams_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "lab_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_exams_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "lab_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_exams_tube_id_fkey"
            columns: ["tube_id"]
            isOneToOne: false
            referencedRelation: "lab_tubes"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_external_critical_comms: {
        Row: {
          channel: string | null
          communicated_at: string | null
          communicated_by: string | null
          communicated_to: string
          id: string
          notes: string | null
          result_id: string
        }
        Insert: {
          channel?: string | null
          communicated_at?: string | null
          communicated_by?: string | null
          communicated_to: string
          id?: string
          notes?: string | null
          result_id: string
        }
        Update: {
          channel?: string | null
          communicated_at?: string | null
          communicated_by?: string | null
          communicated_to?: string
          id?: string
          notes?: string | null
          result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_external_critical_comms_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "lab_external_results"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_external_order_items: {
        Row: {
          attachment_url: string | null
          created_at: string
          exam_id: string | null
          external_code: string | null
          external_name: string | null
          id: string
          is_abnormal: boolean
          is_critical: boolean
          mapping_id: string | null
          notes: string | null
          order_id: string
          rejection_code: string | null
          rejection_reason: string | null
          request_item_id: string | null
          result_reference: string | null
          result_unit: string | null
          result_value: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          exam_id?: string | null
          external_code?: string | null
          external_name?: string | null
          id?: string
          is_abnormal?: boolean
          is_critical?: boolean
          mapping_id?: string | null
          notes?: string | null
          order_id: string
          rejection_code?: string | null
          rejection_reason?: string | null
          request_item_id?: string | null
          result_reference?: string | null
          result_unit?: string | null
          result_value?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          exam_id?: string | null
          external_code?: string | null
          external_name?: string | null
          id?: string
          is_abnormal?: boolean
          is_critical?: boolean
          mapping_id?: string | null
          notes?: string | null
          order_id?: string
          rejection_code?: string | null
          rejection_reason?: string | null
          request_item_id?: string | null
          result_reference?: string | null
          result_unit?: string | null
          result_value?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_external_order_items_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "lab_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_order_items_mapping_id_fkey"
            columns: ["mapping_id"]
            isOneToOne: false
            referencedRelation: "lab_exam_mappings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "lab_external_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_order_items_request_item_id_fkey"
            columns: ["request_item_id"]
            isOneToOne: false
            referencedRelation: "lab_request_items"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_external_orders: {
        Row: {
          attendance_id: string | null
          clinical_notes: string | null
          created_at: string
          error_message: string | null
          external_protocol: string | null
          external_status: string | null
          id: string
          insurance_name: string | null
          internal_status: string
          material: string | null
          notes: string | null
          order_number: string
          partner_id: string
          patient_id: string | null
          payload_received: Json | null
          payload_sent: Json | null
          priority: string
          received_at: string | null
          request_id: string | null
          requesting_doctor: string | null
          result_at: string | null
          sent_at: string | null
          sent_by: string | null
          shipment_id: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          attendance_id?: string | null
          clinical_notes?: string | null
          created_at?: string
          error_message?: string | null
          external_protocol?: string | null
          external_status?: string | null
          id?: string
          insurance_name?: string | null
          internal_status?: string
          material?: string | null
          notes?: string | null
          order_number: string
          partner_id: string
          patient_id?: string | null
          payload_received?: Json | null
          payload_sent?: Json | null
          priority?: string
          received_at?: string | null
          request_id?: string | null
          requesting_doctor?: string | null
          result_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          shipment_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          attendance_id?: string | null
          clinical_notes?: string | null
          created_at?: string
          error_message?: string | null
          external_protocol?: string | null
          external_status?: string | null
          id?: string
          insurance_name?: string | null
          internal_status?: string
          material?: string | null
          notes?: string | null
          order_number?: string
          partner_id?: string
          patient_id?: string | null
          payload_received?: Json | null
          payload_sent?: Json | null
          priority?: string
          received_at?: string | null
          request_id?: string | null
          requesting_doctor?: string | null
          result_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          shipment_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_external_orders_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "lab_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_orders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "lab_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_orders_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_orders_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "lab_external_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_external_recollections: {
        Row: {
          created_at: string | null
          id: string
          new_order_id: string | null
          notes: string | null
          order_id: string | null
          reason: string
          requested_by: string | null
          result_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_order_id?: string | null
          notes?: string | null
          order_id?: string | null
          reason: string
          requested_by?: string | null
          result_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_order_id?: string | null
          notes?: string | null
          order_id?: string | null
          reason?: string
          requested_by?: string | null
          result_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_external_recollections_new_order_id_fkey"
            columns: ["new_order_id"]
            isOneToOne: false
            referencedRelation: "lab_external_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_recollections_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "lab_external_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_recollections_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "lab_external_results"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_external_results: {
        Row: {
          attachment_url: string | null
          conference_status: string
          conferenced_at: string | null
          conferenced_by: string | null
          created_at: string
          exam_code: string | null
          exam_name: string | null
          external_protocol: string | null
          id: string
          is_abnormal: boolean
          is_critical: boolean
          linked_result_id: string | null
          notes: string | null
          numeric_value: number | null
          observation: string | null
          order_id: string | null
          order_item_id: string | null
          partner_id: string
          patient_id: string | null
          raw_payload: Json | null
          reference_text: string | null
          released_at: string | null
          released_by: string | null
          result_type: string | null
          unit: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          attachment_url?: string | null
          conference_status?: string
          conferenced_at?: string | null
          conferenced_by?: string | null
          created_at?: string
          exam_code?: string | null
          exam_name?: string | null
          external_protocol?: string | null
          id?: string
          is_abnormal?: boolean
          is_critical?: boolean
          linked_result_id?: string | null
          notes?: string | null
          numeric_value?: number | null
          observation?: string | null
          order_id?: string | null
          order_item_id?: string | null
          partner_id: string
          patient_id?: string | null
          raw_payload?: Json | null
          reference_text?: string | null
          released_at?: string | null
          released_by?: string | null
          result_type?: string | null
          unit?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          attachment_url?: string | null
          conference_status?: string
          conferenced_at?: string | null
          conferenced_by?: string | null
          created_at?: string
          exam_code?: string | null
          exam_name?: string | null
          external_protocol?: string | null
          id?: string
          is_abnormal?: boolean
          is_critical?: boolean
          linked_result_id?: string | null
          notes?: string | null
          numeric_value?: number | null
          observation?: string | null
          order_id?: string | null
          order_item_id?: string | null
          partner_id?: string
          patient_id?: string | null
          raw_payload?: Json | null
          reference_text?: string | null
          released_at?: string | null
          released_by?: string | null
          result_type?: string | null
          unit?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_external_results_conferenced_by_fkey"
            columns: ["conferenced_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_results_linked_result_id_fkey"
            columns: ["linked_result_id"]
            isOneToOne: false
            referencedRelation: "lab_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_results_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "lab_external_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_results_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "lab_external_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_results_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "lab_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_external_results_released_by_fkey"
            columns: ["released_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_external_shipments: {
        Row: {
          channel: string | null
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          partner_id: string | null
          received_at: string | null
          sent_at: string | null
          shipment_number: string
          status: string
          updated_at: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          partner_id?: string | null
          received_at?: string | null
          sent_at?: string | null
          shipment_number: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          partner_id?: string | null
          received_at?: string | null
          sent_at?: string | null
          shipment_number?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_external_shipments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "lab_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_integration_issues: {
        Row: {
          created_at: string
          description: string
          equipment_id: string | null
          id: string
          issue_type: string
          order_id: string | null
          partner_id: string | null
          patient_id: string | null
          queue_id: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          equipment_id?: string | null
          id?: string
          issue_type: string
          order_id?: string | null
          partner_id?: string | null
          patient_id?: string | null
          queue_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          equipment_id?: string | null
          id?: string
          issue_type?: string
          order_id?: string | null
          partner_id?: string | null
          patient_id?: string | null
          queue_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_integration_issues_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "lab_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_issues_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "lab_external_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_issues_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "lab_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_issues_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_issues_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "lab_integration_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_integration_logs: {
        Row: {
          action: string
          created_at: string
          endpoint: string | null
          entity_id: string | null
          entity_type: string | null
          equipment_id: string | null
          error_details: string | null
          http_status: number | null
          id: string
          log_level: string
          log_type: string
          message: string | null
          order_id: string | null
          partner_id: string | null
          payload: Json | null
          performed_by: string | null
          queue_id: string | null
          response: Json | null
          response_time_ms: number | null
        }
        Insert: {
          action: string
          created_at?: string
          endpoint?: string | null
          entity_id?: string | null
          entity_type?: string | null
          equipment_id?: string | null
          error_details?: string | null
          http_status?: number | null
          id?: string
          log_level?: string
          log_type?: string
          message?: string | null
          order_id?: string | null
          partner_id?: string | null
          payload?: Json | null
          performed_by?: string | null
          queue_id?: string | null
          response?: Json | null
          response_time_ms?: number | null
        }
        Update: {
          action?: string
          created_at?: string
          endpoint?: string | null
          entity_id?: string | null
          entity_type?: string | null
          equipment_id?: string | null
          error_details?: string | null
          http_status?: number | null
          id?: string
          log_level?: string
          log_type?: string
          message?: string | null
          order_id?: string | null
          partner_id?: string | null
          payload?: Json | null
          performed_by?: string | null
          queue_id?: string | null
          response?: Json | null
          response_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_integration_logs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "lab_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "lab_external_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_logs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "lab_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_logs_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "lab_integration_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_integration_queue: {
        Row: {
          attempt: number
          created_at: string
          direction: string
          endpoint_url: string | null
          equipment_id: string | null
          error_message: string | null
          error_stack: string | null
          id: string
          max_attempts: number
          next_retry_at: string | null
          order_id: string | null
          partner_id: string | null
          patient_id: string | null
          payload_received: Json | null
          payload_sent: Json | null
          processed_at: string | null
          queue_type: string
          request_item_id: string | null
          response_status: number | null
          response_time_ms: number | null
          sample_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          direction?: string
          endpoint_url?: string | null
          equipment_id?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          max_attempts?: number
          next_retry_at?: string | null
          order_id?: string | null
          partner_id?: string | null
          patient_id?: string | null
          payload_received?: Json | null
          payload_sent?: Json | null
          processed_at?: string | null
          queue_type?: string
          request_item_id?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          sample_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempt?: number
          created_at?: string
          direction?: string
          endpoint_url?: string | null
          equipment_id?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          max_attempts?: number
          next_retry_at?: string | null
          order_id?: string | null
          partner_id?: string | null
          patient_id?: string | null
          payload_received?: Json | null
          payload_sent?: Json | null
          processed_at?: string | null
          queue_type?: string
          request_item_id?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          sample_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_integration_queue_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "lab_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_queue_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "lab_external_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_queue_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "lab_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_queue_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_queue_request_item_id_fkey"
            columns: ["request_item_id"]
            isOneToOne: false
            referencedRelation: "lab_request_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_integration_queue_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "lab_samples"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_materials: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_methods: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_panel_items: {
        Row: {
          created_at: string
          display_order: number
          exam_id: string
          id: string
          panel_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          exam_id: string
          id?: string
          panel_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          exam_id?: string
          id?: string
          panel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_panel_items_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "lab_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_panel_items_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "lab_panels"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_panels: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_partners: {
        Row: {
          accepts_partial: boolean
          active: boolean
          allows_recollection: boolean
          code: string | null
          created_at: string
          credential_token: string | null
          endpoint_url: string | null
          environment: string
          id: string
          integration_type: string
          name: string
          notes: string | null
          partner_type: string | null
          retry_attempts: number | null
          retry_interval_seconds: number | null
          returns_rejection_code: boolean
          sends_external_protocol: boolean
          sends_image: boolean
          sends_pdf: boolean
          sla_hours: number | null
          timeout_seconds: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          accepts_partial?: boolean
          active?: boolean
          allows_recollection?: boolean
          code?: string | null
          created_at?: string
          credential_token?: string | null
          endpoint_url?: string | null
          environment?: string
          id?: string
          integration_type?: string
          name: string
          notes?: string | null
          partner_type?: string | null
          retry_attempts?: number | null
          retry_interval_seconds?: number | null
          returns_rejection_code?: boolean
          sends_external_protocol?: boolean
          sends_image?: boolean
          sends_pdf?: boolean
          sla_hours?: number | null
          timeout_seconds?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          accepts_partial?: boolean
          active?: boolean
          allows_recollection?: boolean
          code?: string | null
          created_at?: string
          credential_token?: string | null
          endpoint_url?: string | null
          environment?: string
          id?: string
          integration_type?: string
          name?: string
          notes?: string | null
          partner_type?: string | null
          retry_attempts?: number | null
          retry_interval_seconds?: number | null
          returns_rejection_code?: boolean
          sends_external_protocol?: boolean
          sends_image?: boolean
          sends_pdf?: boolean
          sla_hours?: number | null
          timeout_seconds?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      lab_pending_issues: {
        Row: {
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          issue_type: string
          notes: string | null
          patient_id: string | null
          priority: string
          resolved_at: string | null
          resolved_by: string | null
          sla_deadline: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          issue_type: string
          notes?: string | null
          patient_id?: string | null
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          sla_deadline?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          issue_type?: string
          notes?: string | null
          patient_id?: string | null
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          sla_deadline?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_pending_issues_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_pending_issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_recollections: {
        Row: {
          created_at: string
          id: string
          new_sample_id: string | null
          notes: string | null
          original_sample_id: string | null
          patient_id: string | null
          reason: string
          request_item_id: string | null
          requested_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_sample_id?: string | null
          notes?: string | null
          original_sample_id?: string | null
          patient_id?: string | null
          reason: string
          request_item_id?: string | null
          requested_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_sample_id?: string | null
          notes?: string | null
          original_sample_id?: string | null
          patient_id?: string | null
          reason?: string
          request_item_id?: string | null
          requested_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_recollections_new_sample_id_fkey"
            columns: ["new_sample_id"]
            isOneToOne: false
            referencedRelation: "lab_samples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_recollections_original_sample_id_fkey"
            columns: ["original_sample_id"]
            isOneToOne: false
            referencedRelation: "lab_samples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_recollections_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_recollections_request_item_id_fkey"
            columns: ["request_item_id"]
            isOneToOne: false
            referencedRelation: "lab_request_items"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_reference_values: {
        Row: {
          age_max_years: number | null
          age_min_years: number | null
          created_at: string
          exam_id: string
          id: string
          max_value: number | null
          min_value: number | null
          reference_text: string | null
          sex: string | null
          unit: string | null
        }
        Insert: {
          age_max_years?: number | null
          age_min_years?: number | null
          created_at?: string
          exam_id: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          reference_text?: string | null
          sex?: string | null
          unit?: string | null
        }
        Update: {
          age_max_years?: number | null
          age_min_years?: number | null
          created_at?: string
          exam_id?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          reference_text?: string | null
          sex?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_reference_values_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "lab_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_rejection_reasons: {
        Row: {
          active: boolean
          category: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      lab_report_items: {
        Row: {
          created_at: string
          display_order: number
          id: string
          report_id: string
          result_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          report_id: string
          result_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          report_id?: string
          result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_report_items_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "lab_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_report_items_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "lab_results"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_reports: {
        Row: {
          attendance_id: string | null
          created_at: string
          id: string
          issued_at: string | null
          notes: string | null
          patient_id: string | null
          released_at: string | null
          released_by: string | null
          report_number: string
          request_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          attendance_id?: string | null
          created_at?: string
          id?: string
          issued_at?: string | null
          notes?: string | null
          patient_id?: string | null
          released_at?: string | null
          released_by?: string | null
          report_number: string
          request_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          attendance_id?: string | null
          created_at?: string
          id?: string
          issued_at?: string | null
          notes?: string | null
          patient_id?: string | null
          released_at?: string | null
          released_by?: string | null
          report_number?: string
          request_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_reports_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_reports_released_by_fkey"
            columns: ["released_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_reports_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "lab_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_request_items: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          material_id: string | null
          notes: string | null
          priority: string
          request_id: string
          sector_id: string | null
          sla_deadline: string | null
          status: string
          tube_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          material_id?: string | null
          notes?: string | null
          priority?: string
          request_id: string
          sector_id?: string | null
          sla_deadline?: string | null
          status?: string
          tube_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          material_id?: string | null
          notes?: string | null
          priority?: string
          request_id?: string
          sector_id?: string | null
          sla_deadline?: string | null
          status?: string
          tube_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_request_items_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "lab_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_request_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "lab_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "lab_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_request_items_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "lab_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_request_items_tube_id_fkey"
            columns: ["tube_id"]
            isOneToOne: false
            referencedRelation: "lab_tubes"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_requests: {
        Row: {
          attendance_id: string | null
          clinical_notes: string | null
          created_at: string
          created_by: string | null
          id: string
          insurance_name: string | null
          patient_id: string | null
          priority: string
          request_number: string
          requesting_doctor_id: string | null
          specialty: string | null
          status: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          attendance_id?: string | null
          clinical_notes?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          insurance_name?: string | null
          patient_id?: string | null
          priority?: string
          request_number: string
          requesting_doctor_id?: string | null
          specialty?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          attendance_id?: string | null
          clinical_notes?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          insurance_name?: string | null
          patient_id?: string | null
          priority?: string
          request_number?: string
          requesting_doctor_id?: string | null
          specialty?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_requests_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_requests_requesting_doctor_id_fkey"
            columns: ["requesting_doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_result_components: {
        Row: {
          component_id: string
          created_at: string | null
          id: string
          is_abnormal: boolean | null
          is_critical: boolean | null
          numeric_value: number | null
          result_id: string
          value: string | null
        }
        Insert: {
          component_id: string
          created_at?: string | null
          id?: string
          is_abnormal?: boolean | null
          is_critical?: boolean | null
          numeric_value?: number | null
          result_id: string
          value?: string | null
        }
        Update: {
          component_id?: string
          created_at?: string | null
          id?: string
          is_abnormal?: boolean | null
          is_critical?: boolean | null
          numeric_value?: number | null
          result_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_result_components_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "lab_exam_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_result_components_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "lab_results"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          created_at: string
          equipment_id: string | null
          id: string
          is_abnormal: boolean
          is_critical: boolean
          method_id: string | null
          numeric_value: number | null
          performed_at: string | null
          performed_by: string | null
          reference_text: string | null
          request_item_id: string
          result_source: string
          sample_id: string | null
          status: string
          technical_notes: string | null
          unit: string | null
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          value: string | null
        }
        Insert: {
          created_at?: string
          equipment_id?: string | null
          id?: string
          is_abnormal?: boolean
          is_critical?: boolean
          method_id?: string | null
          numeric_value?: number | null
          performed_at?: string | null
          performed_by?: string | null
          reference_text?: string | null
          request_item_id: string
          result_source?: string
          sample_id?: string | null
          status?: string
          technical_notes?: string | null
          unit?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string
          equipment_id?: string | null
          id?: string
          is_abnormal?: boolean
          is_critical?: boolean
          method_id?: string | null
          numeric_value?: number | null
          performed_at?: string | null
          performed_by?: string | null
          reference_text?: string | null
          request_item_id?: string
          result_source?: string
          sample_id?: string | null
          status?: string
          technical_notes?: string | null
          unit?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "lab_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "lab_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_request_item_id_fkey"
            columns: ["request_item_id"]
            isOneToOne: false
            referencedRelation: "lab_request_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "lab_samples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_sample_triage: {
        Row: {
          action: string
          created_at: string
          id: string
          performed_at: string
          performed_by: string | null
          rejection_notes: string | null
          rejection_reason_id: string | null
          sample_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          performed_at?: string
          performed_by?: string | null
          rejection_notes?: string | null
          rejection_reason_id?: string | null
          sample_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          performed_at?: string
          performed_by?: string | null
          rejection_notes?: string | null
          rejection_reason_id?: string | null
          sample_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_sample_triage_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_sample_triage_rejection_reason_id_fkey"
            columns: ["rejection_reason_id"]
            isOneToOne: false
            referencedRelation: "lab_rejection_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_sample_triage_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "lab_samples"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_samples: {
        Row: {
          barcode: string
          collected_at: string | null
          collection_id: string | null
          condition: string
          created_at: string
          current_sector_id: string | null
          id: string
          material_id: string | null
          notes: string | null
          patient_id: string | null
          received_at: string | null
          request_item_id: string | null
          status: string
          tube_id: string | null
          updated_at: string
          volume_ml: number | null
        }
        Insert: {
          barcode: string
          collected_at?: string | null
          collection_id?: string | null
          condition?: string
          created_at?: string
          current_sector_id?: string | null
          id?: string
          material_id?: string | null
          notes?: string | null
          patient_id?: string | null
          received_at?: string | null
          request_item_id?: string | null
          status?: string
          tube_id?: string | null
          updated_at?: string
          volume_ml?: number | null
        }
        Update: {
          barcode?: string
          collected_at?: string | null
          collection_id?: string | null
          condition?: string
          created_at?: string
          current_sector_id?: string | null
          id?: string
          material_id?: string | null
          notes?: string | null
          patient_id?: string | null
          received_at?: string | null
          request_item_id?: string | null
          status?: string
          tube_id?: string | null
          updated_at?: string
          volume_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_samples_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "lab_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_samples_current_sector_id_fkey"
            columns: ["current_sector_id"]
            isOneToOne: false
            referencedRelation: "lab_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_samples_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "lab_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_samples_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_samples_request_item_id_fkey"
            columns: ["request_item_id"]
            isOneToOne: false
            referencedRelation: "lab_request_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_samples_tube_id_fkey"
            columns: ["tube_id"]
            isOneToOne: false
            referencedRelation: "lab_tubes"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_sectors: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_tubes: {
        Row: {
          active: boolean
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          volume_ml: number | null
        }
        Insert: {
          active?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          volume_ml?: number | null
        }
        Update: {
          active?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          volume_ml?: number | null
        }
        Relationships: []
      }
      medical_history: {
        Row: {
          created_at: string
          date: string | null
          description: string
          history_type: string
          id: string
          notes: string | null
          patient_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description: string
          history_type: string
          id?: string
          notes?: string | null
          patient_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string
          history_type?: string
          id?: string
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_administrations: {
        Row: {
          administered_at: string | null
          administered_by: string
          created_at: string
          id: string
          medication_id: string
          notes: string | null
          patient_id: string
          scheduled_time: string
          status: string
        }
        Insert: {
          administered_at?: string | null
          administered_by: string
          created_at?: string
          id?: string
          medication_id: string
          notes?: string | null
          patient_id: string
          scheduled_time: string
          status?: string
        }
        Update: {
          administered_at?: string | null
          administered_by?: string
          created_at?: string
          id?: string
          medication_id?: string
          notes?: string | null
          patient_id?: string
          scheduled_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_administrations_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          name: string
          patient_id: string
          prescribed_by: string
          route: string
          start_date: string
          status: Database["public"]["Enums"]["medication_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          name: string
          patient_id: string
          prescribed_by: string
          route: string
          start_date: string
          status?: Database["public"]["Enums"]["medication_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          name?: string
          patient_id?: string
          prescribed_by?: string
          route?: string
          start_date?: string
          status?: Database["public"]["Enums"]["medication_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      morse_scale: {
        Row: {
          ambulatory_aid: number
          evaluated_at: string
          evaluated_by: string
          fall_history: number
          gait: number
          id: string
          iv_therapy: number
          mental_status: number
          notes: string | null
          patient_id: string
          secondary_diagnosis: number
          total_score: number | null
        }
        Insert: {
          ambulatory_aid: number
          evaluated_at?: string
          evaluated_by: string
          fall_history: number
          gait: number
          id?: string
          iv_therapy: number
          mental_status: number
          notes?: string | null
          patient_id: string
          secondary_diagnosis: number
          total_score?: number | null
        }
        Update: {
          ambulatory_aid?: number
          evaluated_at?: string
          evaluated_by?: string
          fall_history?: number
          gait?: number
          id?: string
          iv_therapy?: number
          mental_status?: number
          notes?: string | null
          patient_id?: string
          secondary_diagnosis?: number
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "morse_scale_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "morse_scale_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      multidisciplinary_notes: {
        Row: {
          content: string
          created_at: string
          goals: string | null
          id: string
          note_type: string
          patient_id: string
          professional_id: string
          specialty: string
          therapeutic_plan: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          goals?: string | null
          id?: string
          note_type?: string
          patient_id: string
          professional_id: string
          specialty: string
          therapeutic_plan?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          goals?: string | null
          id?: string
          note_type?: string
          patient_id?: string
          professional_id?: string
          specialty?: string
          therapeutic_plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "multidisciplinary_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multidisciplinary_notes_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          admission_date: string | null
          bed: string | null
          birth_date: string
          blood_type: string | null
          cpf: string | null
          created_at: string
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          gender: string
          health_insurance: string | null
          health_insurance_number: string | null
          id: string
          nome_social: string | null
          phone: string | null
          photo_url: string | null
          rg: string | null
          room: string | null
          status: Database["public"]["Enums"]["patient_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          bed?: string | null
          birth_date: string
          blood_type?: string | null
          cpf?: string | null
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          gender: string
          health_insurance?: string | null
          health_insurance_number?: string | null
          id?: string
          nome_social?: string | null
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          room?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          bed?: string | null
          birth_date?: string
          blood_type?: string | null
          cpf?: string | null
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          gender?: string
          health_insurance?: string | null
          health_insurance_number?: string | null
          id?: string
          nome_social?: string | null
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          room?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Relationships: []
      }
      pharmacy_dispensations: {
        Row: {
          batch_number: string | null
          created_at: string
          dispensed_at: string | null
          dispensed_by: string
          id: string
          medication_id: string
          notes: string | null
          patient_id: string
          quantity: number
          status: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          dispensed_at?: string | null
          dispensed_by: string
          id?: string
          medication_id: string
          notes?: string | null
          patient_id: string
          quantity?: number
          status?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string
          id?: string
          medication_id?: string
          notes?: string | null
          patient_id?: string
          quantity?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_dispensations_dispensed_by_fkey"
            columns: ["dispensed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_dispensations_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_dispensations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          crm_coren: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["professional_role"]
          specialty: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          crm_coren?: string | null
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["professional_role"]
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          crm_coren?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["professional_role"]
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      queue_counters: {
        Row: {
          counter_date: string
          id: string
          last_number: number
          queue_name: string
        }
        Insert: {
          counter_date?: string
          id?: string
          last_number?: number
          queue_name: string
        }
        Update: {
          counter_date?: string
          id?: string
          last_number?: number
          queue_name?: string
        }
        Relationships: []
      }
      queue_history: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          new_status: string | null
          old_status: string | null
          performed_by: string | null
          ticket_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          performed_by?: string | null
          ticket_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          performed_by?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "queue_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_tickets: {
        Row: {
          appointment_id: string | null
          attended_at: string | null
          called_at: string | null
          called_to: string | null
          checkin_data: Json | null
          completed_at: string | null
          created_at: string
          device_id: string | null
          id: string
          notification_enabled: boolean | null
          notification_token: string | null
          patient_id: string | null
          priority: number
          priority_code: string
          queue_name: string
          recall_count: number
          sector: string
          source: string
          status: string
          ticket_number: string
          ticket_type: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          attended_at?: string | null
          called_at?: string | null
          called_to?: string | null
          checkin_data?: Json | null
          completed_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          notification_enabled?: boolean | null
          notification_token?: string | null
          patient_id?: string | null
          priority?: number
          priority_code?: string
          queue_name?: string
          recall_count?: number
          sector?: string
          source?: string
          status?: string
          ticket_number: string
          ticket_type?: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          attended_at?: string | null
          called_at?: string | null
          called_to?: string | null
          checkin_data?: Json | null
          completed_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          notification_enabled?: boolean | null
          notification_token?: string | null
          patient_id?: string | null
          priority?: number
          priority_code?: string
          queue_name?: string
          recall_count?: number
          sector?: string
          source?: string
          status?: string
          ticket_number?: string
          ticket_type?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_tickets_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_tickets_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "totem_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_tickets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_tickets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "totem_units"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_agendas: {
        Row: {
          absence_notification: boolean
          accepts_fit_in: boolean
          accepts_return: boolean
          agenda_type: string
          allow_no_professional: boolean
          allowed_insurances: string[] | null
          allows_multi_unit: boolean
          allows_overlap: boolean
          allows_retroactive: boolean
          auto_block_holidays: boolean
          auto_confirm: boolean
          blocked_insurances: string[] | null
          code: string | null
          color: string | null
          created_at: string
          daily_patient_limit: number | null
          default_duration: number
          default_interval: number
          delay_tolerance: number | null
          description: string | null
          fit_in_limit_per_shift: number | null
          id: string
          instructions: string | null
          insurance_control: boolean
          internal_notes: string | null
          name: string
          notify_whatsapp: boolean
          opening_mode: string
          pre_appointment_reminder: boolean
          professional_id: string | null
          reception_rules: string | null
          requires_confirmation: boolean
          room_resource: string | null
          sector: string | null
          specialty: string | null
          status: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          absence_notification?: boolean
          accepts_fit_in?: boolean
          accepts_return?: boolean
          agenda_type?: string
          allow_no_professional?: boolean
          allowed_insurances?: string[] | null
          allows_multi_unit?: boolean
          allows_overlap?: boolean
          allows_retroactive?: boolean
          auto_block_holidays?: boolean
          auto_confirm?: boolean
          blocked_insurances?: string[] | null
          code?: string | null
          color?: string | null
          created_at?: string
          daily_patient_limit?: number | null
          default_duration?: number
          default_interval?: number
          delay_tolerance?: number | null
          description?: string | null
          fit_in_limit_per_shift?: number | null
          id?: string
          instructions?: string | null
          insurance_control?: boolean
          internal_notes?: string | null
          name: string
          notify_whatsapp?: boolean
          opening_mode?: string
          pre_appointment_reminder?: boolean
          professional_id?: string | null
          reception_rules?: string | null
          requires_confirmation?: boolean
          room_resource?: string | null
          sector?: string | null
          specialty?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          absence_notification?: boolean
          accepts_fit_in?: boolean
          accepts_return?: boolean
          agenda_type?: string
          allow_no_professional?: boolean
          allowed_insurances?: string[] | null
          allows_multi_unit?: boolean
          allows_overlap?: boolean
          allows_retroactive?: boolean
          auto_block_holidays?: boolean
          auto_confirm?: boolean
          blocked_insurances?: string[] | null
          code?: string | null
          color?: string | null
          created_at?: string
          daily_patient_limit?: number | null
          default_duration?: number
          default_interval?: number
          delay_tolerance?: number | null
          description?: string | null
          fit_in_limit_per_shift?: number | null
          id?: string
          instructions?: string | null
          insurance_control?: boolean
          internal_notes?: string | null
          name?: string
          notify_whatsapp?: boolean
          opening_mode?: string
          pre_appointment_reminder?: boolean
          professional_id?: string | null
          reception_rules?: string | null
          requires_confirmation?: boolean
          room_resource?: string | null
          sector?: string | null
          specialty?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          affected_patients: number | null
          affected_slots: number | null
          agenda_id: string
          block_new_only: boolean
          block_type: string
          created_at: string
          end_date: string
          end_time: string | null
          id: string
          internal_notes: string | null
          origin: string
          reason: string
          recurrence: string | null
          start_date: string
          start_time: string | null
        }
        Insert: {
          affected_patients?: number | null
          affected_slots?: number | null
          agenda_id: string
          block_new_only?: boolean
          block_type?: string
          created_at?: string
          end_date: string
          end_time?: string | null
          id?: string
          internal_notes?: string | null
          origin?: string
          reason: string
          recurrence?: string | null
          start_date: string
          start_time?: string | null
        }
        Update: {
          affected_patients?: number | null
          affected_slots?: number | null
          agenda_id?: string
          block_new_only?: boolean
          block_type?: string
          created_at?: string
          end_date?: string
          end_time?: string | null
          id?: string
          internal_notes?: string | null
          origin?: string
          reason?: string
          recurrence?: string | null
          start_date?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_blocks_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "schedule_agendas"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_holidays: {
        Row: {
          affected_agendas: string[] | null
          allows_exception: boolean
          auto_block: boolean
          created_at: string
          holiday_date: string
          holiday_type: string
          id: string
          name: string
          notes: string | null
          unit: string | null
        }
        Insert: {
          affected_agendas?: string[] | null
          allows_exception?: boolean
          auto_block?: boolean
          created_at?: string
          holiday_date: string
          holiday_type?: string
          id?: string
          name: string
          notes?: string | null
          unit?: string | null
        }
        Update: {
          affected_agendas?: string[] | null
          allows_exception?: boolean
          auto_block?: boolean
          created_at?: string
          holiday_date?: string
          holiday_type?: string
          id?: string
          name?: string
          notes?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      schedule_notes: {
        Row: {
          agenda_id: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          note_type: string
          specific_date: string | null
        }
        Insert: {
          agenda_id: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          note_type?: string
          specific_date?: string | null
        }
        Update: {
          agenda_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note_type?: string
          specific_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_notes_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "schedule_agendas"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_periods: {
        Row: {
          agenda_id: string
          allowed_insurances: string[] | null
          allowed_procedures: string[] | null
          allows_fit_in: boolean
          block_type: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          interval_minutes: number
          notes: string | null
          opening_type: string
          period_type: string
          slot_count: number | null
          start_time: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          agenda_id: string
          allowed_insurances?: string[] | null
          allowed_procedures?: string[] | null
          allows_fit_in?: boolean
          block_type?: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          interval_minutes?: number
          notes?: string | null
          opening_type?: string
          period_type?: string
          slot_count?: number | null
          start_time: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          agenda_id?: string
          allowed_insurances?: string[] | null
          allowed_procedures?: string[] | null
          allows_fit_in?: boolean
          block_type?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          interval_minutes?: number
          notes?: string | null
          opening_type?: string
          period_type?: string
          slot_count?: number | null
          start_time?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_periods_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "schedule_agendas"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_special_hours: {
        Row: {
          agenda_id: string
          created_at: string
          end_time: string
          id: string
          notes: string | null
          origin: string
          professional_id: string | null
          slot_count: number | null
          slot_type: string
          specific_date: string
          start_time: string
          unit: string | null
        }
        Insert: {
          agenda_id: string
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          origin?: string
          professional_id?: string | null
          slot_count?: number | null
          slot_type?: string
          specific_date: string
          start_time: string
          unit?: string | null
        }
        Update: {
          agenda_id?: string
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          origin?: string
          professional_id?: string | null
          slot_count?: number | null
          slot_type?: string
          specific_date?: string
          start_time?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_special_hours_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "schedule_agendas"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_wait_list: {
        Row: {
          agenda_id: string | null
          appointment_type: string | null
          created_at: string
          desired_date: string | null
          desired_period: string | null
          id: string
          notes: string | null
          patient_id: string
          priority: string
          professional_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agenda_id?: string | null
          appointment_type?: string | null
          created_at?: string
          desired_date?: string | null
          desired_period?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          priority?: string
          professional_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agenda_id?: string | null
          appointment_type?: string | null
          created_at?: string
          desired_date?: string | null
          desired_period?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          priority?: string
          professional_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_wait_list_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "schedule_agendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_wait_list_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      situacao_cadastral: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      solicitante_cbo: {
        Row: {
          active: boolean | null
          codigo: string
          created_at: string | null
          descricao: string
          id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          codigo: string
          created_at?: string | null
          descricao: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          codigo?: string
          created_at?: string | null
          descricao?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      solicitantes: {
        Row: {
          bairro: string | null
          cbo_id: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          conselho: string
          cpf: string
          created_at: string | null
          endereco: string | null
          estado: string | null
          fone1: string | null
          fone2: string | null
          id: string
          login: string | null
          nome: string
          numero: string | null
          produtividade_habilitado: boolean | null
          produtividade_perc_desconto_vl_caixa: number | null
          produtividade_perc_desconto_vl_convenio: number | null
          produtividade_perc_recebe_vl_caixa: number | null
          produtividade_perc_recebe_vl_convenio: number | null
          produtividade_percentual: number | null
          senha: string | null
          sigla: string
          situacao_id: string | null
          tipo_conselho_id: string | null
          unidade_id: string | null
          updated_at: string | null
          user_id: string | null
          user_modified: string | null
        }
        Insert: {
          bairro?: string | null
          cbo_id?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          conselho: string
          cpf: string
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          fone1?: string | null
          fone2?: string | null
          id?: string
          login?: string | null
          nome: string
          numero?: string | null
          produtividade_habilitado?: boolean | null
          produtividade_perc_desconto_vl_caixa?: number | null
          produtividade_perc_desconto_vl_convenio?: number | null
          produtividade_perc_recebe_vl_caixa?: number | null
          produtividade_perc_recebe_vl_convenio?: number | null
          produtividade_percentual?: number | null
          senha?: string | null
          sigla: string
          situacao_id?: string | null
          tipo_conselho_id?: string | null
          unidade_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_modified?: string | null
        }
        Update: {
          bairro?: string | null
          cbo_id?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          conselho?: string
          cpf?: string
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          fone1?: string | null
          fone2?: string | null
          id?: string
          login?: string | null
          nome?: string
          numero?: string | null
          produtividade_habilitado?: boolean | null
          produtividade_perc_desconto_vl_caixa?: number | null
          produtividade_perc_desconto_vl_convenio?: number | null
          produtividade_perc_recebe_vl_caixa?: number | null
          produtividade_perc_recebe_vl_convenio?: number | null
          produtividade_percentual?: number | null
          senha?: string | null
          sigla?: string
          situacao_id?: string | null
          tipo_conselho_id?: string | null
          unidade_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_modified?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitantes_cbo_id_fkey"
            columns: ["cbo_id"]
            isOneToOne: false
            referencedRelation: "solicitante_cbo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitantes_situacao_id_fkey"
            columns: ["situacao_id"]
            isOneToOne: false
            referencedRelation: "situacao_cadastral"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitantes_tipo_conselho_id_fkey"
            columns: ["tipo_conselho_id"]
            isOneToOne: false
            referencedRelation: "tipo_conselho_profissional"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitantes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitantes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitantes_user_modified_fkey"
            columns: ["user_modified"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          end_time: string | null
          id: string
          notes: string | null
          professional_id: string | null
          professional_name: string
          schedule_date: string
          sector: string
          shift: string
          start_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          professional_id?: string | null
          professional_name: string
          schedule_date: string
          sector: string
          shift: string
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          professional_id?: string | null
          professional_name?: string
          schedule_date?: string
          sector?: string
          shift?: string
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_items: {
        Row: {
          batch: string | null
          category: string | null
          code: string | null
          created_at: string
          current_balance: number
          expiry_date: string | null
          id: string
          location: string | null
          min_balance: number | null
          name: string
          notes: string | null
          status: string
          stock_type: string
          unit_measure: string
          updated_at: string
        }
        Insert: {
          batch?: string | null
          category?: string | null
          code?: string | null
          created_at?: string
          current_balance?: number
          expiry_date?: string | null
          id?: string
          location?: string | null
          min_balance?: number | null
          name: string
          notes?: string | null
          status?: string
          stock_type?: string
          unit_measure?: string
          updated_at?: string
        }
        Update: {
          batch?: string | null
          category?: string | null
          code?: string | null
          created_at?: string
          current_balance?: number
          expiry_date?: string | null
          id?: string
          location?: string | null
          min_balance?: number | null
          name?: string
          notes?: string | null
          status?: string
          stock_type?: string
          unit_measure?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          batch: string | null
          created_at: string
          destination: string | null
          id: string
          moved_at: string
          movement_type: string
          notes: string | null
          origin: string | null
          performed_by: string | null
          quantity: number
          stock_item_id: string
        }
        Insert: {
          batch?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          moved_at?: string
          movement_type?: string
          notes?: string | null
          origin?: string | null
          performed_by?: string | null
          quantity: number
          stock_item_id: string
        }
        Update: {
          batch?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          moved_at?: string
          movement_type?: string
          notes?: string | null
          origin?: string | null
          performed_by?: string | null
          quantity?: number
          stock_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
        ]
      }
      surgical_procedures: {
        Row: {
          accommodation: string | null
          anesthesia_type: string | null
          anesthetist_name: string | null
          blood_reserve: string | null
          created_at: string
          description: string | null
          end_time: string | null
          equipment: string | null
          expected_stay: string | null
          fasting_notes: string | null
          id: string
          insurance: string | null
          is_inpatient: boolean | null
          needs_icu: boolean | null
          notes: string | null
          nursing_notes: string | null
          opme: string | null
          patient_id: string
          pre_op_cid: string | null
          priority: string | null
          procedure_type: string
          room: string | null
          scheduled_date: string | null
          start_time: string | null
          status: string
          surgeon_id: string
          surgery_character: string | null
          surgical_risk: string | null
          team_members: string | null
          updated_at: string
        }
        Insert: {
          accommodation?: string | null
          anesthesia_type?: string | null
          anesthetist_name?: string | null
          blood_reserve?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          equipment?: string | null
          expected_stay?: string | null
          fasting_notes?: string | null
          id?: string
          insurance?: string | null
          is_inpatient?: boolean | null
          needs_icu?: boolean | null
          notes?: string | null
          nursing_notes?: string | null
          opme?: string | null
          patient_id: string
          pre_op_cid?: string | null
          priority?: string | null
          procedure_type: string
          room?: string | null
          scheduled_date?: string | null
          start_time?: string | null
          status?: string
          surgeon_id: string
          surgery_character?: string | null
          surgical_risk?: string | null
          team_members?: string | null
          updated_at?: string
        }
        Update: {
          accommodation?: string | null
          anesthesia_type?: string | null
          anesthetist_name?: string | null
          blood_reserve?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          equipment?: string | null
          expected_stay?: string | null
          fasting_notes?: string | null
          id?: string
          insurance?: string | null
          is_inpatient?: boolean | null
          needs_icu?: boolean | null
          notes?: string | null
          nursing_notes?: string | null
          opme?: string | null
          patient_id?: string
          pre_op_cid?: string | null
          priority?: string | null
          procedure_type?: string
          room?: string | null
          scheduled_date?: string | null
          start_time?: string | null
          status?: string
          surgeon_id?: string
          surgery_character?: string | null
          surgical_risk?: string | null
          team_members?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgical_procedures_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgical_procedures_surgeon_id_fkey"
            columns: ["surgeon_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tipo_conselho_profissional: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          nome: string
          sigla: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          sigla: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          sigla?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      totem_devices: {
        Row: {
          active: boolean
          created_at: string
          device_identifier: string | null
          id: string
          location: string | null
          name: string
          observations: string | null
          overrides: Json | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          device_identifier?: string | null
          id?: string
          location?: string | null
          name: string
          observations?: string | null
          overrides?: Json | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          device_identifier?: string | null
          id?: string
          location?: string | null
          name?: string
          observations?: string | null
          overrides?: Json | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "totem_devices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "totem_units"
            referencedColumns: ["id"]
          },
        ]
      }
      totem_ticket_type_priorities: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          priority_code: string
          ticket_type_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          priority_code: string
          ticket_type_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          priority_code?: string
          ticket_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "totem_ticket_type_priorities_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "totem_ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      totem_ticket_types: {
        Row: {
          active: boolean
          code: string
          color: string | null
          created_at: string
          display_order: number
          id: string
          label: string
          prefix: string
          priority: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          color?: string | null
          created_at?: string
          display_order?: number
          id?: string
          label: string
          prefix?: string
          priority?: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          color?: string | null
          created_at?: string
          display_order?: number
          id?: string
          label?: string
          prefix?: string
          priority?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "totem_ticket_types_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "totem_units"
            referencedColumns: ["id"]
          },
        ]
      }
      totem_units: {
        Row: {
          active: boolean
          ads_enabled: boolean
          ads_idle_seconds: number
          ads_interval_seconds: number
          background_image_url: string | null
          call_display_seconds: number
          created_at: string
          id: string
          locution_enabled: boolean
          locution_speak_location: boolean
          locution_speak_priority: boolean
          logo_url: string | null
          name: string
          observations: string | null
          pre_call_sound: string
          primary_color: string | null
          print_auto: boolean
          print_auto_cut: boolean
          print_block_spacing: number
          print_copies: number
          print_cut_extra_height: number
          print_enabled: boolean
          print_font_size: string
          print_footer_text: string
          print_header_text: string
          print_margin_bottom: number
          print_margin_left: number
          print_margin_right: number
          print_margin_top: number
          print_paper_width: string
          print_show_logo: boolean
          print_show_qr: boolean
          print_template: string
          privacy_mode: string
          result_countdown_seconds: number
          secondary_color: string | null
          show_clock: boolean
          show_history: boolean
          social_name_policy: string
          sound_enabled: boolean
          totem_checkin: boolean
          totem_retirar_senha: boolean
          totem_timeout_seconds: number
          updated_at: string
          voice_name: string | null
          voice_pitch: number
          voice_rate: number
          voice_volume: number
        }
        Insert: {
          active?: boolean
          ads_enabled?: boolean
          ads_idle_seconds?: number
          ads_interval_seconds?: number
          background_image_url?: string | null
          call_display_seconds?: number
          created_at?: string
          id?: string
          locution_enabled?: boolean
          locution_speak_location?: boolean
          locution_speak_priority?: boolean
          logo_url?: string | null
          name: string
          observations?: string | null
          pre_call_sound?: string
          primary_color?: string | null
          print_auto?: boolean
          print_auto_cut?: boolean
          print_block_spacing?: number
          print_copies?: number
          print_cut_extra_height?: number
          print_enabled?: boolean
          print_font_size?: string
          print_footer_text?: string
          print_header_text?: string
          print_margin_bottom?: number
          print_margin_left?: number
          print_margin_right?: number
          print_margin_top?: number
          print_paper_width?: string
          print_show_logo?: boolean
          print_show_qr?: boolean
          print_template?: string
          privacy_mode?: string
          result_countdown_seconds?: number
          secondary_color?: string | null
          show_clock?: boolean
          show_history?: boolean
          social_name_policy?: string
          sound_enabled?: boolean
          totem_checkin?: boolean
          totem_retirar_senha?: boolean
          totem_timeout_seconds?: number
          updated_at?: string
          voice_name?: string | null
          voice_pitch?: number
          voice_rate?: number
          voice_volume?: number
        }
        Update: {
          active?: boolean
          ads_enabled?: boolean
          ads_idle_seconds?: number
          ads_interval_seconds?: number
          background_image_url?: string | null
          call_display_seconds?: number
          created_at?: string
          id?: string
          locution_enabled?: boolean
          locution_speak_location?: boolean
          locution_speak_priority?: boolean
          logo_url?: string | null
          name?: string
          observations?: string | null
          pre_call_sound?: string
          primary_color?: string | null
          print_auto?: boolean
          print_auto_cut?: boolean
          print_block_spacing?: number
          print_copies?: number
          print_cut_extra_height?: number
          print_enabled?: boolean
          print_font_size?: string
          print_footer_text?: string
          print_header_text?: string
          print_margin_bottom?: number
          print_margin_left?: number
          print_margin_right?: number
          print_margin_top?: number
          print_paper_width?: string
          print_show_logo?: boolean
          print_show_qr?: boolean
          print_template?: string
          privacy_mode?: string
          result_countdown_seconds?: number
          secondary_color?: string | null
          show_clock?: boolean
          show_history?: boolean
          social_name_policy?: string
          sound_enabled?: boolean
          totem_checkin?: boolean
          totem_retirar_senha?: boolean
          totem_timeout_seconds?: number
          updated_at?: string
          voice_name?: string | null
          voice_pitch?: number
          voice_rate?: number
          voice_volume?: number
        }
        Relationships: []
      }
      unidades: {
        Row: {
          active: boolean | null
          codigo: string | null
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          codigo?: string | null
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          codigo?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      unit_ads: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          duration_seconds: number
          id: string
          media_type: string
          media_url: string
          title: string
          unit_config_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          duration_seconds?: number
          id?: string
          media_type?: string
          media_url: string
          title: string
          unit_config_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          duration_seconds?: number
          id?: string
          media_type?: string
          media_url?: string
          title?: string
          unit_config_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_ads_unit_config_id_fkey"
            columns: ["unit_config_id"]
            isOneToOne: false
            referencedRelation: "unit_config"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_config: {
        Row: {
          ads_enabled: boolean
          ads_idle_seconds: number
          ads_interval_seconds: number
          background_image_url: string | null
          call_display_seconds: number
          created_at: string
          id: string
          locution_enabled: boolean
          locution_speak_location: boolean
          locution_speak_priority: boolean
          logo_url: string | null
          pre_call_sound: string
          primary_color: string | null
          print_auto: boolean
          print_auto_cut: boolean
          print_block_spacing: number
          print_copies: number
          print_cut_extra_height: number
          print_enabled: boolean
          print_font_size: string
          print_footer_text: string
          print_header_text: string
          print_margin_bottom: number
          print_margin_left: number
          print_margin_right: number
          print_margin_top: number
          print_paper_width: string
          print_show_logo: boolean
          print_show_qr: boolean
          print_template: string
          privacy_mode: string
          result_countdown_seconds: number
          secondary_color: string | null
          show_clock: boolean
          show_history: boolean
          social_name_policy: string
          sound_enabled: boolean
          totem_checkin: boolean
          totem_retirar_senha: boolean
          totem_timeout_seconds: number
          unit_name: string
          updated_at: string
          voice_pitch: number
          voice_rate: number
          voice_volume: number
        }
        Insert: {
          ads_enabled?: boolean
          ads_idle_seconds?: number
          ads_interval_seconds?: number
          background_image_url?: string | null
          call_display_seconds?: number
          created_at?: string
          id?: string
          locution_enabled?: boolean
          locution_speak_location?: boolean
          locution_speak_priority?: boolean
          logo_url?: string | null
          pre_call_sound?: string
          primary_color?: string | null
          print_auto?: boolean
          print_auto_cut?: boolean
          print_block_spacing?: number
          print_copies?: number
          print_cut_extra_height?: number
          print_enabled?: boolean
          print_font_size?: string
          print_footer_text?: string
          print_header_text?: string
          print_margin_bottom?: number
          print_margin_left?: number
          print_margin_right?: number
          print_margin_top?: number
          print_paper_width?: string
          print_show_logo?: boolean
          print_show_qr?: boolean
          print_template?: string
          privacy_mode?: string
          result_countdown_seconds?: number
          secondary_color?: string | null
          show_clock?: boolean
          show_history?: boolean
          social_name_policy?: string
          sound_enabled?: boolean
          totem_checkin?: boolean
          totem_retirar_senha?: boolean
          totem_timeout_seconds?: number
          unit_name?: string
          updated_at?: string
          voice_pitch?: number
          voice_rate?: number
          voice_volume?: number
        }
        Update: {
          ads_enabled?: boolean
          ads_idle_seconds?: number
          ads_interval_seconds?: number
          background_image_url?: string | null
          call_display_seconds?: number
          created_at?: string
          id?: string
          locution_enabled?: boolean
          locution_speak_location?: boolean
          locution_speak_priority?: boolean
          logo_url?: string | null
          pre_call_sound?: string
          primary_color?: string | null
          print_auto?: boolean
          print_auto_cut?: boolean
          print_block_spacing?: number
          print_copies?: number
          print_cut_extra_height?: number
          print_enabled?: boolean
          print_font_size?: string
          print_footer_text?: string
          print_header_text?: string
          print_margin_bottom?: number
          print_margin_left?: number
          print_margin_right?: number
          print_margin_top?: number
          print_paper_width?: string
          print_show_logo?: boolean
          print_show_qr?: boolean
          print_template?: string
          privacy_mode?: string
          result_countdown_seconds?: number
          secondary_color?: string | null
          show_clock?: boolean
          show_history?: boolean
          social_name_policy?: string
          sound_enabled?: boolean
          totem_checkin?: boolean
          totem_retirar_senha?: boolean
          totem_timeout_seconds?: number
          unit_name?: string
          updated_at?: string
          voice_pitch?: number
          voice_rate?: number
          voice_volume?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          authorized_by: string | null
          created_at: string
          document: string | null
          entry_time: string
          exit_time: string | null
          id: string
          notes: string | null
          patient_id: string | null
          relationship: string | null
          status: string
          visitor_name: string
          visitor_type: string
        }
        Insert: {
          authorized_by?: string | null
          created_at?: string
          document?: string | null
          entry_time?: string
          exit_time?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          relationship?: string | null
          status?: string
          visitor_name: string
          visitor_type?: string
        }
        Update: {
          authorized_by?: string | null
          created_at?: string
          document?: string | null
          entry_time?: string
          exit_time?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          relationship?: string | null
          status?: string
          visitor_name?: string
          visitor_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitors_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitors_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      vital_signs: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string
          glucose: number | null
          heart_rate: number | null
          height: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          pain_level: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string
          respiratory_rate: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          glucose?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_level?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by: string
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          glucose?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_level?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      allergy_severity: "leve" | "moderada" | "grave"
      app_role:
        | "admin"
        | "medico"
        | "enfermeiro"
        | "recepcao"
        | "farmacia"
        | "gestor"
        | "tecnico"
        | "usuario"
      medication_status: "ativo" | "suspenso" | "concluido"
      patient_status:
        | "internado"
        | "ambulatorial"
        | "alta"
        | "transferido"
        | "obito"
      professional_role:
        | "medico"
        | "enfermeiro"
        | "tecnico_enfermagem"
        | "fisioterapeuta"
        | "nutricionista"
        | "psicologo"
        | "farmaceutico"
        | "admin"
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
      allergy_severity: ["leve", "moderada", "grave"],
      app_role: [
        "admin",
        "medico",
        "enfermeiro",
        "recepcao",
        "farmacia",
        "gestor",
        "tecnico",
        "usuario",
      ],
      medication_status: ["ativo", "suspenso", "concluido"],
      patient_status: [
        "internado",
        "ambulatorial",
        "alta",
        "transferido",
        "obito",
      ],
      professional_role: [
        "medico",
        "enfermeiro",
        "tecnico_enfermagem",
        "fisioterapeuta",
        "nutricionista",
        "psicologo",
        "farmaceutico",
        "admin",
      ],
    },
  },
} as const
