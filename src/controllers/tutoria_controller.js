import Tutoria from "../models/Tutoria.js";
import Usuario from "../models/Usuario.js";
import Estudiante from "../models/Estudiante.js";

//Para crear una solicitud de tutoria.
const crearTutoria = async(req, res)=>{
    try{
        const {materia, tema, descripcion, modalidad, fecha, duracion} = req.body;

        if(!materia || !tema || !modalidad || !fecha || !duracion){
            return res.status(400).json({
                msg:"Campos obligatorios"
            });
        }
        const perfilEstudiante = await Estudiante.findOne({
            usuario:req.usuario.id
        })

        if(modalidad === "presencial" && !perfilEstudiante?.direccion){
            return res.status(400).json({
                msg:"La dirección es obligatoria para modalidad presencial"
            });
        }
        const nuevaTutoria = new Tutoria({
            estudiante: req.usuario.id,
            materia,
            tema,
            descripcion,
            modalidad,
            direccion: modalidad ==="presencial"
                    ? perfilEstudiante.direccion
                    : "",
            fecha,
            duracion
        });
        await nuevaTutoria.save();
        return res.status(201).json({
            msg:"Solicitud de tutoría creada exitosamente",
            tutoria: nuevaTutoria
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            msg:"Error al crear solicitud de tutoría"
        });
    }
}
//Para que el estudiante pueda ver sus tutorias y solicitudes
const obtenerMisTutorias = async(req,res)=>{
    try{
        const tutorias = await Tutoria.find({
            estudiante: req.usuario.id
        })        
        .populate("tutor","nombre apellido email fotoPerfil")
        .sort({createdAt:-1});

        return res.status(200).json(tutorias);
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            msg:"Error al obtener sus tutorías"
        });
    }
}
//Obtener solicitudes pendientes para todos los tutores
const  obtenerTutoriasPendientes = async(req,res)=>{
    try{
        const tutorias = await Tutoria.find({
            estado:"pendiente"
        })
        .populate("estudiante","nombre apellido email fotoPerfil")
        .sort({createdAt:-1});

        return res.status(200).json(tutorias);
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            msg:"Error al obtener solicitudes"
        });
    }
}
//Para que el tutor pueda aceptar una solicitud de tutoria
const aceptarTutoria = async(req,res)=>{
    try{
        const {id} = req.params;
        const tutoria = await Tutoria.findById(id);
        if(!tutoria){
            return res.status(404).json({
                msg:"Solicitud de tutoría no encontrada"
            });
        }
        if(tutoria.estado !== "pendiente" || tutoria.tutor){
            return res.status(400).json({
                msg:"Esta solicitud ya ha sido aceptada por otro tutor"
            });
        }
        tutoria.tutor = req.usuario.id;
        tutoria.estado = "aceptada";
        await tutoria.save();

        return res.status(200).json({
            msg:"Solicitud de tutoría aceptada exitosamente",
            tutoria
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            msg:"Error al aceptar solicitud de tutoría"
        });
    }
}
//Para editar una solicitud de tutoria
const editarTutoria = async (req, res) => {

    try {
        const { id } = req.params;
        const tutoria = await Tutoria.findById(id);

        if (!tutoria) {
            return res.status(404).json({
                msg: "Tutoría no encontrada"
            });
        }

        if ( tutoria.estudiante.toString() !== req.usuario.id ) {
            return res.status(403).json({
                msg: "No autorizado"
            });

        }

        if (tutoria.estado !== "pendiente") {
            return res.status(400).json({
                msg: "Solo se pueden editar tutorías pendientes"
            });
        }

        const { materia, tema, descripcion, modalidad, fecha, duracion } = req.body;

        // ACTUALIZAR CAMPOS
        if (materia !== undefined && materia !== "") {
            tutoria.materia = materia;
        }

        if (tema !== undefined && tema !== "") {
            tutoria.tema = tema;
        }

        if (descripcion !== undefined) {
            tutoria.descripcion = descripcion;
        }

        if (modalidad !== undefined && modalidad !== "") {
            tutoria.modalidad = modalidad;
        }

        if (fecha !== undefined && fecha !== "") {
            tutoria.fecha = fecha;
        }

        if (duracion !== undefined && duracion !== "") {
            tutoria.duracion = duracion;
        }

        await tutoria.save();

        return res.status(200).json({
            msg: "Tutoría actualizada correctamente"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error al editar tutoría"
        });
    }

};
//En caso de que el tutor no pueda se libera la tutoria para otro tutor
const liberarTutoria = async(req,res)=>{
    try {
        const {id} = req.params;
        const tutoria = await Tutoria.findById(id);
        if(!tutoria){
            return res.status(404).json({
                msg:"Tutoria no encontrada"
            })
        }
        if(!tutoria.tutor || tutoria.tutor.toString() !== req.usuario.id)
        {
            return res.status(403).json({
                msg:"No autorizado"
            })
        }
        if(tutoria.estado !== "aceptada"){
             return res.status(400).json({
                msg:"La tutoría no puede liberarse"
            });
        }
        tutoria.estado = "pendiente"
        tutoria.tutor = null;
        await tutoria.save();

        res.status(200).json({
            msg:"Tutoria liberada correctamente"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al liberar tutoria"
        });
    }
};

//Para cuando el estudiante decida cancelar la tutoria
const cancelarTutoria = async (req, res) => {
    try {
        const { id } = req.params;

        const tutoria = await Tutoria.findById(id);

        if (!tutoria) {
            return res.status(404).json({
                msg:"Tutoría no encontrada"
            });
        }

        if ( tutoria.estudiante.toString() !== req.usuario.id) {
            return res.status(403).json({
                msg:"No autorizado"
            });
        }

        if ( tutoria.estado === "realizada" ) {
            return res.status(400).json({
                msg:"No se puede cancelar"
            });

        }

        tutoria.estado = "cancelada";

        await tutoria.save();

        res.status(200).json({
            msg:"Tutoría cancelada"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al cancelar tutoría"
        });
    }
};

//Para que el tutor pueda ver sus tutorias
const obtenerTutoriasTutor = async (req, res) => {
    try {
        const tutorias = await Tutoria.find({ tutor:req.usuario.id })
        .populate(
            "estudiante",
            "nombre apellido email fotoPerfil"
        )
        .sort({ createdAt:-1});
        res.status(200).json(tutorias);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener tutorías"
        });
    }
};

//Para finalizar una tutoria solo de parte del tutor
const finalizarTutoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { observacionTutor } = req.body || {};

        const tutoria = await Tutoria.findById(id);

        if (!tutoria) {
            return res.status(404).json({
                msg:"Tutoría no encontrada"
            });
        }

        if ( !tutoria.tutor || tutoria.tutor.toString() !== req.usuario.id
        ) {
            return res.status(403).json({
                msg:"No autorizado"
            });

        }

        tutoria.estado = "realizada";

        tutoria.observacionTutor = observacionTutor || "";

        await tutoria.save();

        res.status(200).json({ msg:"Tutoría finalizada" });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al finalizar tutoría"
        });

    }

};

//Para calificar una tutoria una vez finalizada de parte del estudiante
const calificarTutoria = async (req, res) => {

    try {
        const { id } = req.params;
        const { calificacion, comentarioCalificacion } = req.body;

        const tutoria = await Tutoria.findById(id);

        if (!tutoria) {
            return res.status(404).json({
                msg:"Tutoría no encontrada"
            });
       }

        if ( tutoria.estudiante.toString() !== req.usuario.id) {
            return res.status(403).json({
                msg:"No autorizado"
            });
        }

        if (tutoria.estado !== "realizada") {
            return res.status(400).json({
                msg:"La tutoría aún no finaliza"
            });
        }

        if(tutoria.calificacion !== null){
            return res.status(400).json({
                msg:"La tutoria ya fue calificada"
            });
        }
        tutoria.calificacion = calificacion;

        tutoria.comentarioCalificacion = comentarioCalificacion || "";

        await tutoria.save();

        return res.status(200).json({
            msg:"Tutoría calificada"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Error al calificar tutoría"
        });

    }

};

//Para administrador pueda ver todas las tutorias de todos los usuarios (tutor y estudiante)
const obtenerTodasTutorias = async (req, res) => {

    try {
        const tutorias = await Tutoria.find()
        .populate(
            "estudiante",
            "nombre apellido email"
        )
        .populate(
            "tutor",
            "nombre apellido email"
        )
        .sort({
            createdAt:-1
        });
        return res.status(200).json(tutorias);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Error al obtener tutorías"
        });
    }
};

//Cancelar tutoria administrador
const cancelarTutoriaAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const tutoria = await Tutoria.findById(id);

        if (!tutoria) {
            return res.status(404).json({
                msg:"Tutoría no encontrada"
            });

        }
        tutoria.estado = "cancelada";
        await tutoria.save();
        return res.status(200).json({
            msg:"Tutoría cancelada por administrador"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Error al cancelar tutoría"
        });
    }
};

export{crearTutoria, obtenerMisTutorias, obtenerTutoriasPendientes,
aceptarTutoria, editarTutoria,liberarTutoria, cancelarTutoria, obtenerTutoriasTutor,
finalizarTutoria, calificarTutoria, obtenerTodasTutorias, cancelarTutoriaAdmin
}
