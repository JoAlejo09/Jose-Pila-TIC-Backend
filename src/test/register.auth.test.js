import { jest } from "@jest/globals";
import { registrarUsuario } from "../controllers/user_controller.js";
import Usuario from "../models/Usuario.js";
import { enviarEmailConfirmacion } from "../config/nodemailer.js";

describe("Prueba unitaria - registrarUsuario", () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Debe registrar un usuario correctamente", async () => {

        // Simular que el correo NO existe
        jest.spyOn(Usuario, "findOne").mockResolvedValue(null);

        // Simular métodos del modelo
        jest.spyOn(Usuario.prototype, "encryptPassword")
            .mockResolvedValue("passwordEncriptada");

        jest.spyOn(Usuario.prototype, "generarToken")
            .mockImplementation(function () {
                this.token = "token-prueba";
            });

        jest.spyOn(Usuario.prototype, "save")
            .mockResolvedValue(true);

        // Simular envío de correo
        jest.spyOn({ enviarEmailConfirmacion }, "enviarEmailConfirmacion")
            .mockResolvedValue(true);

        const req = {
            body: {
                nombre: "Jose",
                apellido: "Pila",
                email: "jose@test.com",
                password: "Password123",
                confirmpassword: "Password123",
                rol: "estudiante"
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await registrarUsuario(req, res);

        expect(Usuario.findOne).toHaveBeenCalledWith({
            email: "jose@test.com"
        });

        expect(res.status)
            .toHaveBeenCalledWith(201);

        expect(res.json)
            .toHaveBeenCalledWith({
                msg: "Usuario registrado correctamente"
            });
    });

});