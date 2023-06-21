<script>
    let Successfully = false;

    /** @type {HTMLParagraphElement} */
    let ParagraphElement_ErrorMessage;
    /** @type {HTMLInputElement} */
    let InputElement_Username;
    /** @type {HTMLInputElement} */
    let InputElement_Email;
    /** @type {HTMLInputElement} */
    let InputElement_Password;
    /** @type {HTMLInputElement} */
    let InputElement_ConfirmPassword;

    const ErrorMessage = (/** @type {string} */ message) => { ParagraphElement_ErrorMessage.innerText = message }

    let Requesting = false;

    const CheckInput = () => {
        const Error1 = (
            InputElement_Username.value === "" ||
            InputElement_Email.value === "" ||
            InputElement_Password.value === "" ||
            InputElement_ConfirmPassword.value === "" ||
            !InputElement_Email.validity.valid
        );
        const Error2 = (InputElement_Password.value !== InputElement_ConfirmPassword.value);
        if (Error1) {
            ErrorMessage("Please enter your username, email, password");
            return false;
        } else if (!Error1 && Error2) {
            ErrorMessage("Passwords do not match");
            return false;
        } else if (InputElement_Password.value.length < 6) {
            ErrorMessage("Password should be at least 6 characters");
        } else {
            ErrorMessage("");
            return true;
        }
    }

    const BTN_REGISTER = () => {
        if (CheckInput() && !Requesting) {
            Requesting = true;
            fetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    username: InputElement_Username.value,
                    email: InputElement_Email.value,
                    password: InputElement_Password.value
                })
            }).then((res) => {
                if (res.status == 201) {
                    Successfully = true;
                    setTimeout(() => { document.location = "/auth/login" }, 1000);
                } else if (res.status == 400) {
                    res.json().then((data) => {
                        if (data.message === "weak_password") {
                            ErrorMessage("Password should be at least 6 characters");
                        } else if (data.message === "bad_request" && data.invalids) {
                            ErrorMessage(
                                `Error with${
                                    data.invalids.username ? " username" : ""
                                }${
                                    data.invalids.email ? " email" : ""
                                }${
                                    data.invalids.password ? " password" : ""
                                }`
                            );
                        } else {
                            ErrorMessage(`Failed to register - status: ${res.status}`);
                        }
                        Requesting = false;
                    });
                } else if (res.status == 409) {
                    res.json().then((data) => {
                        if (data.message === "email_already_in_use") {
                            ErrorMessage("This email has already been taken");
                        }
                        Requesting = false;
                    });
                } else {
                    ErrorMessage(`Failed to register - status: ${res.status}`);
                    Requesting = false;
                }
            });
        }
    }
</script>

{#if !Successfully}
    <h1 class="text-center text-3xl font-medium mb-5">Register</h1>
    <div class="text-lg mt-2">Name</div>
    <input type="text" class="custom_text-input text-xl" autocomplete="name" bind:this={InputElement_Username}>
    <div class="text-lg mt-2">Email</div>
    <input type="email" class="custom_text-input text-xl" autocomplete="email" bind:this={InputElement_Email}>
    <div class="text-lg mt-2">Password</div>
    <input type="password" class="custom_text-input text-xl" autocomplete="new-password" bind:this={InputElement_Password}>
    <div class="text-lg mt-2">Confirm Password</div>
    <input type="password" class="custom_text-input text-xl" autocomplete="new-password" bind:this={InputElement_ConfirmPassword}>
    <p class="text-lg text-red-600 font-medium h-6" bind:this={ParagraphElement_ErrorMessage}></p>
    <div class="mt-5 flex justify-center gap-x-2 flex-col items-center">
        <button class="w-[200px] custom_btn tracking-wider text-[16px]" on:click={BTN_REGISTER}>REGISTER</button>
        <a class="text-center text-sm hover:underline underline-offset-4 mt-2" href="/auth/login">Already have an account? &gt; LOGIN</a>
    </div>
{:else}
    <div class="text-xl">Successfully</div>
{/if}
