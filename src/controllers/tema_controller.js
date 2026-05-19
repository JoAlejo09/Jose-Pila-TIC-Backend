import Tema from "../models/Tema.js";
import Materia from "../models/Materia.js"

const obtenerTemas = async(req,res) =>{
    try {
        const temas = await Tema.find().populate("materia", "nombre")
                                .sort({createdAt:-1});

        res.status(200).json(temas);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener temas"
        });        
    }
}
const obtenerTemaID = async(req,res) =>{
    try {
        const {id} = req.params;
        const tema = await Tema.findById(id).populate("materia", "nombre");
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
        const { materia, nombre, descripcion, nivelAcademico } = req.body;

        // VALIDAR CAMPOS OBLIGATORIOS
        if( !materia || !nombre || !nivelAcademico){
            return res.status(400).json({
                msg:"Campos obligatorios"
            });
        }
        const nombreLimpio = nombre.trim();
        if(nombreLimpio.length < 3){
            return res.status(400).json({
                msg:"El nombre del tema debe tener mínimo 3 caracteres"
            });
        }
        const nivelesValidos = [ "1ro BGU", "2do BGU", "3ro BGU" ];
        if(!nivelesValidos.includes(nivelAcademico)){
            return res.status(400).json({
                msg:"Nivel académico no válido"
            });
        }

        const materiaExiste = await Materia.findById(materia);
        if(!materiaExiste){
            return res.status(404).json({
                msg:"La materia no existe"
            });
        }
        if(!materiaExiste.estado){
            return res.status(400).json({
                msg:"No se pueden crear temas en materias inactivas"
            });
        }
        const temaExiste = await Tema.findOne({
            materia,
            nombre: {
                $regex: new RegExp(
                    `^${nombreLimpio}$`,
                    "i"
                )
            },
            nivelAcademico
        });
        if(temaExiste){
            return res.status(400).json({
                msg:"El tema ya existe para esta materia y nivel académico"
            });
        }
        const nuevoTema = new Tema({
            materia,
            nombre: nombreLimpio,
            descripcion: descripcion?.trim() || "",
            nivelAcademico
        });
        await nuevoTema.save();

        const temaGuardado = await Tema.findById(nuevoTema._id).populate("materia","nombre");
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
        const { materia, nombre, descripcion, nivelAcademico, estado } = req.body;
        // BUSCAR TEMA
        const tema = await Tema.findById(id);
        if(!tema){
            return res.status(404).json({
                msg:"Tema no encontrado"
            });
        }
        // VALIDAR MATERIA
        if(materia){
            const materiaExiste = await Materia.findById(materia);
            if(!materiaExiste){
                return res.status(404).json({
                    msg:"La materia no existe"
                });
            }
            if(!materiaExiste.estado){
                return res.status(400).json({
                    msg:"La materia está inactiva"
                });
            }
            tema.materia = materia;
        }

        // VALIDAR NOMBRE
        if(nombre){
            const nombreLimpio = nombre.trim();
            if(nombreLimpio.length < 3){
                return res.status(400).json({
                    msg:"El nombre debe tener mínimo 3 caracteres"
                });
            }

            // VALIDAR DUPLICADO
            const temaExiste = await Tema.findOne({
                materia: materia || tema.materia,
                nivelAcademico: nivelAcademico || tema.nivelAcademico,
                nombre:{
                    $regex:new RegExp(
                        `^${nombreLimpio}$`,
                        "i"
                    )
                },
                _id:{ $ne:id }
            });

            if(temaExiste){
                return res.status(400).json({
                    msg:"Ya existe un tema con esos datos"
                });
            }
            tema.nombre = nombreLimpio;
        }
        // VALIDAR NIVEL
        if(nivelAcademico){
            const nivelesValidos = ["1ro BGU", "2do BGU", "3ro BGU" ];

            if(!nivelesValidos.includes(nivelAcademico)){
                return res.status(400).json({
                    msg:"Nivel académico no válido"
                });
            }
            tema.nivelAcademico = nivelAcademico;
        }
        if(descripcion !== undefined){
            tema.descripcion = descripcion.trim();}

        if(estado !== undefined){ tema.estado = estado;}
        await tema.save();
        // RESPUESTA POPULATE
        const temaActualizado = await Tema.findById(tema._id).populate("materia","nombre");
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
        const temaActualizado = await Tema.findById(tema._id).populate("materia", "nombre");
        res.status(200).json({
            msg:`Tema ${
                tema.estado
                ? "activado"
                : "desactivado"
            } correctamente`,
            tema: temaActualizado
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al cambiar estado del tema."
        });
    }
}
const obtenerTemasPorMateriaNivel = async(req, res)=>{
    try {
        const { materiaId, nivelAcademico}= req.params;
        const temas = await Tema.find({
            materia:materiaId,
            nivelAcademico,
            estado:true
        }).sort({nombre:1});

        res.status(200).json(temas);
    } catch (error) {
        console.log(error)
        res.status(400).json({
            msg:"Error al obtener temas"
        })
    }
}
const obtenerTemasPorMateria = async(req,res)=>{
    try {

        const { materiaId } = req.params;

        const temas = await Tema.find({
            materia: materiaId,
            estado:true
        })
        .sort({ nombre:1 });

        res.status(200).json(temas);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg:"Error al obtener temas"
        });

    }
};
export {obtenerTemas, obtenerTemaID, crearTema, actualizarTema, cambiarEstadoTema,
        obtenerTemasPorMateriaNivel, obtenerTemasPorMateria

}