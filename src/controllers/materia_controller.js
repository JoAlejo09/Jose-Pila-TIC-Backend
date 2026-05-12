import Materia from "../models/Materia.js";
import Tema from "../models/Tema.js";

const obtenerMaterias = async(req, res)=>{
    try {
        const materias = await Materia.find().sort({ createdAt: -1 });
        res.status(200).json(materias);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener materias"
        });
    }
};
const obtenerMateriaID = async(req,res)=>{
    try {
        const {id} = req.params;
        const materia = await Materia.findById(id);
        if(!materia){
            return res.status(404).json({
                msg:"Materia no encontrada"
            });
        }
        res.status(200).json(materia);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener materia"
        });
    }
}
const crearMateria = async(req,res)=>{
    try {
        const { nombre, descripcion } = req.body;

        if(!nombre){
            return res.status(400).json({
                msg:"El nombre de la materia es obligatorio"
            });
        }
        // VALIDAR DUPLICADOS
        const materiaExiste = await Materia.findOne({
            nombre:{
                $regex:`^${nombre.trim()}$`,
                $options:"i"
            }
        });
        if(materiaExiste){
            return res.status(400).json({
                msg:"La materia ya existe."
            });
        }
        const nuevaMateria = new Materia({
            nombre: nombre.trim(),
            descripcion
        });
        await nuevaMateria.save();
        res.status(201).json({
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
        const { nombre, descripcion, estado } = req.body;
        const materia = await Materia.findById(id);
        if(!materia){
            return res.status(404).json({
                msg: "Materia no encontrada"
            });
        }

        if(nombre){
            const materiaExiste = await Materia.findOne({
                nombre:{
                    $regex:`^${nombre.trim()}$`,
                    $options:"i"
                },
                _id:{ $ne:id }
            });
            if(materiaExiste){
                return res.status(400).json({
                    msg: "Ya existe una materia con ese nombre"
                });
            }
            materia.nombre = nombre.trim();
        }

        if(descripcion !== undefined){
            materia.descripcion = descripcion;
        }

        if(estado !== undefined){
            materia.estado = estado;
        }
        await materia.save();
        res.status(200).json({
            msg: "Materia actualizada correctamente",
            materia
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            msg:"Error al actualizar materia"
        });
    }
};
const cambiarEstadoMateria = async(req,res) =>{
    try {
        const {id} = req.params;
        const materia = await Materia.findById(id);
        if(!materia){
            return res.status(404).json({
                msg:"Materia no encontrada"
            });
        }
        materia.estado = !materia.estado;
        await materia.save();
        res.status(200).json({
            msg:`Materia ${
                materia.estado
                    ? "activada"
                    : "desactivada"
            } correctamente`,
            materia
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al actualizar el estado de la materia"
        });
    }
}
export { obtenerMaterias, crearMateria, actualizarMateria, obtenerMateriaID,
        cambiarEstadoMateria
 };