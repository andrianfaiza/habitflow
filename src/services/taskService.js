import { supabase } from '../lib/supabaseClient'

const TABLE = 'tasks'

// Returns all tasks for the given user. RLS also restricts rows to auth.uid().
export async function fetchTasks(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('is_completed', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// Creates a task owned by the given user.
export async function createTask(userId, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...payload, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

// Updates a task by id and returns the updated row.
export async function updateTask(id, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Deletes a task by id.
export async function deleteTask(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
