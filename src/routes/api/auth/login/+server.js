import { json } from "@sveltejs/kit";
import { validate as email_validate } from "email-validator";
import { Login } from "$lib/server/firebase/auth";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, setHeaders }) {
    setHeaders({ "Cache-Control": "no-store" });
    const data = await request.json();
    const invalid_email = (!data.email || data.email === "" || !email_validate(data.email));
    const invalid_password = (!data.password || data.password === "");
    if (invalid_email || invalid_password) {
        return new Response(JSON.stringify({
            message: "bad_request",
            invalids: {
                email: invalid_email,
                password: invalid_password,
            }
        }), { status: 400, headers: { "Content-Type": "application/json" } });
    } else {
        /** @type {any} err */
        const [err, token, username] = await Login(data.email, data.password);
        if (err) {
            if (err == "email_not_found" || err == "wrong_password" || err == "email_not_verified") {
                return new Response(JSON.stringify({ message: err }), { status: 401, headers: { "Content-Type": "application/json" } });
            } else if (err.code == "account_suspended") {
                return new Response(JSON.stringify({ message: err }), { status: 403, headers: { "Content-Type": "application/json" } });
            } else {
                return new Response(JSON.stringify({ message: err }), { status: 500, headers: { "Content-Type": "application/json" } });
            }
        } else {
            return json({ message: "ok", token: token, username: username });
        }
    }
}
