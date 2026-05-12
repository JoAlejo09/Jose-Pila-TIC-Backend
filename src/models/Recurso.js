import mongoose from "mongoose";

const recursoSchema = new mongoose.Schema({
    tema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tema",
      required: true
    },
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      trim: true,
      default: ""
    },
    tipo: {
      type: String,
      enum: ["pdf", "youtube", "teoria"],
      required: true
    },

    // Para PDF y Youtube
    url: {
      type: String,
      default: ""
    },
    //Para informacion dentro de la pagina
    contenido: {
      type: String,
      default: ""
    },
    nivelDificultad: {
      type: String,
      enum: ["basico", "intermedio", "avanzado" ],
      default: "basico"
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

export default mongoose.model( "Recurso", recursoSchema);