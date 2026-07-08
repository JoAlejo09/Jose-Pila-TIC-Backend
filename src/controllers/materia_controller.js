import Materia from "../models/Materia.js";
import Tema from "../models/Tema.js";
import Unidad from "../models/Unidad.js"

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

        res.status(200).json(
            materiasConUnidades
        );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al obtener materias"
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

        const materiaExiste = await Materia.findOne({
            nombre:{
                $regex:`^${nombre.trim()}$`,
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
        const { nombre, descripcion, nivelAcademico, estado } = req.body;

        const materia = await Materia.findById(id);

        if(!materia){
            return res.status(404).json({
                msg: "Materia no encontrada"
            });
        }

        if(nombre || nivelAcademico){
            const materiaExiste = await Materia.findOne({
                nombre:{
                    $regex:`^${(nombre|| materia.nombre).trim()}$`,
                    $options:"i"
                },
                nivelAcademico: nivelAcademico || materia.nivelAcademico,
                _id:{ $ne:id }
            });
            if(materiaExiste){
                return res.status(400).json({
                    msg: "Ya existe una materia con ese nombre y en ese año escolar"
                });
            }
        if(nombre !== undefined){ materia.nombre = nombre.trim()}
        }

        if(nombre !== undefined){ materia.nombre = nombre.trim()}
        if(descripcion !== undefined){ materia.descripcion = descripcion; }
        if(nivelAcademico !== undefined){ materia.nivelAcademico  = nivelAcademico}
        if(estado !== undefined){ materia.estado = estado; }

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