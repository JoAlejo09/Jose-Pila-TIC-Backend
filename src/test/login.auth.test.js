import { jest } from "@jest/globals";
import { loginUsuario } from "../controllers/user_controller.js";
import Usuario from "../models/Usuario.js";

describe("Prueba unitaria - loginUsuario", () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Debe iniciar sesión correctamente con credenciales válidas", async () => {

        const usuarioMock = {
            _id: "6a130a7977337afe44a8fcf5",
            id: "6a130a7977337afe44a8fcf5",
            nombre: "Andres",
            apellido: "Vinueza",
            email: "liris91076@ameady.com",
            rol: "estudiante",
            fotoPerfil: "https://res.cloudinary.com/dkd5xjf2u/image/upload/v1779826317/perfiles/vc2eys4gszi4stfztqoy.jpg",
            perfilCompleto: true,
            debeCambiarPassword: false,
            isActive: true,
            isVerified: true,
            matchPassword: jest.fn().mockResolvedValue(true)
        };

        jest.spyOn(Usuario, "findOne").mockReturnValue({
            select: jest.fn().mockResolvedValue(usuarioMock)
        });

        const req = {
            body: {
                email: "liris91076@ameady.com",
                password: "abcde12345"
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await loginUsuario(req, res);

        expect(Usuario.findOne).toHaveBeenCalledWith({
            email: "liris91076@ameady.com"
        });

        expect(usuarioMock.matchPassword)
            .toHaveBeenCalledWith("abcde12345");

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: expect.any(String),
                    token: expect.any(String),
                    debeCambiarPassword: false,
                    user: expect.objectContaining({
                        id: "6a130a7977337afe44a8fcf5",
                        email: "liris91076@ameady.com",
                        rol: "estudiante",
                        nombre: "Andres",
                        apellido: "Vinueza"
                    })
                })
            );
    });

});