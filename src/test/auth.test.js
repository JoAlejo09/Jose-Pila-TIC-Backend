import request from "supertest";

describe("Login API", () => {
    test("Inicio de Sesion", async () => {
    const response = await request(
        "https://tic-backend-refacademy.onrender.com"
    )
        .post("/api/auth/login")
        .send({
            email: "",
            password: "123456"
        });

    console.log("TEXT:", response.text);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("debeCambiarPassword");
    expect(response.body.msg).toBe("Inicio de sesión exitoso");
    expect(response.statusCode).toBe(200);
});
});