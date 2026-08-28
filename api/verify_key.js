import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { key, device_id, device_name } = req.body || req.query;

  if (!key || !device_id) {
    return res.status(400).json({
      success: false,
      message: "Key dan device_id wajib"
    });
  }

  const { data, error } = await supabase
    .from("keyzo_keys")
    .select("*")
    .eq("key_value", key)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message
    });
  }

  if (!data) {
    return res.json({
      success: false,
      message: "Key tidak ditemukan"
    });
  }

  if (data.status !== "active") {
    return res.json({
      success: false,
      message: "Key tidak aktif"
    });
  }

  if (data.device_id && data.device_id !== device_id) {
    return res.json({
      success: false,
      message: "Key sudah digunakan di device lain"
    });
  }

  const { error: updateError } = await supabase
    .from("keyzo_keys")
    .update({
      device_id,
      device_name,
      last_login: new Date().toISOString()
    })
    .eq("id", data.id);

  if (updateError) {
    return res.status(500).json({
      success:false,
      message:"Gagal update device",
      error:updateError.message
    });
  }

  return res.json({
    success:true,
    message:"Login berhasil",
    key:data.key_value,
    device_id
  });
}
