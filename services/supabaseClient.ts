import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzewgrcsppjefwypbzzn.supabase.co';
// Chave JWT correta do Supabase extraída da mensagem anterior
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6ZXdncmNzcHBqZWZ3eXBienpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1Mzg3MTIsImV4cCI6MjA4NTExNDcxMn0.OrL97drOfXFCUap1UeDL1IjemWX0L_MWciFqIL752sk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});
