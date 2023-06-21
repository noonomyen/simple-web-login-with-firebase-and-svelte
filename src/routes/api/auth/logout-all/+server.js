import { json } from "@sveltejs/kit";
import { LogoutAll } from "$lib/server/firebase/auth";

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, setHeaders }) {
    setHeaders({ "Cache-Control": "no-store" });
    const token = url.searchParams.get("token");
    if (token) {
        const ok = await LogoutAll(token);
        if (ok) {
            return json({ message: "ok"});
        } else {
            return new Response(null, { status: 404 });
        }
    } else {
        return new Response(null, { status: 400 });
    }
}
