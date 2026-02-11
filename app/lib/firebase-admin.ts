import "server-only";
import admin from "firebase-admin";

interface FirebaseServiceAccount {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, "\n");
}

let _adminApp: admin.app.App | null = null;
let _messaging: admin.messaging.Messaging | null = null;

export function createFirebaseAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        throw new Error(
            "Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable. " +
            "Please generate a private key from Firebase Console > Project Settings > Service accounts, " +
            "and add the JSON string to your .env file."
        );
    }

    let serviceAccount: FirebaseServiceAccount;

    try {
        serviceAccount = JSON.parse(serviceAccountKey);
    } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:", error);
        throw new Error("Invalid User Service Account Key JSON");
    }

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

// Lazy initialization - only creates app when accessed
export function getAdminApp() {
    if (!_adminApp) {
        _adminApp = createFirebaseAdminApp();
    }
    return _adminApp;
}

export function getMessaging() {
    if (!_messaging) {
        _messaging = admin.messaging(getAdminApp());
    }
    return _messaging;
}
