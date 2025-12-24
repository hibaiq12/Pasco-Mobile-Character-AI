
import { useState, useEffect } from 'react';

export const useUpdateLogic = (onComplete: () => void) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 1000);
                    return 100;
                }
                const inc = Math.random() * 5 + 1;
                return Math.min(100, prev + inc);
            });
        }, 150);
        return () => clearInterval(interval);
    }, [onComplete]);

    return { progress };
};
