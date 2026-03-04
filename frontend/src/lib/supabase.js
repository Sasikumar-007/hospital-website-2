import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vomjdsvgvrpsjaharfom.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbWpkc3ZndnJwc2phaGFyZm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzUwMzYsImV4cCI6MjA4ODIxMTAzNn0.3bJfhPw_Zj_zCIOxSTUAHJa4S0gilnxR40HWQ5-TWGk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
export async function testConnection() {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    return !error;
}
