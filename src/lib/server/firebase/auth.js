import { initializeApp } from "@firebase/app";
import {
    getAuth, setPersistence, inMemoryPersistence, connectAuthEmulator,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCustomToken, signOut,
    sendEmailVerification, sendPasswordResetEmail, updateProfile
} from "@firebase/auth";
import firebaseAdmin from "firebase-admin";

const Production = import.meta.env.VITE_Production === "true";

const firebaseConfig = JSON.parse(import.meta.env.VITE_FirebaseConfig || "{}");
const app = initializeApp(firebaseConfig);

/** @type {import('@firebase/app').FirebaseOptions} */
const firebaseAdminServiceAccountKeyseAdminConfig = JSON.parse(import.meta.env.VITE_FirebaseAdminServiceAccountKey || "{}");
/** @type {import('firebase-admin').AppOptions} */
const firebaseAdminConfig = Production ? {
    credential: firebaseAdmin.credential.cert(firebaseAdminServiceAccountKeyseAdminConfig),
    databaseURL: firebaseConfig.databaseURL
} : {
    projectId: firebaseConfig.projectId,
    databaseURL: firebaseConfig.databaseURL
}
const appAdmin = firebaseAdmin.initializeApp(firebaseAdminConfig);

const auth = getAuth(app);
const authAdmin = appAdmin.auth();
const adminDB = appAdmin.database();

if (!Production) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    adminDB.useEmulator("127.0.0.1", 9000);
}

/**
 * @param {{ username: string; email: string; password: string; }} data
 */
export async function Register(data) {
    await setPersistence(auth, inMemoryPersistence);
    try {
        const current_time = new Date().getTime();
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: data.username });
            await auth.currentUser.reload();
            await adminDB.ref("logs/auth/register").push({
                time: current_time,
                uid: auth.currentUser.uid
            });
            await sendEmailVerification(auth.currentUser);
            await signOut(auth);
        }
    } catch (/** @type any */ err) {
        if (err.code == "auth/email-already-in-use") {
            return "email_already_in_use";
        } else if (err.code == "auth/weak-password") {
            return "weak_password";
        }
    }
    return null;
}

export async function Reset() {
    await setPersistence(auth, inMemoryPersistence);
    try {
        //
    } catch (/** @type any */ err) {
        //
    }
}

/**
 * @param {string} email
 * @param {string} passowrd
 */
export async function Login(email, passowrd) {
    await setPersistence(auth, inMemoryPersistence);
    try {
        const current_time = new Date().getTime();
        await signInWithEmailAndPassword(auth, email, passowrd);
        if (auth.currentUser && auth.currentUser.emailVerified) {
            const token = await auth.currentUser.getIdToken(true);
            const username = auth.currentUser.displayName;
            const uid = auth.currentUser.uid;
            await signOut(auth);
            await adminDB.ref("logs/auth/login").push({
                time: current_time,
                uid: uid
            });
            return [null, token, username];
        } else {
            return ["email_not_verified", null, null];
        }
    } catch (/** @type any */ err) {
        if (err.code == "auth/user-not-found") {
            return ["email_not_found", null, null];
        } else if (err.code == "auth/wrong-password") {
            return ["wrong_password", null, null];
        } else if (err.code == "auth/user-disabled") {
            return ["account_suspended", null, null];
        } else {
            return ["internal_server_error", null, null];
        }
    }
}

/**
 * @param {string} token
 */
export async function Logout(token) {
    try {
        let payload = await appAdmin.auth().verifyIdToken(token, true);
        if (payload) {
            if (payload.uid) {
                const current_time = new Date().getTime();
                if ((payload.exp - (current_time / 1000)) < 0) {
                    return false;
                }
                await adminDB.ref("logs/auth/logout").push({
                    time: current_time,
                    uid: payload.uid
                });
                return true;
            }
        }
    } catch (/** @type any */ err) {
        if (err.code == "auth/id-token-expired" || err.code == "auth/id-token-revoked") {
            return true;
        }
    }
    return false;
}

/**
 * @param {string} token
 */
export async function LogoutAll(token) {
    try {
        let payload = await appAdmin.auth().verifyIdToken(token, true);
        if (payload) {
            if (payload.uid) {
                const current_time = new Date().getTime();
                if ((payload.exp - (current_time / 1000)) < 0) {
                    return false;
                }
                await appAdmin.auth().revokeRefreshTokens(payload.uid);
                await adminDB.ref("logs/auth/logout-all").push({
                    time: current_time,
                    uid: payload.uid
                });
                return true;
            }
        }
    } catch (/** @type any */ err) {
        if (err.code == "auth/id-token-expired" || err.code == "auth/id-token-revoked") {
            return true;
        }
    }
    return false;
}

/**
 * @param {string} token
 * @param {boolean} renew
 */
export async function VerifyToken(token, renew) {
    try {
        let payload = await authAdmin.verifyIdToken(token, true);
        if (payload) {
            const current_time = new Date().getTime()
            const remaining = payload.exp - (current_time / 1000);
            if (remaining < 0) {
                return [false, null, null];
            } else if (remaining < 1800 && renew) {
                const custom_token = await authAdmin.createCustomToken(payload.uid);
                await setPersistence(auth, inMemoryPersistence);
                await signInWithCustomToken(auth, custom_token);
                const username = auth.currentUser?.displayName;
                const new_token = await auth.currentUser?.getIdToken(true);
                await signOut(auth);
                await adminDB.ref("logs/auth/renew-token").push({
                    time: current_time,
                    uid: payload.uid
                });
                return [true, new_token, username];
            } else {
                return [true, null, null];
            }
        }
    } catch (/** @type any */ err) {
        return [false, null, null];
    }
}

/**
 * @param {string} email
 */
export async function SendEmail_VerifyEmail(email) {
    try {
        const current_time = new Date().getTime();
        const userRecord = await authAdmin.getUserByEmail(email);
        if (userRecord.emailVerified) {
            return "account_verified";
        }
        const uid = userRecord?.uid;
        const custom_token = await authAdmin.createCustomToken(uid);
        await setPersistence(auth, inMemoryPersistence);
        await signInWithCustomToken(auth, custom_token);
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
            await signOut(auth);
            await adminDB.ref("logs/auth/resend-email-verify").push({
                time: current_time,
                uid: uid
            });
            return null;
        }
    } catch (/** @type any */ err) {
        if (err.code == "auth/user-not-found") {
            return "email_not_found";
        } else if (err.code == "auth/user-disabled") {
            return "account_suspended";
        } else if (err.code == "auth/too-many-requests") {
            return "too_many_requests"
        } else {
            console.log(err);
            return "internal_server_error";
        }
    }
}

/**
 * @param {string} email
 */
export async function SendEmail_ResetPassword(email) {
    try {
        const current_time = new Date().getTime();
        const userRecord = await authAdmin.getUserByEmail(email);
        const uid = userRecord?.uid;
        const custom_token = await authAdmin.createCustomToken(uid);
        await setPersistence(auth, inMemoryPersistence);
        await signInWithCustomToken(auth, custom_token);
        if (auth.currentUser) {
            await sendPasswordResetEmail(auth, email);
            await signOut(auth);
            await adminDB.ref("logs/auth/send-email-reset-password").push({
                time: current_time,
                uid: uid
            });
            return null;
        }
    } catch (/** @type any */ err) {
        if (err.code == "auth/user-not-found") {
            return "email_not_found";
        } else if (err.code == "auth/user-disabled") {
            return "account_suspended";
        } else {
            return "internal_server_error";
        }
    }
}
