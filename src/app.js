import express from "express";
import cors from "cors";
import userRoutes from "./routes/user_routes.js";
import authRoutes from "./routes/auth_routes.js";
import perfilRoutes from "./routes/perfil_routes.js";
import materiaRoutes from "./routes/materia_routes.js";
import unidadRoutes from "./routes/unidad_routes.js";
import temaRoutes from "./routes/tema_routes.js";
import recursoRoutes from "./routes/recurso_routes.js";

import estudianteRoutes from "./routes/estudiante_routes.js";
import cuestionarioRoutes from "./routes/cuestionario_routes.js";
import preguntaRoutes from "./routes/pregunta_routes.js";
import resultadoRoutes from "./routes/resultado_routes.js"

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
app.use("/api/profile", perfilRoutes);
app.use("/api/materia", materiaRoutes);
app.use("/api/tema", temaRoutes);
app.use("/api/recurso",recursoRoutes);
app.use("/api/estudiante", estudianteRoutes);
app.use("/api/cuestionario", cuestionarioRoutes);
app.use("/api/pregunta", preguntaRoutes);
app.use("/api/resultado",resultadoRoutes);
app.use("/api/unidad", unidadRoutes);

export default app;