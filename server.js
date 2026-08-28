const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


app.post("/api/verify_key", async (req, res) => {

  try {

    let {
      key,
      device_id,
      device_name
    } = req.body;


    if (!key) {
      return res.json({
        success: false,
        message: "Key kosong"
      });
    }


    key = key.toUpperCase().trim();


    if (!device_id) {
      device_id = "UNKNOWN";
    }


    if (!device_name) {
      device_name = "Android Device";
    }


    const { data, error } = await supabase
      .from("keyzo_keys")
      .select("*")
      .eq("key_code", key)
      .single();


    if (error || !data) {

      return res.json({
        success:false,
        message:"Key tidak ditemukan"
      });

    }


    if (
      data.status.toLowerCase() !== "active"
    ) {

      return res.json({
        success:false,
        message:"Key tidak aktif"
      });

    }


    const now =
      new Date().toISOString();


    const { error:updateError } =
      await supabase
      .from("keyzo_keys")
      .update({
        device_id: device_id,
        device_name: device_name,
        last_login: now
      })
      .eq(
        "key_code",
        key
      );


    if(updateError){

      return res.json({
        success:false,
        message:"Gagal update device"
      });

    }


    return res.json({

      success:true,

      message:"Login berhasil",

      key:data.key_code,

      status:"ACTIVE",

      device_id:device_id,

      device_name:device_name,

      last_login:now

    });


  } catch(err){

    return res.json({

      success:false,

      message:"Server error",

      error:err.message

    });

  }

});



app.get("/", (req,res)=>{

  res.send("KEYZO API SERVER OK");

});



module.exports = app;
