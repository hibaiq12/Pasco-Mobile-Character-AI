
import { useState } from 'react';

export const SECRET_PIN = '120308';

export const useMaintenanceLogic = (onUnlock: () => void, isUnlocking: boolean, setIsUnlocking: (v: boolean) => void) => {
    const [pin, setPin] = useState<string[]>(new Array(6).fill(''));
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);

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

    return { pin, setPin, error, shake, handlePinChange, verifyPin };
};
