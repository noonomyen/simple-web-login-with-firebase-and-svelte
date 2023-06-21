import { validate as email_validate } from "email-validator";
import { Register } from "$lib/server/firebase/auth";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, setHeaders }) {
    setHeaders({ "Cache-Control": "no-store" });
    const data = await request.json();
    const invalid_username = (!data.username || data.username === "");
    const invalid_email = (!data.email || data.email === "" || !email_validate(data.email));
    const invalid_password = (!data.password || data.password === "");
    if (invalid_username || invalid_email || invalid_password) {
        return new Response(JSON.stringify({
            message: "bad_request",
            invalids: {
                username: invalid_username,
                email: invalid_email,
                password: invalid_password,
            }
        }), { status: 400 });
    } else {
        const err = await Register(data);
        if (!err) {
            return new Response(null, { status: 201 });
        } else if (err == "email_already_in_use") {
            return new Response(JSON.stringify({ message: err }), { status: 409, headers: { "Content-Type": "application/json" } });
        } else if (err == "weak_password") {
            return new Response(JSON.stringify({ message: err }), { status: 400, headers: { "Content-Type": "application/json" } });
        } else {
            return new Response(null, { status: 500 });
        }
    }
}
