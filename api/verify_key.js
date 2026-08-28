const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, message: "Method tidak diizinkan" });
    }

    const key = String(req.body.key || "").trim().toUpperCase();
    const device_id = req.body.device_id || "UNKNOWN";
    const device_name = req.body.device_name || "Android Device";

    if (!key) {
      return res.json({ success: false, message: "Key kosong" });
    }

    const { data: row, error } = await supabase
      .from("keyzo_keys")
      .select("*")
      .eq("key_value", key)
      .single();

    if (error || !row) {
      return res.json({ success: false, message: "Key tidak ditemukan" });
    }

    if (String(row.status).toLowerCase() !== "active") {
      return res.json({ success: false, message: "Key tidak aktif" });
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("keyzo_keys")
      .update({
        device_id,
        device_name,
        last_login: now
      })
      .eq("id", row.id);

    if (updateError) {
      return res.json({
        success: false,
        message: "Gagal menyimpan device",
        error: updateError.message
      });
    }

    return res.json({
      success: true,
      message: "Login berhasil",
      key,
      status: "ACTIVE",
      expires_at: row.expires_at,
      device_id,
      device_name,
      last_login: now
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
