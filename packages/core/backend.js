// KODEXA Local — cliente compartido. No incluye credenciales privadas.
// Configurar URL y publishable key mediante window.KODEXA_BACKEND antes de importar.
// Nunca utilizar service_role en GitHub Pages.
const cfg = globalThis.KODEXA_BACKEND || {};
export const backendConfigured = Boolean(
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.url || '') &&
  typeof cfg.publishableKey === 'string' && cfg.publishableKey.length > 12
);
let clientPromise;
export async function backend() {
  if (!backendConfigured) throw new Error('Backend no configurado: no se permiten operaciones comerciales.');
  if (!clientPromise) clientPromise = import('https://esm.sh/@supabase/supabase-js@2.49.8')
    .then(({createClient}) => createClient(cfg.url, cfg.publishableKey, {
      auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true}
    }));
  return clientPromise;
}
export async function currentUser() {
  const db = await backend();
  const {data, error} = await db.auth.getUser();
  if (error) throw error;
  return data.user;
}
export async function signIn(email, password) {
  const db = await backend();
  const {data, error} = await db.auth.signInWithPassword({email,password});
  if (error) throw error;
  return data.user;
}
export async function signUp(email, password) {
  const db = await backend();
  const {data, error} = await db.auth.signUp({email,password});
  if (error) throw error;
  return data.user;
}
export async function signOut() {
  const db = await backend();
  const {error} = await db.auth.signOut();
  if (error) throw error;
}
export async function listMyRecords(table, order = 'created_at') {
  if (!['orders','ride_requests','appointments'].includes(table)) throw new Error('Tabla no permitida');
  const user = await currentUser();
  if (!user) throw new Error('Iniciá sesión');
  const db = await backend();
  const {data,error} = await db.from(table).select('*').order(order,{ascending:false});
  if (error) throw error;
  return data;
}
