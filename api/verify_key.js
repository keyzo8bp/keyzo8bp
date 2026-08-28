const { createClient } = require("@supabase/supabase-js");


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);



module.exports = async function handler(req, res) {

  try {


    if (req.method !== "POST") {

      return res.status(405).json({
        success: false,
        message: "Method tidak diizinkan"
      });

    }



    const key =
      String(req.body.key || "")
      .trim()
      .toUpperCase();



    const device_id =
      req.body.device_id || "UNKNOWN";



    const device_name =
      req.body.device_name || "Android Device";



    if (!key) {

      return res.json({
        success:false,
        message:"Key kosong"
      });

    }



    // Cari key di Supabase

    const { data, error } =
      await supabase
      .from("keyzo_keys")
      .select("*")
      .eq("key", key)
      .single();



    if (error || !data) {

      return res.json({
        success:false,
        message:"Key tidak ditemukan"
      });

    }



    // Cek status

    if (
      String(data.status).toLowerCase()
      !== "active"
    ) {

      return res.json({
        success:false,
        message:"Key tidak aktif"
      });

    }



    // Cek expired

    if (
      data.expires_at &&
      data.expires_at !== "PERMANENT"
    ) {

      const expired =
        new Date(data.expires_at);


      if (
        new Date() >= expired
      ) {

        return res.json({
          success:false,
          message:"Key sudah expired"
        });

      }

    }



    const now =
      new Date().toISOString();



    // Simpan device

    const { error:updateError } =
      await supabase
      .from("keyzo_keys")
      .update({

        device_id: device_id,

        device_name: device_name,

        last_login: now

      })
      .eq(
        "key",
        key
      );



    if (updateError) {

      return res.json({

        success:false,

        message:"Gagal menyimpan device",

        error:updateError.message

      });

    }



    return res.json({

      success:true,

      message:"Login berhasil",

      key:key,

      status:"ACTIVE",

      expires_at:
        data.expires_at,

      device_id:device_id,

      device_name:device_name,

      last_login:now

    });



  } catch(error) {


    return res.status(500).json({

      success:false,

      message:"Server error",

      error:error.message

    });


  }

};
