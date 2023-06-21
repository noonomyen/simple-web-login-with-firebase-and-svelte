import { writable } from "svelte/store";

/**
 * @param {string} key
 */
export default function(key) {
    const val = localStorage.getItem(key);
    if (!val) {
        return null;
    } else {
        const _writable = writable(val);
        _writable.subscribe((val) => {
            if (val) {
                localStorage.setItem(key, val);
            } else {
                localStorage.removeItem(key);
            }
        });

        return _writable;
    }
};
