import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from("keyzo_keys")
    .select("*");

  res.status(200).json({
    url: process.env.SUPABASE_URL,
    data,
    error
  });
}
