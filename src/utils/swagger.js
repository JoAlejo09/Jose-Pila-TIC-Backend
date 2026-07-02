import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition:{
        openapi: "3.0.0",

        info: {
            title: "TIC API Sistema de Refuerzo Academico - RefAcademy ",
            version: "1.0.0",
            description: "Documentacioón oficial de la API REST del Sistema Web de refuerzo academico - RefAcademy",
        },
        servers: [
            {
                url: "http://localhost:4000/api",
                description: "Servidor de desarrollo",
            },
            {
                url: "https://tic-backend-refacademy.onrender.com",
                description: "Servidor de produccion",
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                }
            }
        },
        security: [
            {
                bearerAuth: [], 
            }
        ]
    },
    apis: [
    "./src/routes/auth_routes.js",
    "./src/routes/user_routes.js",
    "./src/routes/perfil_routes.js",
    "./src/routes/estudiante_routes.js",

    "./src/routes/materia_routes.js",
    "./src/routes/unidad_routes.js",
    "./src/routes/tema_routes.js",
    "./src/routes/recurso_routes.js",

    "./src/routes/pregunta_routes.js",
    "./src/routes/cuestionario_routes.js",
    "./src/routes/resultado_routes.js",

    "./src/routes/progreso_routes.js",
    "./src/routes/recomendacion_routes.js",
    "./src/routes/tutoria_routes.js",

    "./src/routes/dashboard_routes.js"
]
};
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;