const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

app.get('/', (req,res)=>{
  res.send('KEYZO API ONLINE');
});

app.post('/api/verify_key', async (req,res)=>{
  try {
    const {key, device_id, device_name} = req.body;

    if(!key) return res.json({success:false,message:'Key kosong'});

    const [rows] = await db.execute(
      'SELECT * FROM keyzo_keys WHERE key_code=? LIMIT 1',
      [key]
    );

    if(rows.length===0){
      return res.json({success:false,message:'Key tidak ditemukan'});
    }

    const data = rows[0];

    if(data.status !== 'active'){
      return res.json({success:false,message:'Key tidak aktif'});
    }

    await db.execute(
      'UPDATE keyzo_keys SET device_id=?, device_name=?, last_login=NOW() WHERE id=?',
      [device_id, device_name, data.id]
    );

    res.json({
      success:true,
      message:'KEYZO OK'
    });

  } catch(e){
    res.json({success:false,error:e.message});
  }
});

app.listen(3000,()=>console.log('KEYZO API RUNNING'));
