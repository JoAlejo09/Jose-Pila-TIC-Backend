import Usuario from "../models/Usuario.js";
import Estudiante from "../models/Estudiante.js";
import Tema from "../models/Tema.js";
import Materia from "../models/Materia.js";
import Recurso from "../models/Recurso.js";
import Resultado from "../models/Resultado.js";

// COMPLETAR PERFIL DEL ESTUDIANTE
const completarPerfilEstudiante = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);

        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }

        if (usuario.rol !== "estudiante") {
            return res.status(403).json({
                msg: "Acceso solo para estudiantes"
            });
        }

        const { telefono, institucion, nivelAcademico, direccion, fechaNacimiento } = req.body;

        if (!telefono || !institucion || !nivelAcademico) {
            return res.status(400).json({
                msg: "Todos los campos obligatorios deben completarse"
            });
        }

        const nivelesValidos = [ "1ro BGU", "2do BGU", "3ro BGU" ];

        if (!nivelesValidos.includes(nivelAcademico)) {
            return res.status(400).json({
                msg: "Nivel académico no válido"
            });
        }

        let estudiante = await Estudiante.findOne({ usuario: usuario._id });

        if (!estudiante) {
            estudiante = new Estudiante({ usuario: usuario._id });
        }

        estudiante.telefono = telefono;
        estudiante.institucion = institucion;
        estudiante.nivelAcademico = nivelAcademico;

        if (direccion !== undefined) {
            estudiante.direccion = direccion;
        }

        if (fechaNacimiento !== undefined) {
            estudiante.fechaNacimiento = fechaNacimiento;
        }

        await estudiante.save();

        usuario.perfilCompleto = true;

        await usuario.save();

        res.status(200).json({
            msg: "Perfil completado correctamente",
            perfilCompleto: true,
            estudiante
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al completar perfil"
        });
    }
};
// OBTENER PERFIL DEL ESTUDIANTE
const obtenerPerfilEstudiante = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);

        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }
        if (usuario.rol !== "estudiante") {
            return res.status(403).json({
                msg: "Acceso solo estudiantes"
            });
        }
        const estudiante = await Estudiante.findOne({ usuario: usuario._id })
        .populate(
            "usuario",
            "nombre apellido email rol perfilCompleto fotoPerfil"
        )
        .populate(
            "materiasPreferidas",
            "nombre descripcion"
        );
        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        res.status(200).json(estudiante);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener perfil"
        });
    }
};
// ACTUALIZAR PERFIL DEL ESTUDIANTE
const actualizarPerfilEstudiante = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }
        if (usuario.rol !== "estudiante") {
            return res.status(403).json({
                msg: "Acceso solo estudiantes"
            });
        }

        const estudiante = await Estudiante.findOne({ usuario: usuario._id });

        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        const { telefono, institucion, nivelAcademico, direccion, fechaNacimiento } = req.body;

        if (telefono !== undefined) {
            estudiante.telefono = telefono;
        }
        if (institucion !== undefined) {
            estudiante.institucion = institucion;
        }
        if (nivelAcademico !== undefined) {

            const nivelesValidos = [ "1ro BGU", "2do BGU", "3ro BGU"];

            if (!nivelesValidos.includes(nivelAcademico)) {
                return res.status(400).json({
                    msg: "Nivel académico no válido"
                });
            }
            estudiante.nivelAcademico = nivelAcademico;
        }
        if (direccion !== undefined) {
            estudiante.direccion = direccion;
        }
        if (fechaNacimiento !== undefined) {
            estudiante.fechaNacimiento = fechaNacimiento;
        }

        await estudiante.save();

        res.status(200).json({
            msg: "Perfil actualizado correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al actualizar perfil"
        });
    }
};
// OBTENER MATERIAS DEL ESTUDIANTE
const obtenerMateriasEstudiante = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }
        if (usuario.rol !== "estudiante") {
            return res.status(403).json({
                msg: "Acceso solo para estudiantes"
            });
        }
        if (!usuario.perfilCompleto) {
            return res.status(403).json({
                msg: "Debe completar su perfil primero",
                perfilIncompleto: true
            });
        }

        const estudiante = await Estudiante.findOne({
            usuario: usuario._id
        });
        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        const nivelAcademico = estudiante.nivelAcademico;

        const temas = await Tema.find({
            estado: true,
            nivelAcademico
        })
        .populate({
            path: "materia",
            match: { estado: true }
        });

        const temasValidos = temas.filter( (tema) => tema.materia !== null);

        const materiasIds = temasValidos.map( (tema) => tema.materia._id.toString() );

        const idsUnicos = [...new Set(materiasIds)];

        const materiasDB = await Materia.find({
            _id: { $in: idsUnicos },
            estado: true
        }).sort({ nombre: 1 });

        // AGREGAR esFavorita A CADA MATERIA
        const materias = materiasDB.map((materia) => {
            const esFavorita =
                estudiante.materiasPreferidas?.some(
                    (id) =>
                        id.toString() === materia._id.toString()
                ) || false;
            return {
                ...materia.toObject(),
                esFavorita
            };
        });

        const favoritas = materias.filter( (materia) => materia.esFavorita );

        const otras = materias.filter( (materia) => !materia.esFavorita);

        res.status(200).json({
            favoritas,
            otras
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener materias del estudiante"
        });
    }
};
// AGREGAR MATERIA FAVORITA
const agregarMateriaFavorita = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findById(req.usuario.id);

        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }

        const estudiante = await Estudiante.findOne({ usuario: usuario._id});

        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        const materia = await Materia.findById(id);

        if (!materia || !materia.estado) {
            return res.status(404).json({
                msg: "Materia no encontrada"
            });
        }

        const yaExiste = estudiante.materiasPreferidas?.some(
            (materiaId) =>
                materiaId.toString() === id
        );

        if (yaExiste) {
            return res.status(400).json({
                msg: "La materia ya está en favoritos"
            });
        }

        estudiante.materiasPreferidas.push(id);

        await estudiante.save();

        res.status(200).json({
            msg: "Materia agregada a favoritos"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al agregar favorito"
        });
    }
};
// QUITAR MATERIA FAVORITA
const quitarMateriaFavorita = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }

        const estudiante = await Estudiante.findOne({
            usuario: usuario._id
        });

        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        estudiante.materiasPreferidas =
            estudiante.materiasPreferidas.filter(
                (materiaId) =>
                    materiaId.toString() !== id
            );

        await estudiante.save();

        res.status(200).json({
            msg: "Materia eliminada de favoritos"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: "Error al eliminar favorito"
        });

    }
};
// OBTENER TEMAS POR MATERIA
const obtenerTemasPorMateria = async (req, res) => {
    try {

        const { materiaId } = req.params;

        const usuario = await Usuario.findById(req.usuario.id);

        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }

        if (usuario.rol !== "estudiante") {
            return res.status(403).json({
                msg: "Acceso solo estudiantes"
            });
        }

        const estudiante = await Estudiante.findOne({
            usuario: usuario._id
        });

        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        const materia = await Materia.findById(materiaId);

        if (!materia || !materia.estado) {
            return res.status(404).json({
                msg: "Materia no encontrada"
            });
        }

        const temasDB = await Tema.find({
            materia: materiaId,
            nivelAcademico: estudiante.nivelAcademico,
            estado: true
        })
        .populate("materia", "nombre")
        .sort({ nombre: 1 });

        const temas = temasDB.map((tema)=>{

            const esFavorito =
                estudiante.temasPreferidos?.some(
                    (id)=>
                        id.toString() === tema._id.toString()
                ) || false;

            return{
                ...tema.toObject(),
                esFavorito
            };

        });

        const favoritos = temas.filter(
            (tema)=> tema.esFavorito
        );

        const otros = temas.filter(
            (tema)=> !tema.esFavorito
        );

        res.status(200).json({
            favoritos,
            otros
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: "Error al obtener temas"
        });

    }
};
// OBTENER RECURSOS POR TEMA
const obtenerRecursosPorTema = async (req, res) => {
    try {

        const { temaId } = req.params;

        const usuario = await Usuario.findById(req.usuario.id);

        if (!usuario) {
            return res.status(404).json({
                msg: "Usuario no encontrado"
            });
        }

        if (usuario.rol !== "estudiante") {
            return res.status(403).json({
                msg: "Acceso solo estudiantes"
            });
        }

        const estudiante = await Estudiante.findOne({
            usuario: usuario._id
        });

        if (!estudiante) {
            return res.status(404).json({
                msg: "Perfil estudiante no encontrado"
            });
        }

        const tema = await Tema.findById(temaId)
        .populate("materia", "nombre");

        if (!tema || !tema.estado) {
            return res.status(404).json({
                msg: "Tema no encontrado"
            });
        }

        if (tema.nivelAcademico !== estudiante.nivelAcademico) {
            return res.status(403).json({
                msg: "Tema no disponible para su nivel"
            });
        }

        const recursos = await Recurso.find({
            tema: temaId,
            estado: true
        })
        .populate({
            path: "tema",
            populate: {
                path: "materia",
                select: "nombre"
            }
        })
        .sort({ createdAt: -1 });

        res.status(200).json(recursos);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: "Error al obtener recursos"
        });

    }
};
// OBTENER RESULTADOS
const obtenerResultadosEstudiante = async (req, res) => {
    try {

        const resultados = await Resultado.find({
            estudiante: req.usuario._id
        })
        .populate({
            path: "cuestionario",
            select: `titulo tipoEvaluacion nivel materia tema`,
            populate: [
                {
                    path: "materia",
                    select: "nombre"
                },
                {
                    path: "tema",
                    select: "nombre"
                }
            ]
        })
        .sort({ createdAt: -1 });

        res.status(200).json(resultados);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: "Error al obtener resultados"
        });

    }
};
// OBTENER RESULTADO POR ID
const obtenerResultadoEstudianteID = async (req, res) => {
    try {

        const { id } = req.params;

        const resultado = await Resultado.findById(id)
        .populate({
            path: "cuestionario",
            select: `
                titulo descripcion instrucciones
                tipoEvaluacion nivel materia tema
            `,
            populate: [
                {
                    path: "materia",
                    select: "nombre"
                },
                {
                    path: "tema",
                    select: "nombre"
                }
            ]
        })
        .populate({
            path: "respuesta.pregunta",
            select: `
                enunciado tipoPregunta
                opciones recursoApoyo
            `
        });

        if (!resultado) {
            return res.status(404).json({
                msg: "Resultado no encontrado"
            });
        }

        if (
            resultado.estudiante.toString() !==
            req.usuario._id.toString()
        ) {
            return res.status(403).json({
                msg: "No tiene permisos para ver este resultado"
            });
        }

        res.status(200).json(resultado);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: "Error al obtener resultado"
        });

    }
};
// AGREGAR TEMA FAVORITO
const agregarTemaFavorito = async(req,res)=>{
    try {

        const {id} = req.params;

        const usuario = await Usuario.findById(req.usuario.id);

        if(!usuario){
            return res.status(404).json({
                msg:"Usuario no encontrado"
            });  
        }

        const estudiante = await Estudiante.findOne({
            usuario:usuario._id
        });

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });
        }

        const tema = await Tema.findById(id);

        if(!tema || !tema.estado){
            return res.status(404).json({
                msg:"Tema no encontrado"
            });
        }

        // SOLUCIÓN
        if(!estudiante.temasPreferidos){
            estudiante.temasPreferidos = [];
        }

        const yaExiste = estudiante.temasPreferidos.some(
            (temaId)=> temaId.toString() === id
        );

        if(yaExiste){
            return res.status(400).json({
                msg:"El tema ya está en favoritos"
            });
        }

        estudiante.temasPreferidos.push(id);

        await estudiante.save();

        res.status(200).json({
            msg:"Tema agregado a favoritos"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg:"Error al agregar favorito"
        });

    }
};
// QUITAR TEMA FAVORITO
const quitarTemaFavorito = async(req,res)=>{
    try {

        const {id} = req.params;

        const usuario = await Usuario.findById(req.usuario.id);

        if(!usuario){
            return res.status(404).json({
                msg:"Usuario no encontrado"
            });
        }

        const estudiante = await Estudiante.findOne({
            usuario:usuario._id
        });

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });
        }

        // SOLUCIÓN
        if(!estudiante.temasPreferidos){
            estudiante.temasPreferidos = [];
        }

        estudiante.temasPreferidos =
            estudiante.temasPreferidos.filter(
                (temaId)=>
                    temaId.toString() !== id
            );

        await estudiante.save();

        res.status(200).json({
            msg:"Tema eliminado de favoritos"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg:"Error al eliminar favorito"
        });

    }
};
export { completarPerfilEstudiante, obtenerPerfilEstudiante, actualizarPerfilEstudiante, obtenerMateriasEstudiante,
         agregarMateriaFavorita, quitarMateriaFavorita, obtenerTemasPorMateria, obtenerRecursosPorTema, obtenerResultadosEstudiante,
         obtenerResultadoEstudianteID,  agregarTemaFavorito, quitarTemaFavorito
       };