/**
 * @param {{login?: boolean;home?: boolean;}} redirect
 * @param {(arg0: boolean) => void} callback
 */
export default function (redirect, callback) {
    redirect = {
        login: redirect.login || false,
        home: redirect.home || false
    };

    let token = localStorage.getItem("token");
    let username = localStorage.getItem("username");
    if (!token || !username) {
        if (redirect.login) {
            document.location = "auth/login";
        }
        callback(false);
    } else {
        fetch(`/api/auth/token?token=${token}`, { method: "GET" }).then((res) => {
            if (res.status === 200) {
                res.json().then((data) => {
                    if (data.message == "renew") {
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("username", data.username);
                    }
                    if (redirect.home) {
                        document.location = "/";
                    }
                    callback(true);
                });
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                document.location = "auth/login";
            }
        });
    }
}
