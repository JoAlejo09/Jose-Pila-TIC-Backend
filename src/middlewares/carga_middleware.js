import multer from "multer";

//Carga de imagenes de memoria para Cloudinary
const storage =  multer.diskStorage({});
const upload = multer({
    storage,
    limits: {
        fileSize:
          2 * 1024 * 1024
    },
    fileFilter:
      (req,file,cb)=>{
        const tiposPermitidos = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
        ];
        if(
            tiposPermitidos.includes(file.mimetype)
        ){
            cb(null,true);
        }else{
            cb(new Error("Formato no permitido"));
        }
      }
  });

export default upload;