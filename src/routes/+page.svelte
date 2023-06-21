<script>
    import { browser } from "$app/environment";
    import localStorageWritable from "./js/localStorageWritable";
    import checkBrowserToken from "./js/checkBrowserToken";

    let ok = false;
    if (browser) {
        checkBrowserToken({ login: true }, (/** @type {boolean} */ result) => { ok = result });
    }

    /** @type {import("svelte/store").Writable<string> | null} */
    let username;

    if (browser) {
        username = localStorageWritable("username");
    }
</script>

{#if ok}
    <h1 class="text-center text-2xl font-medium">Simple web login with Firebase and Svelte</h1>
    {#if username}
        <p class="text-center mt-5 text-xl">
            <span>Your username is </span>
            <span class="font-medium">{$username}</span>
        </p>
    {/if}
    <div class="flex justify-center mt-5 gap-x-2">
        <button on:click={() => {document.location = "/auth/logout"}} class="w-[200px] custom_btn tracking-wider text-[16px]">LOGOUT</button>
        <button on:click={() => {document.location = "/auth/logout-all"}} class="w-[200px] custom_btn tracking-wider text-[16px]">LOGOUT ALL</button>
    </div>
{:else}
    <div class="text-xl">Loading...</div>
{/if}
