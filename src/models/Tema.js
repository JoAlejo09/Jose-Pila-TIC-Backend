import mongoose from "mongoose";

const temaSchema = new mongoose.Schema(
  {
    materia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Materia",
      required: true
    },
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      trim: true,
      default: ""
    },
    nivelAcademico: {
      type: String,
      enum: ["1ro BGU", "2do BGU", "3ro BGU"],
      required: true
    },
    estado: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
temaSchema.index(
  {
    materia: 1,
    nombre: 1,
    nivelAcademico: 1
  },
  {
    unique: true
  }
);
export default mongoose.model("Tema", temaSchema);