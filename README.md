# Simple web login with Firebase and Svelte

---

## Documents

- [Authentication Flow and API](docs/auth-flow-and-api.md)
- [Authentication Log Database Structure](docs/auth-log-db-structure.md)

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

## Setup

```
npm install
```

### Firebase emulators

```
npx firebase emulators:start
```

### Start

```
npm run dev
```

### Build (adapter-node)

```
npm run build
```

---

## Environment configuration

### Emulator

```
# PowerShell
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"

# Bash
export FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
```

```
VITE_FirebaseConfig={"apiKey":<> ,"projectId": <>, "databaseURL": <>}
VITE_Production=false
```

### Production

```
VITE_FirebaseConfig={"apiKey":<> ,"projectId": <>, "databaseURL": <>}
VITE_FirebaseAdminServiceAccountKey=< Json service account key >
VITE_Production=true
```
