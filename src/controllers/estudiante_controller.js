import Usuario from "../models/Usuario.js";
import Estudiante from "../models/Estudiante.js";
import Tema from "../models/Tema.js";
import Materia from "../models/Materia.js";
import Recurso from "../models/Recurso.js";
import Resultado from "../models/Resultado.js";
import Unidad from "../models/Unidad.js";

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

        const usuario = await Usuario.findById(
            req.usuario.id
        );

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

        // OBTENER SOLO MATERIAS DEL NIVEL

        const materiasDB = await Materia.find({

            estado: true,

            nivelAcademico:
                estudiante.nivelAcademico

        }).sort({ nombre: 1 });

        // AGREGAR FAVORITAS

        const materias = materiasDB.map(
            (materia) => {

                const esFavorita =
                    estudiante.materiasPreferidas?.some(

                        (id) =>

                            id.toString() ===
                            materia._id.toString()

                    ) || false;

                return {

                    ...materia.toObject(),

                    esFavorita
                };
            }
        );

        const favoritas = materias.filter(
            (materia) => materia.esFavorita
        );

        const otras = materias.filter(
            (materia) => !materia.esFavorita
        );

        return res.status(200).json({

            favoritas,
            otras
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            msg: "Error al obtener materias"
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
        // OBTENER UNIDADES DE LA MATERIA
        const unidades = await Unidad.find({ 
            materia: materiaId, estado: true });
            
        const unidadesIds = unidades.map( (unidad)=> unidad._id );

        // OBTENER TEMAS
        const temasDB = await Tema.find({
            unidad: { $in: unidadesIds },
            nivelAcademico: estudiante.nivelAcademico, 
            estado: true
        })  
        .populate({
            path:"unidad",
            populate:{
                path:"materia",
                select:"nombre"
            }
        })
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
const obtenerTemasPorUnidad = async(req,res)=>{
    try {
        const { unidadId } = req.params;

        const usuario = await Usuario.findById(req.usuario.id);

        if(!usuario){
            return res.status(404).json({
                msg:"Usuario no encontrado"
            });
        }

        const estudiante = await Estudiante.findOne({
            usuario: usuario._id
        });

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });

        }
        const unidad = await Unidad.findById(unidadId);

        if(!unidad || !unidad.estado){
            return res.status(404).json({
                msg:"Unidad no encontrada"
            });
        }

        const temasDB = await Tema.find({
            unidad: unidadId,
            nivelAcademico:
                estudiante.nivelAcademico,

            estado:true

        })
        .sort({
            nombre:1
        });

        const temas = temasDB.map((tema)=>{
            const esFavorito = estudiante.temasPreferidos?.some(
                (id)=>
                    id.toString() === tema._id.toString()
            ) || false;

            return{
                ...tema.toObject(),
                esFavorito
            };
        });
        res.status(200).json({
            favoritos: temas.filter((t)=>t.esFavorito),
            otros: temas.filter((t)=>!t.esFavorito)
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener temas"
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
        .populate({
            path:"unidad",
            populate:{
                path:"materia",
                select:"nombre nivelAcademico"
            }
        })

        if (!tema || !tema.estado) {
            return res.status(404).json({
                msg: "Tema no encontrado"
            });
        }
        const nivelMateria = tema.unidad?.materia?.nivelAcademico;

        if (nivelMateria !== estudiante.nivelAcademico) {
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
                path:"unidad",
                populate:{
                    path: "materia",
                    select: "nombre"
                }
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
//OBTENER UN RECURSO DE UN TEMA
const obtenerRecursoPorId = async(req,res)=>{
    try {
        const {id} = req.params;

        const usuario = await Usuario.findById(req.usuario.id);

        if(!usuario){
            return res.status(404).json({
                msg: "Usuario no encontrado"
            })
        }

        if(usuario.rol !== "estudiante"){
            return res.status(403).json({
                msg: "Acceso solo estudiantes"
            });
        }
        const estudiante = await Estudiante.findOne({
            usuario:usuario._id
        });

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil de estudiante no encontrado"
            });
        }
        const recurso = await Recurso.findById(id)
                        .populate({
                            path:"tema",
                            populate:{
                                path:"unidad",
                                populate:{
                                    path:"materia",
                                    select:"nombre nivelAcademico"
                                }
                            }
                        })

         if(!recurso || !recurso.estado){
            return res.status(404).json({
                msg:"Recurso no encontrado"
            });
        }
        // VALIDAR NIVEL ACADÉMICO
        if(recurso.tema.unidad.nivelAcademico !== estudiante.nivelAcademico){
              return res.status(403).json({
                msg:"Recurso no disponible para su nivel"
            });
        }
        res.status(200).json(recurso);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener recurso"
        });        
    }
}
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
         agregarMateriaFavorita, quitarMateriaFavorita, obtenerTemasPorMateria,obtenerTemasPorUnidad, 
         obtenerRecursosPorTema,  agregarTemaFavorito, quitarTemaFavorito, obtenerRecursoPorId
       };