import { json } from "@sveltejs/kit";
import { VerifyToken } from "$lib/server/firebase/auth";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, setHeaders }) {
    setHeaders({ "Cache-Control": "no-store" });
    const token = url.searchParams.get("token");
    const allow_renew = url.searchParams.get("allow_renew");
    if (token) {
        let ok;
        let new_token;
        let username;

        if (allow_renew == "true") {
            // @ts-ignore
            const [_ok, _new_token, _username] = await VerifyToken(token, true);
            ok = _ok;
            new_token = _new_token;
            username = _username;
        } else {
            const [_ok, _new_token, _username] = await VerifyToken(token, false);
            ok = _ok;
            new_token = _new_token;
            username = _username;
        }

        if (ok) {
            if (new_token) {
                return json({ message: "renew", token: new_token, username: username });
            } else {
                return json({ message: "ok" });
            }
        } else {
            return new Response(null, { status: 404 });
        }
    } else {
        return new Response(null, { status: 400 });
    }
}
