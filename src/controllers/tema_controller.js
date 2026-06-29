import Tema from "../models/Tema.js";
import Unidad from "../models/Unidad.js"

const obtenerTemas = async(req,res) =>{
    try {
        const temas = await Tema.find()
        .populate({
            path:"unidad",
            populate:{
                path:"materia",
                select:"nombre"
            }
        })
        .sort({orden:1, createdAt:-1});

        res.status(200).json(temas);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener temas"
        });        
    }
}
const obtenerTemaId = async(req,res) =>{
    try {
        const {id} = req.params;

        const tema = await Tema.findById(id)
        .populate({
            path:"unidad",
            populate:{
                path:"materia",
                select:"nombre"
            }
        });

        if(!tema){
            return res.status(404).json({
                msg:"Tema no encontrado"
            })
        }
        res.status(200).json(tema);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener el tema"
        })
    };
}
const crearTema = async(req,res)=>{
    try {
        const { unidad, nombre, descripcion, orden } = req.body;


        if( !unidad || !nombre ){
            return res.status(400).json({
                msg:"Campos obligatorios"
            });
        }
        
        const unidadExiste = await Unidad.findById(unidad);
        if(!unidadExiste){
            return res.status(404).json({
                msg:"Unidad no encontrada"
            })
        }

        const nombreLimpio = nombre.trim();
        if(nombreLimpio.length < 3){
            return res.status(400).json({
                msg:"El nombre del tema debe tener mínimo 3 caracteres"
            });
        }
        const temaExiste = await Tema.findOne({
            unidad,
            nombre:{
                $regex:`^${nombreLimpio}$`,
                $options:"i"
            }
        });

        if(temaExiste){
            return res.status(400).json({
                msg:"El tema ya existe en esta unidad"
            });
        }
        const nuevoTema = new Tema({
            unidad,
            nombre: nombreLimpio,
            descripcion: descripcion?.trim() || "",
            orden: orden || 1
        });
        await nuevoTema.save();

        const temaGuardado = await Tema.findById(nuevoTema._id)
                            .populate({
                                path:"unidad",
                                populate:{
                                    path:"materia",
                                    select:"nombre"
                                }
                            })   

        res.status(201).json({
            msg:"Tema creado correctamente",
            tema: temaGuardado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al crear tema"
        });
    }
}
const actualizarTema = async(req,res)=>{
    try {

        const {id} = req.params;
        // BUSCAR TEMA
        const tema = await Tema.findById(id);

        if(!tema){
            return res.status(404).json({
                msg:"Tema no encontrado"
            });
        }

        const camposPermitidos = [ "nombre", "descripcion","orden", "estado"]

        camposPermitidos.forEach((campo)=>{

            if(req.body[campo] !== undefined){

                tema[campo] = req.body[campo];

            }

        });
        await tema.save();
        const temaActualizado = await Tema.findById(tema._id)
            .populate({
                path:"unidad",
                populate: {
                    path:"materia",
                    select:"nombre"
                }
            });
        res.status(200).json({
            msg:"Tema actualizado correctamente",
            tema: temaActualizado
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al actualizar tema"
        });
    }
}
const cambiarEstadoTema = async(req,res)=>{
    try {
        const {id}=req.params;
        const tema = await Tema.findById(id);

        if(!tema){
            return res.status(404).json({
                msg:"Tema no encontrado."
            });
        }
        tema.estado = !tema.estado;

        await tema.save();

        res.status(200).json({
            msg:`Tema ${
                tema.estado
                ? "activado"
                : "desactivado"
            } correctamente`,
            tema
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al cambiar estado del tema."
        });
    }
}
const obtenerTemasPorUnidad = async(req, res) => {
    try {
        const { unidadId } = req.params;
        const unidad = await Unidad.findById(unidadId);
        if (!unidad || !unidad.estado){
            return res.status(404).json({
                msg:"Unidad no encontrada"
            })
        }
        const filtro = {unidad:unidadId}
        if(req.query.estado){
            filtro.estado = req.query.estado === "true";
        }
        if(req.query.nivelAcademico){
            filtro.nivelAcademico = req.query.nivelAcademico;
        }
        const temas = await Tema.find(filtro)
            .populate("unidad", "nombre nivelAcademico")
            .sort({ orden: 1 });

        return res.status(200).json(temas);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener temas"
        });
    }
};

export { obtenerTemas, obtenerTemaId, crearTema, actualizarTema, cambiarEstadoTema, obtenerTemasPorUnidad
};