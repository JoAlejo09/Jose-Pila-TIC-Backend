import request from "supertest";

describe("Login API", () => {
    test("Debe iniciar sesión", async () => {
        const response = await request(
            "https://tic-backend-refacademy.onrender.com"
        )
            .get("/")
            .send({
                email: "admin@test.com",
                password: "123456"
            });
                console.log(response.body);
            expect(response.statusCode).toBe(200);
    });
});