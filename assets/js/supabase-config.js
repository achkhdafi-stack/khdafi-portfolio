'use strict';

const SUPABASE_URL = "https://cgoyifzwnwruvbejemow.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb3lpZnp3bndydXZiZWplbW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NzU4NDgsImV4cCI6MjA5NzI1MTg0OH0.DQF4het2xhYqEDgGEv73HRtZrwQtO1Zc3IrHmwQtcF8";

let sb;
try {
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  console.error('Supabase belum dikonfigurasi dengan benar:', err);
}