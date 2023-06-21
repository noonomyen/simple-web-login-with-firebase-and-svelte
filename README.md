# Simple web login with Firebase and Svelte

---

## Setup

```
npm install
```

### Firebase emulators

```
npx firebase emulators:start
```

### Build

```
npm run build
node ./build/index.js
```

### Start

```
npm run dev
```

---

## Environment config

### Emulator

```
# PowerShell
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"

# Bash
export FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
```

#### .env

```
VITE_FirebaseConfig={"apiKey":<> ,"projectId": <>, "databaseURL": <>}
VITE_Production=false
```

### Production

#### .env

```
VITE_FirebaseConfig={"apiKey":<> ,"projectId": <>, "databaseURL": <>}
VITE_FirebaseAdminServiceAccountKey=<json service account key (string)>
VITE_Production=true
```

---

## API

```
api
└─── auth
     ├─── login
     ├─── logout
     ├─── logout-all
     ├─── register
     ├─── resend-email-verify
     ├─── send-email-reset-password
     └─── forgot
```

---

## Pages

```
/
└─── auth
     ├─── forgot
     ├─── login
     ├─── logout
     ├─── logout-all
     └─── register
```

---

## Database Structure

```
logs
└─── auth
     ├─── register
     ├─── login
     ├─── logout
     ├─── logout-all
     ├─── resend-email-verify
     └─── send-email-reset-password
```
