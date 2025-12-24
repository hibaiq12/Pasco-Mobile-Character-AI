import { useState, useEffect, useRef } from 'react';

export const useUpdateLogic = (onComplete: () => void) => {
    const [progress, setProgress] = useState(0);
    const [targetProgress, setTargetProgress] = useState(75); // Initial stall point
    const [isFinishing, setIsFinishing] = useState(false);
    // Fix: Use number for timer handle instead of NodeJS.Timeout to avoid namespace errors in browser environments
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const step = () => {
            setProgress(prev => {
                if (prev >= targetProgress) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    
                    // If we were finishing and reached 100, trigger the final callback
                    if (prev >= 100) {
                        setTimeout(onComplete, 800);
                        return 100;
                    }
                    return targetProgress;
                }

                // Random increment logic
                const diff = targetProgress - prev;
                const inc = isFinishing 
                    ? (Math.random() * 2 + 1) // Faster at the end
                    : (diff > 10 ? Math.random() * 1.5 : Math.random() * 0.2); // Slower as it nears 75
                
                return Math.min(targetProgress, prev + inc);
            });
        };

        // Fix: Use window.setInterval to ensure a numeric handle is returned
        timerRef.current = window.setInterval(step, 50);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [targetProgress, isFinishing, onComplete]);

    const completeUpdate = () => {
        setIsFinishing(true);
        setTargetProgress(100);
    };

    return { progress, completeUpdate, isFinishing };
};
