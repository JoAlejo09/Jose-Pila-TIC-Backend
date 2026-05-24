import mongoose from "mongoose";

const temaSchema = new mongoose.Schema(
  {
    unidad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unidad",
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
    orden:{
      type:Number,
      default:1
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
    unidad:1,
    nombre:1
  },
  {
    unique: true
  }
);
export default mongoose.model("Tema", temaSchema);