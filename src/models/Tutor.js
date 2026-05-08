import mongoose from "mongoose";

const tutorSchema =
  new mongoose.Schema({
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true
    },
    telefono: {
      type: String
    },

    especialidad: {
      type: String
    },

    descripcion: {
      type: String
    },

    experiencia: {
      type: String
    },

    titulacion: {
      type: String
    },

    fotoPerfil: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "Tutor",
  tutorSchema
);