import { jest } from "@jest/globals";
import Tutoria from "../models/Tutoria.js";
import { calificarTutoria } from "../controllers/tutoria_controller.js";

describe("calificarTutoria", () => {

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test("Calificar una tutoría correctamente", async () => {

        const saveMock = jest.fn().mockResolvedValue(true);

        jest.spyOn(Tutoria, "findById")
            .mockResolvedValue({
                _id: "123",
                estudiante: {
                    toString: () => "estudiante123"
                },
                estado: "realizada",
                calificacion: null,
                comentarioCalificacion: "",
                save: saveMock
            });

        const req = {
            params: {
                id: "123"
            },
            usuario: {
                id: "estudiante123"
            },
            body: {
                calificacion: 5,
                comentarioCalificacion: "Excelente tutoría"
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await calificarTutoria(req, res);
        
        console.log(res.json.mock.calls);

        expect(Tutoria.findById).toHaveBeenCalledWith("123");
        expect(saveMock).toHaveBeenCalled();
    });

});