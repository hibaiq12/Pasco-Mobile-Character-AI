
import { useState, useEffect } from 'react';

export const SECRET_PIN = '120308';

export const useMaintenanceLogic = (onUnlock: () => void, isUnlocking: boolean, setIsUnlocking: (v: boolean) => void) => {
    const [pin, setPin] = useState<string[]>(new Array(6).fill(''));
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [countdown, setCountdown] = useState<string>("--:--:--");

    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const jakartaTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
            const jakartaDate = new Date(jakartaTimeStr);
            const h = jakartaDate.getHours();
            const m = jakartaDate.getMinutes();

            // OPERATIONAL WINDOWS
            const isWindow1 = (h === 23 && m >= 15);
            const isWindow2 = (h === 0 && m >= 15) || (h > 0 && h < 4);

            if (isWindow1 || isWindow2) {
                if (!isUnlocking) {
                    setIsUnlocking(true);
                    onUnlock();
                }
                return;
            }

            // HITUNG TARGET PEMBUKAAN
            let targetDate = new Date(jakartaDate);
            if (h === 0 && m < 15) {
                targetDate.setHours(0, 15, 0, 0);
            } else if (h < 23 || (h === 23 && m < 15)) {
                targetDate.setHours(23, 15, 0, 0);
            } else {
                targetDate.setDate(targetDate.getDate() + 1);
                targetDate.setHours(0, 15, 0, 0);
            }

            const diff = targetDate.getTime() - jakartaDate.getTime();
            if (diff > 0) {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setCountdown("00:00:00");
            }
        };

        const timerInterval = setInterval(checkTime, 1000);
        checkTime();
        return () => clearInterval(timerInterval);
    }, [onUnlock, isUnlocking]);

    const handlePinChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return null;
        const newPin = [...pin];
        newPin[index] = value.substring(value.length - 1);
        setPin(newPin);
        setError('');
        return value ? index + 1 : null;
    };

    const verifyPin = () => {
        const enteredPin = pin.join('');
        if (enteredPin === SECRET_PIN) {
            setIsUnlocking(true);
            setTimeout(() => onUnlock(), 800);
            return true;
        } else {
            setError('ACCESS DENIED');
            setPin(new Array(6).fill(''));
            setShake(true);
            setTimeout(() => setShake(false), 300);
            return false;
        }
    };

    return { pin, setPin, error, shake, countdown, handlePinChange, verifyPin };
};
