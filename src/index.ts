import { Elysia } from "elysia";

new Elysia()
    .get("/", "Hello Elysia")
    .get("user/:id", ({ params: { id } }) => id)
    .post("/form", ({ body }) => body)
    .get("/card/:id", ({ params: { id } }) => Bun.file(`data/cards/${id}.json`))
    .listen(3000);
