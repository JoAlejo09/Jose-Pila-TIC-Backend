import express from "express";
import cors from "cors";
import userRoutes from "./routes/user_routes.js";
import authRoutes from "./routes/auth_routes.js";

const app = express();

//Middlewares
app.use(cors()); //Para permitir solicitudes desde cualquier origen
app.use(express.json()); //Para que el servidor pueda entender los datos en formato JSON

app.get("/", (req, res) => {
    res.send("Bienvenido a la API para el sistema de refuerzos academicos");
});
//Rutas
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);


export default app;