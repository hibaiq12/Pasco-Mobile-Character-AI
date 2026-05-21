
import { useState, useEffect } from 'react';
import { ViewState } from '../../../../../types';

export const usePreviewLogic = (onBypass: (view: ViewState) => void) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isBooting, setIsBooting] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const bootTimer = setTimeout(() => setIsBooting(false), 800);
        return () => {
            clearInterval(timer);
            clearTimeout(bootTimer);
        };
    }, []);

    const handleBypassAction = (target: ViewState) => {
        // Trigger haptic if on mobile (simulated)
        if (window.navigator.vibrate) window.navigator.vibrate(10);
        onBypass(target);
    };

    return {
        currentTime,
        isBooting,
        handleBypassAction
    };
};
