<script>
    import { browser } from "$app/environment";

    /** @type HTMLParagraphElement */
    let element;

    if (browser) {
        const token = localStorage.getItem("token");
        const urlParams = new URLSearchParams(window.location.search);
        const redirect_to = urlParams.get("redirect_to");

        if (token) {
            fetch(`/api/auth/logout-all?token=${token}`, { method: "POST" }).then((res) => {
                if (res.status == 200) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("username");
                    if (redirect_to) {
                        document.location = redirect_to;
                    } else {
                        document.location = "/auth/login";
                    }
                } else {
                    element.innerText = `There was an error logging out - status: ${res.status}`;
                }
            });
        }
    }
</script>

<p class="text-xl" bind:this={element}>Loading...</p>
