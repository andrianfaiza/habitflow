import { supabase } from '../lib/supabaseClient'

const HABITS = 'habits'
const LOGS = 'habit_logs'

// Returns all habits for the given user.
export async function fetchHabits(userId) {
  const { data, error } = await supabase
    .from(HABITS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

// Creates a habit owned by the given user.
export async function createHabit(userId, payload) {
  const { data, error } = await supabase
    .from(HABITS)
    .insert({ ...payload, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

// Updates a habit by id.
export async function updateHabit(id, payload) {
  const { data, error } = await supabase
    .from(HABITS)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Deletes a habit by id (habit logs are removed by ON DELETE CASCADE).
export async function deleteHabit(id) {
  const { error } = await supabase.from(HABITS).delete().eq('id', id)
  if (error) throw error
}

// Returns every habit log that belongs to the given user.
export async function fetchHabitLogs(userId) {
  const { data, error } = await supabase
    .from(LOGS)
    .select('*')
    .eq('user_id', userId)
    .order('completed_date', { ascending: true })

  if (error) throw error
  return data ?? []
}

// Records a check-in for a habit on a given "YYYY-MM-DD". Duplicate keys are
// ignored, which keeps the action idempotent.
export async function checkInHabit(habitId, userId, dateKey) {
  const { data, error } = await supabase
    .from(LOGS)
    .upsert(
      { habit_id: habitId, user_id: userId, completed_date: dateKey },
      { onConflict: 'habit_id,completed_date', ignoreDuplicates: true },
    )
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Removes a check-in for a habit on a given "YYYY-MM-DD".
export async function undoHabitCheckIn(habitId, dateKey) {
  const { error } = await supabase
    .from(LOGS)
    .delete()
    .eq('habit_id', habitId)
    .eq('completed_date', dateKey)

  if (error) throw error
}
