import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export interface DbMember {
  id: number
  name: string
  scheduled_day: number
}

export interface DbUpdate {
  id: number
  member_id: number
  posted_on: string
  title: string
  content: string
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

const requireClient = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the build environment.')
  }
  return supabase
}

export const fetchSchedule = async (): Promise<DbMember[]> => {
  const { data, error } = await requireClient()
    .from('progress_members')
    .select('id, name, scheduled_day')
    .order('scheduled_day')
    .order('id')
  if (error) throw error
  return (data ?? []) as DbMember[]
}

export const fetchUpdates = async (from: string, to: string): Promise<DbUpdate[]> => {
  const { data, error } = await requireClient()
    .from('weekly_updates')
    .select('id, member_id, posted_on, title, content')
    .gte('posted_on', from)
    .lte('posted_on', to)
    .order('posted_on')
  if (error) throw error
  return (data ?? []) as DbUpdate[]
}
