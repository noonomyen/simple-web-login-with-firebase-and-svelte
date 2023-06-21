import { json } from "@sveltejs/kit";
import { SendEmail_ResetPassword } from "$lib/server/firebase/auth";

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, setHeaders }) {
    setHeaders({ "Cache-Control": "no-store" });
    const email = url.searchParams.get("email");
    if (email) {
        const err = await SendEmail_ResetPassword(email);
        if (err == "email_not_found") {
            return new Response(JSON.stringify({ message: err }), { status: 404, headers: { "Content-Type": "application/json" } });
        } else if (err == "account_suspended") {
            return new Response(JSON.stringify({ message: err }), { status: 403, headers: { "Content-Type": "application/json" } });
        } else if (err == "internal_server_error") {
            return new Response(JSON.stringify({ message: err }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            return json({ message: "ok"});
        }
    } else {
        return new Response(null, { status: 400 });
    }
}
