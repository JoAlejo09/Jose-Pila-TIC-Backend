import Usuario from "../models/Usuario.js";
import Materia from "../models/Materia.js";
import Tema from "../models/Tema.js";
import Recurso from "../models/Recurso.js";
import Cuestionario from "../models/Cuestionario.js";
import Tutoria from "../models/Tutoria.js";

const obtenerEstadisticasAdmin = async (req, res) => {
  try {

    const totalUsuarios = await Usuario.countDocuments();

    const totalTutores = await Usuario.countDocuments({
      rol: "tutor",
    });

    const totalAdministradores = await Usuario.countDocuments({
      rol: "administrador",
    });

    const totalMaterias = await Materia.countDocuments();

    const totalTemas = await Tema.countDocuments();

    const totalRecursos = await Recurso.countDocuments();

    const totalEvaluaciones = await Evaluacion.countDocuments();

    const totalTutorias = await Tutoria.countDocuments();

    res.json({
      totalUsuarios,
      totalTutores,
      totalAdministradores,
      totalMaterias,
      totalTemas,
      totalRecursos,
      totalEvaluaciones,
      totalTutorias,
    });

  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

export { obtenerEstadisticasAdmin };