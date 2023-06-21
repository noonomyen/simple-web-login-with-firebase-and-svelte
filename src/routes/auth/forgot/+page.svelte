<script>
    let Successfully = false;

    /** @type {HTMLParagraphElement} */
    let ParagraphElement_ErrorMessage;
    /** @type {HTMLInputElement} */
    let InputElement_Email;

    const ErrorMessage = (/** @type {string} */ message) => { ParagraphElement_ErrorMessage.innerText = message }

    let Requesting = false;

    const BTN_RESET = () => {
        if (InputElement_Email.validity.valid && !Requesting) {
            Requesting = true;
            fetch(`/api/auth/send-email-reset-password?email=${InputElement_Email.value}`, { method: "POST" }).then((res) => {
                if (res.status == 200 || res.status == 404 || res.status == 403) {
                    res.json().then((data) => {
                        if (data.message == "ok") {
                            ErrorMessage("");
                            Successfully = true;
                        } else if (data.message == "email_not_found") {
                            ErrorMessage("This email address could not be found");
                        } else if (data.message == "account_suspended") {
                            ErrorMessage("Your account is suspended");
                        } else {
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
</script>

{#if !Successfully}
    <h1 class="text-center text-3xl font-medium mb-5">Forgot Password</h1>
    <div class="text-lg mt-2">Email</div>
    <input type="email" class="custom_text-input text-xl" autocomplete="email" bind:this={InputElement_Email}>
    <p class="text-lg text-red-600 font-medium h-6" bind:this={ParagraphElement_ErrorMessage}></p>
    <div class="mt-4 flex justify-center gap-x-2 flex-col items-center">
        <button class="w-[200px] custom_btn tracking-wider text-[16px]" on:click={BTN_RESET}>Reset</button>
        <a class="text-center text-sm hover:underline underline-offset-4 mt-2" href="/auth/login">Back to the login page &gt; LOGIN</a>
    </div>
{:else}
    <span class="text-xl">Successfully</span><a class="text-xl hover:underline underline-offset-4 mt-2" href="/auth/login">, Back to the login page &gt; LOGIN</a>
{/if}
