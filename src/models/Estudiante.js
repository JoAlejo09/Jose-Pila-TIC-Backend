import mongoose from "mongoose";

const estudianteSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true
    },

    fechaNacimiento: {
      type: Date
    },

    telefono: {
      type: String,
      trim: true,
      default: ""
    },

    direccion: {
      type: String,
      trim: true,
      default: ""
    },

    institucion: {
      type: String,
      trim: true,
      default: ""
    },
    nivelAcademico: {
      type: String,
      enum: ["1ro BGU", "2do BGU", "3ro BGU"],
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

export default mongoose.model("Estudiante", estudianteSchema);