
import { useState, useEffect } from 'react';

export const useCountdownLogic = (onUnlock: () => void) => {
    const [progress, setProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState("");
    const [statusText, setStatusText] = useState("");

    useEffect(() => {
        const calculateProgress = () => {
            // 1. Get Current Time in Jakarta (WIB)
            const now = new Date();
            const jakartaTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
            const currentJakarta = new Date(jakartaTimeStr);

            // 2. Define Start Time (06:00 WIB Today)
            const startDate = new Date(currentJakarta);
            startDate.setHours(6, 0, 0, 0);

            // 3. Define End/Open Time (10:35 WIB Today)
            const endDate = new Date(currentJakarta);
            endDate.setHours(10, 35, 0, 0);

            const nowMs = currentJakarta.getTime();
            const startMs = startDate.getTime();
            const endMs = endDate.getTime();

            // 4. Logic
            if (nowMs >= endMs) {
                // Time passed, unlock immediately
                setProgress(100);
                setTimeLeft("00:00:00");
                setStatusText("Welcome to Pasco.");
                onUnlock();
                return true; // Stop interval
            } else if (nowMs < startMs) {
                // Before 06:00
                setProgress(0);
                setStatusText("Preparing the celebration...");
            } else {
                // In between (The Loading Phase)
                const totalDuration = endMs - startMs;
                const elapsed = nowMs - startMs;
                const percent = (elapsed / totalDuration) * 100;
                
                setProgress(Math.min(99.9, percent)); // Cap at 99.9 until strictly finished
                
                // Fun status messages based on percentage
                if (percent < 20) setStatusText("Gathering the crowd...");
                else if (percent < 50) setStatusText("Setting up the stage...");
                else if (percent < 80) setStatusText("Charging the atmosphere...");
                else setStatusText("Final Countdown!");
            }

            // Calculate Countdown String
            const diff = endMs - nowMs;
            if (diff > 0) {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }

            return false;
        };

        // Run immediately
        const finished = calculateProgress();
        if (finished) return;

        // Loop
        const interval = setInterval(() => {
            const isDone = calculateProgress();
            if (isDone) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [onUnlock]);

    return { progress, timeLeft, statusText };
};
