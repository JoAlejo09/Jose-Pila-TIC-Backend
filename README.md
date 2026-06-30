# API REST - Sistema Web de Refuerzo Académico

## Documentación

### Backend

El backend del Sistema Web de Refuerzo Académico proporciona una API RESTful desarrollada con Node.js y Express que permite gestionar la autenticación de usuarios, materias, temas, recursos académicos, evaluaciones, tutorías y el seguimiento del desempeño académico de los estudiantes.

El backend se encuentra desplegado en: https://tic-backend-refacademy.onrender.com

Para la documentación completa de la API revise en: 

### Características principales

- Autenticación mediante JWT.
- Gestión de usuarios (Administrador, Tutor y Estudiante).
- Administración de materias, unidades, temas y recursos.
- Gestión de evaluaciones y preguntas.
- Registro de resultados académicos.
- Generación de recomendaciones personalizadas.
- Gestión de tutorías.
- Carga de archivos mediante Cloudinary.
- Envío de correos electrónicos para confirmación de cuenta y recuperación de contraseña.

### Tecnologías utilizadas

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Cloudinary
- Nodemailer
- Multer
- Jest
- Supertest

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/JoAlejo09/Jose-Pila-TIC-Backend.git
```

## 2. Ingresar al proyecto

```bash
cd backend-refacademy
```

## 3. Instalar dependencias

```bash
npm install
```

## 4. Crear el archivo `.env`

```env
PORT=4000

MONGODB_URI=tu_uri_mongodb

JWT_SECRET=tu_clave_secreta

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=correo@gmail.com
EMAIL_PASS=clave_de_aplicacion

CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

FRONTEND_URL=http://localhost:5173
FRONTEND_URL_PRODUCTION=https://tu-frontend.vercel.app
```

## 5. Ejecutar el servidor

Modo desarrollo

```bash
npm run dev
```

Modo producción

```bash
npm start
```

---

## Pruebas

Ejecutar pruebas unitarias

```bash
npm test
```

---

## Arquitectura

El proyecto implementa el patrón arquitectónico MVC.

```
src/
│
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
└── server.js
```