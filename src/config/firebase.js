import admin from "firebase-admin";

const base64 =
process.env.SERVICE_ACCOUNT_BASE64;

if (!base64) {
    throw new Error("Missing Firebase credentials");
}

const serviceAccount =JSON.parse(
    Buffer.from(base64, "base64").toString("Utf-8")
);
if (!admin.apps.length) {
    admin.initializeApp({
        credential:
        admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

export { admin, db };