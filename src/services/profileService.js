import { supabase } from '../lib/supabaseClient'

const TABLE = 'profiles'

// Loads the profile row, creating a default one if the trigger has not
// produced it yet (e.g. for users created before the schema was applied).
export async function fetchOrCreateProfile(user) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', user.id).maybeSingle()
  if (error) throw error
  if (data) return data

  const { data: created, error: insertError } = await supabase
    .from(TABLE)
    .insert({ id: user.id, full_name: user.user_metadata?.full_name ?? null })
    .select()
    .single()

  if (insertError) throw insertError
  return created
}

// Updates display fields (full_name, bio, avatar_url).
export async function updateProfile(id, patch) {
  const { data, error } = await supabase.from(TABLE).update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

// Replaces the preferences JSON blob.
export async function updatePreferences(id, preferences) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ preferences })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Deletes every task and habit owned by the user. Habit logs are removed
// through the habit ON DELETE CASCADE.
export async function resetUserData(userId) {
  const { error: taskError } = await supabase.from('tasks').delete().eq('user_id', userId)
  if (taskError) throw taskError

  const { error: habitError } = await supabase.from('habits').delete().eq('user_id', userId)
  if (habitError) throw habitError
}

// Deletes the authenticated account via the delete_current_user() RPC.
export async function deleteAccount() {
  const { error } = await supabase.rpc('delete_current_user')
  if (error) throw error
}

// Collects everything the user owns into a single JSON-serializable object.
export async function exportUserData(user) {
  const [tasksResult, habitsResult, logsResult, profileResult] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', user.id),
    supabase.from('habits').select('*').eq('user_id', user.id),
    supabase.from('habit_logs').select('*').eq('user_id', user.id),
    supabase.from(TABLE).select('*').eq('id', user.id).maybeSingle(),
  ])

  const firstError =
    tasksResult.error || habitsResult.error || logsResult.error || profileResult.error
  if (firstError) throw firstError

  return {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    profile: profileResult.data,
    tasks: tasksResult.data ?? [],
    habits: habitsResult.data ?? [],
    habit_logs: logsResult.data ?? [],
  }
}
