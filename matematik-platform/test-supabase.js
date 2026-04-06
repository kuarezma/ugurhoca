require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log("Checking profiles with anon key...");
  const { data, error } = await supabase.from('profiles').select('*');
  console.log("Data count:", data ? data.length : null, "Error:", error);
  if (error) {
    console.error("Full error:", JSON.stringify(error, null, 2));
  }
}
check();
