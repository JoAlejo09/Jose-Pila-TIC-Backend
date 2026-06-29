import Unidad from "../models/Unidad.js";
import Materia from "../models/Materia.js";

const obtenerUnidades = async (req, res) => {
    try {

        const unidades = await Unidad.find()
            .populate("materia", "nombre")
            .sort({
                nivelAcademico: 1,
                orden: 1,
                createdAt: -1
            });

        res.status(200).json(unidades);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: "Error al obtener unidades"
        });
    }
};

const obtenerUnidadId = async (req, res) => {

    try {

        const { id } = req.params;

        const unidad = await Unidad.findById(id)
            .populate("materia", "nombre");

        if (!unidad) {

            return res.status(404).json({
                msg: "Unidad no encontrada"
            });
        }

        res.status(200).json(unidad);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: "Error al obtener la unidad"
        });
    }
};

const crearUnidad = async (req, res) => {

    try {

        const {
            nombre,
            descripcion,
            materia,
            nivelAcademico,
            orden
        } = req.body;

        // VALIDAR CAMPOS
        if (!nombre || !materia || !nivelAcademico) {

            return res.status(400).json({
                msg: "Todos los campos obligatorios deben completarse"
            });
        }

        // VALIDAR MATERIA
        const materiaExiste = await Materia.findById(materia);

        if (!materiaExiste) {

            return res.status(404).json({
                msg: "Materia no encontrada"
            });
        }

        // VALIDAR DUPLICADO
        const unidadExiste = await Unidad.findOne({
            nombre: {
                $regex: `^${nombre.trim()}$`,
                $options: "i"
            },
            materia,
            nivelAcademico
        });

        if (unidadExiste) {

            return res.status(400).json({
                msg: "La unidad ya existe en esta materia"
            });
        }

        // CREAR
        const unidad = new Unidad({
            nombre: nombre.trim(),
            descripcion: descripcion?.trim() || "",
            materia,
            nivelAcademico,
            orden: orden ?? 1
        });

        await unidad.save();

        await unidad.populate("materia", "nombre");

        res.status(201).json({
            msg: "Unidad creada correctamente",
            unidad
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: "Error al crear la unidad"
        });
    }
};

const actualizarUnidad = async (req, res) => {

    try {

        const { id } = req.params;

        const unidad = await Unidad.findById(id);

        if (!unidad) {

            return res.status(404).json({
                msg: "Unidad no encontrada"
            });
        }

        const camposPermitidos = [
            "nombre",
            "descripcion",
            "nivelAcademico",
            "orden",
            "estado"
        ];

        camposPermitidos.forEach((campo) => {

            if (req.body[campo] !== undefined) {

                unidad[campo] = req.body[campo];
            }
        });

        await unidad.save();

        await unidad.populate("materia", "nombre");

        res.status(200).json({
            msg: "Unidad actualizada correctamente",
            unidad
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: "Error al actualizar la unidad"
        });
    }
};

const cambiarEstadoUnidad = async (req, res) => {

    try {

        const { id } = req.params;

        const unidad = await Unidad.findById(id);

        if (!unidad) {

            return res.status(404).json({
                msg: "Unidad no encontrada"
            });
        }

        unidad.estado = !unidad.estado;

        await unidad.save();

        res.status(200).json({
            msg: `Unidad ${
                unidad.estado
                    ? "activada"
                    : "desactivada"
            } correctamente`,
            unidad
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: "Error al cambiar el estado de la unidad"
        });
    }
};

const obtenerUnidadesPorMateria = async(req,res)=>{
    try {
        const { materiaId } = req.params;
        const materia = await Materia.findById(materiaId);

        if (!materia || !materia.estado){
            return res.status(402).json({
                msg:"Materia no encontrada"
            })
        }
        const filtro = { materia: materiaId}
        if(req.query.estado){
            filtro.estado = req.query.estado === "true";
        }
        if(req.query.nivelAcademico){
            filtro.nivelAcademico = req.query.nivelAcademico;
        }

        const unidades = await Unidad.find(filtro)
        .sort({orden:1});

        return res.status(200).json(unidades);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener las unidades de la materia"
        });
    }
}

const obtenerUnidadesPorMateriaEstudiante = async(req,res)=>{
     try {
        const { materiaId } = req.params;
        const estudiante = await Estudiante.findOne({
            usuario:req.usuario.id
        });

        if(!estudiante){
            return res.status(404).json({
                msg:"Perfil estudiante no encontrado"
            });
        }

        const cuestionarioDiagnostico = await Cuestionario.findOne({
            materia:materiaId,
            tipoEvaluacion:"diagnostico",
            alcanceEvaluacion:"materia",
            nivelAcademico: estudiante.nivelAcademico,
            estado:true
        });

        // VALIDAR RESULTADO
        if(cuestionarioDiagnostico){
            const resultado = await Resultado.findOne({
                estudiante:estudiante._id,
                cuestionario:cuestionarioDiagnostico._id
            });

            if(!resultado){
                return res.status(403).json({
                    requiereDiagnostico:true,
                    cuestionarioId:cuestionarioDiagnostico._id,
                    msg:"Debe completar la evaluación diagnóstica"
                });
            }
        }

        const unidades = await Unidad.find({
            materia:materiaId,
            estado:true
        })
        .sort({
            orden:1
        });
        res.status(200).json(unidades);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Error al obtener unidades"
        });
    }
}

export {
    obtenerUnidades,
    obtenerUnidadId,
    obtenerUnidadesPorMateria,
    obtenerUnidadesPorMateriaEstudiante,
    crearUnidad,
    actualizarUnidad,
    cambiarEstadoUnidad
};