const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


module.exports = async function(req, res) {

  try {

    const {
      key,
      device_id,
      device_name
    } = req.body;


    if(!key){
      return res.json({
        success:false,
        message:"Key kosong"
      });
    }


    const cleanKey =
      key.trim().toUpperCase();


    const {data,error} =
      await supabase
      .from("keyzo_keys")
      .select("*")
      .eq("key_code", cleanKey)
      .single();


    if(error || !data){

      return res.json({
        success:false,
        message:"Key tidak ditemukan"
      });

    }


    if(data.status !== "active"){

      return res.json({
        success:false,
        message:"Key tidak aktif"
      });

    }


    const update =
      await supabase
      .from("keyzo_keys")
      .update({
        device_id:
          device_id || "UNKNOWN",

        device_name:
          device_name || "Android Device",

        last_login:
          new Date().toISOString()

      })
      .eq(
        "key_code",
        cleanKey
      );


    return res.json({

      success:true,

      message:"Login berhasil",

      key:data.key_code,

      device_id:
        device_id || "UNKNOWN",

      device_name:
        device_name || "Android Device"

    });


  } catch(e){

    return res.status(500).json({

      success:false,

      error:e.message

    });

  }

};
