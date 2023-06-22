<script>
    import { browser } from "$app/environment";
    import checkBrowserToken from "../../js/checkBrowserToken";

    let ok = false;
    /** @type {string | null} */
    let EmailNotVerified = null;
    if (browser) {
        checkBrowserToken({ home: true }, (/** @type {boolean} */ result) => { ok = result });
    }

    /** @type {HTMLParagraphElement} */
    let ParagraphElement_ErrorMessage;
    /** @type {HTMLInputElement} */
    let InputElement_Email;
    /** @type {HTMLInputElement} */
    let InputElement_Password;

    const ErrorMessage = (/** @type {string} */ message) => { ParagraphElement_ErrorMessage.innerText = message }

    let Requesting = false;

    const BTN_LOGIN = () => {
        if (!Requesting) {
            Requesting = true;
            const current_email = InputElement_Email.value;
            if (current_email === "" || InputElement_Password.value === "" || !InputElement_Email.validity.valid) {
                ErrorMessage("Please enter your email and password");
                Requesting = false;
            } else {
                fetch("/api/auth/login", {
                    method: "POST",
                    body: JSON.stringify({
                        email: current_email,
                        password: InputElement_Password.value
                    })
                }).then((res) => {
                    if (res.status == 200) {
                        res.json().then((data) => {
                            if (data.message == "ok") {
                                localStorage.setItem("token", data.token);
                                localStorage.setItem("username", data.username);
                                document.location = "/";
                            } else {
                                ErrorMessage(`Unknown error: ${data.message}`);
                            }
                            Requesting = false;
                        });
                    } else if (res.status == 400) {
                        res.json().then((data) => {
                            if (data.message == "bad_request" && data.invalids) {
                                if (data.invalids.email) {
                                    ErrorMessage(
                                        `Error with${
                                            data.invalids.email ? " email" : ""
                                        }${
                                            data.invalids.password ? " password" : ""
                                        }`
                                    );
                                }
                            }
                        })
                    } else if (res.status == 401 || res.status == 403) {
                        res.json().then((data) => {
                            switch(data.message) {
                                case "email_not_verified":
                                    ErrorMessage("Your email is not verified");
                                    EmailNotVerified = current_email;
                                    break;
                                case "email_not_found":
                                    ErrorMessage("This email address could not be found");
                                    break;
                                case "wrong_password":
                                    ErrorMessage("Incorrect password");
                                    break;
                                case "account_suspended":
                                    ErrorMessage("Your account is suspended");
                                    break;
                                default:
                                    ErrorMessage(`Unknown error: ${data.message}`);
                            }
                            Requesting = false;
                        });
                    } else {
                        ErrorMessage(`Unknown error - status: ${res.status}`);
                        Requesting = false;
                    }
                });
            }
        }
    }

    const BTN_REGISTER = () => { document.location = "/auth/register" }

    const BTN_RESEND_EMAIL_VERIFY = () => {
        const email = EmailNotVerified;
        EmailNotVerified = null;
        fetch(`/api/auth/resend-email-verify?email=${email}`, { method: "POST" }).then((res) => {
            EmailNotVerified = null;
            if (res.status == 200 || res.status == 404 || res.status == 403) {
                res.json().then((data) => {
                    if (data.message == "ok") {
                        ErrorMessage("");
                    } else if (data.message == "account_verified") {
                        ErrorMessage("The account is already verified");
                    } else if (data.message == "email_not_found") {
                        ErrorMessage("This email address could not be found");
                    } else if (data.message == "account_suspended") {
                        ErrorMessage("Your account is suspended");
                    } else if (data.message == "too_many_requests") {
                        ErrorMessage("Too many request");
                    } else {
                        ErrorMessage(`Unknown error: ${data.message}`);
                    }
                });
            } else {
                ErrorMessage(`Unknown error - status: ${res.status}`);
            }
        });
    }
</script>

{#if !ok}
    <h1 class="text-center text-3xl font-medium mb-5">Login</h1>
    <div class="text-lg mt-2">Email</div>
    <input type="email" class="custom_text-input text-xl" autocomplete="username" bind:this={InputElement_Email}>
    <div class="text-lg mt-2">Password</div>
    <input type="password" class="custom_text-input text-xl" autocomplete="current-password" bind:this={InputElement_Password}>
    <a class="text-lg hover:underline underline-offset-4" href="/auth/forgot">Forgot password?</a>
    <p class="text-lg text-red-600 font-medium h-6" bind:this={ParagraphElement_ErrorMessage}></p>
    <div class="mt-5 flex justify-center gap-x-2">
        <button class="w-[200px] custom_btn tracking-wider text-[16px]" on:click={BTN_REGISTER}>REGISTER</button>
        <button class="w-[200px] custom_btn tracking-wider text-[16px]" on:click={BTN_LOGIN}>LOGIN</button>
    </div>
{:else}
    <div class="text-xl">Loading...</div>
{/if}

{#if EmailNotVerified != null}
    <div class="flex justify-center">
        <!-- svelte-ignore a11y-invalid-attribute -->
        <a class="text-center text-lg hover:underline underline-offset-4" on:click={BTN_RESEND_EMAIL_VERIFY} href="#">Resend me a confirmation email.</a>
    </div>
{/if}
