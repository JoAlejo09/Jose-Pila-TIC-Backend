import mongoose from "mongoose";

const tutorSchema =
  new mongoose.Schema(
    {
      usuario: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true,
        unique: true
      },
      telefono: {
        type: String,
        trim: true,
        default: ""
      },
      especialidad: {
        type: String,
        trim: true,
        default: ""
      },
      descripcion: {
        type: String,
        trim: true,
        default: ""
      },
      experiencia: {
        type: String,
        trim: true,
        default: ""
      },
      titulacion: {
        type: String,
        trim: true,
        default: ""
      },
      fotoPerfil: {
        type: String,
        default: ""
      }
    },
    {
      timestamps: true
    }
  );

export default mongoose.model("Tutor",tutorSchema);