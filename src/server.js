import app from "./app.js";
import conexionDB from "./database.js";
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 5000;

conexionDB();
app.listen(PORT,()=>{
    console.log(`Servidor conectado en el puerto ${PORT}`);
});