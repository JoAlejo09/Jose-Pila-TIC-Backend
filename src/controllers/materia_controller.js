import Materia from "../models/Materia.js";
import Tema from "../models/Tema.js";
import Unidad from "../models/Unidad.js"
import mongoose from "mongoose";

//Obtener Materias para administrador
const obtenerMaterias = async (req, res) => {
    try {
        const filtro = {};
        const nivelesValidos = [ "1ro BGU", "2do BGU", "3ro BGU" ];
        if(!nivelesValidos.includes(req.query.nivelAcademico) && req.query.nivelAcademico !== undefined){
            return res.status(400).json({
                msg:"Nivel academico invalido"
            });
        }
        if (req.query.nivelAcademico ) {
            filtro.nivelAcademico = req.query.nivelAcademico;
        }

        if (req.query.estado ) {
            filtro.estado = req.query.estado === "true";
        }

        // OBTENER MATERIAS
        const materias = await Materia.find(filtro)
            .select("-__v")
            .sort({nombre: 1});

        // Contar cuantas unidades tiene cada materia
        const materiasConUnidades = await Promise.all(
            materias.map(async (materia) => {
                const totalUnidades = await Unidad.countDocuments({
                    materia: materia._id,
                    estado: true
                });
                return {
                    ...materia.toObject(),
                    totalUnidades
                };
            })
        );

        return res.status(200).json(
            materiasConUnidades
        );

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error al obtener materias"
        });
    }

};
//Obtener una Materia especifica 
const obtenerMateriaID = async(req,res)=>{
    try {
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                msg:"ID de materia invalido"
            });
        }
        const materia = await Materia.findById(id)
            .select("-__v");

        if(!materia){
            return res.status(404).json({
                msg:"Materia no encontrada"
            });
        }
        return res.status(200).json(materia);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Error del servidor al obtener materia"
        });
    }
}
//CRUD Materias
const crearMateria = async(req,res)=>{
    try {
        const { nombre, descripcion, nivelAcademico} = req.body;

        if(!nombre || !nivelAcademico){
            return res.status(400).json({
                msg:"El nombre de la materia y el grado escolar es obligatorio"
            });
        }

        const nivelesValidos = ["1ro BGU", "2do BGU", "3ro BGU"]
        if(!nivelesValidos.includes(nivelAcademico)){
            return res.status(400).json({
                msg:"Nivel academico invalido"
            });
        }
        const nombreLimpio = nombre.trim();
        if(nombreLimpio.length <3 || nombreLimpio.length > 80){
            return res.status(400).json({
                msg: "El nombre de la materia debe tener entre 3 y 80 caracteres"
            })
        }
        if (descripcion && descripcion.trim().length > 500) {
            return res.status(400).json({
                msg: "La descripción no debe superar 500 caracteres"
            });
        }
        const materiaExiste = await Materia.findOne({
            nombre:{
                $regex:`^${nombreLimpio}$`,
                $options:"i"
            },
            nivelAcademico
        });
        if(materiaExiste){
            return res.status(400).json({
                msg:"La materia ya existe para este año escolar."
            });
        }

        const nuevaMateria = new Materia({
            nombre: nombre.trim(),
            descripcion,
            nivelAcademico
        });

        await nuevaMateria.save();

       return res.status(201).json({
            msg: "Materia creada correctamente",
            materia: nuevaMateria
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al crear materia"
        });
    }
};
const actualizarMateria = async (req, res)=>{
    try{
        const {id} = req.params;
        const { nombre, descripcion, nivelAcademico, estado } = req.body;

        const materia = await Materia.findById(id);

        if(!materia){
            return res.status(404).json({
                msg: "Materia no encontrada"
            });
        }

        if(nombre || nivelAcademico){
            const nombreFinal = nombre?.trim() || materia.nombre;
            const nivelFinal = nivelAcademico || materia.nivelAcademico;

            const materiaExiste = await Materia.findOne({
                nombre:{
                    $regex:`^${nombreFinal}$`,
                    $options:"i"
                },
                nivelAcademico: nivelFinal,
                _id:{ $ne:id }
            });

            if(materiaExiste){
                return res.status(400).json({
                    msg: "Ya existe una materia con ese nombre y en ese año escolar"
                });
            }
        }
        if( nombre &&
            (nombre.trim().length < 3 || nombre.trim().length > 80)
        ){
            return res.status(400).json({
                msg:"El nombre debe tener entre 3 y 80 caracteres"
            });
        }

        if(descripcion && descripcion.trim().length > 500){
            return res.status(400).json({
                msg:"La descripción no puede superar los 500 caracteres"
            });
        }

        const nivelesValidos = ["1ro BGU", "2do BGU", "3ro BGU"];
        if( nivelAcademico && !nivelesValidos.includes(nivelAcademico)){
            return res.status(400).json({
                msg:"Nivel académico inválido"
            });
        }

        if(nombre !== undefined){ materia.nombre = nombre.trim()}
        if(descripcion !== undefined){ materia.descripcion = descripcion?.trim(); }
        if(nivelAcademico !== undefined){ materia.nivelAcademico  = nivelAcademico}
        if(estado !== undefined){ materia.estado = estado; }

        await materia.save();
        
        return res.status(200).json({
            msg: "Materia actualizada correctamente",
            materia
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            msg:"Error al actualizar materia"
        });
    }
};
//Dar de baja una Materia cambiando el estado (activo, desactivado)
const cambiarEstadoMateria = async(req,res) =>{
    try {
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                msg: "ID de Materia inválido"
            });
        }

        const materia = await Materia.findById(id);
        if(!materia){
            return res.status(404).json({
                msg:"Materia no encontrada"
            });
        }
        materia.estado = !materia.estado;
        await materia.save();
        return res.status(200).json({
            msg:`Materia ${
                materia.estado
                    ? "activada"
                    : "desactivada"
            } correctamente.`,
            materia
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Error al actualizar el estado de la materia"
        });
    }
}
export { obtenerMaterias, crearMateria, actualizarMateria, obtenerMateriaID,
        cambiarEstadoMateria
 };