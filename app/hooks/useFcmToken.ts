"use client";

import { useEffect, useState } from "react";
import { getMessagingInstance } from "@/app/lib/firebase";
import { getToken } from "firebase/messaging";

const useFcmToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [notificationPermissionStatus, setNotificationPermissionStatus] =
        useState<NotificationPermission>("default");

    const retrieveToken = async () => {
        try {
            if (typeof window !== "undefined" && "serviceWorker" in navigator) {
                const messaging = await getMessagingInstance();

                if (!messaging) return;

                // Request permission if not already granted
                let permission = Notification.permission;
                if (permission === "default") {
                    permission = await Notification.requestPermission();
                    setNotificationPermissionStatus(permission);
                }

                if (permission === "granted") {
                    const currentToken = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    });

                    if (currentToken) {
                        setToken(currentToken);
                        // Send token to backend
                        await saveTokenToBackend(currentToken);
                    } else {
                        console.log(
                            "No registration token available. Request permission to generate one."
                        );
                    }
                }
            }
        } catch (error) {
            console.error("An error occurred while retrieving token:", error);
        }
    };

    const saveTokenToBackend = async (token: string) => {
        try {
            const response = await fetch("/api/user/fcm-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                console.error("Failed to save FCM token to backend");
            }
        } catch (error) {
            console.error("Error saving FCM token to backend:", error);
        }
    };

    useEffect(() => {
        // Check current permission status on mount
        if (typeof window !== "undefined" && "Notification" in window) {
            setNotificationPermissionStatus(Notification.permission);

            // If already granted, retrieve token immediately
            if (Notification.permission === "granted") {
                retrieveToken();
            }
        }
    }, []);

    return { token, notificationPermissionStatus, requestPermission: retrieveToken };
};

export default useFcmToken;
