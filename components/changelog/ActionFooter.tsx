
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Download, Database, Activity, Wifi, Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { t } from '../../services/translationService';
import { getSettings, importData, restoreSystemData } from '../../services/storageService';

interface ActionFooterProps {
    onClaim: () => void;
    forceUnlock?: boolean;
}

export const ActionFooter: React.FC<ActionFooterProps> = ({ onClaim, forceUnlock = false }) => {
    const [timer, setTimer] = useState(15);
    const [statusText, setStatusText] = useState("INITIALIZING");
    const [isImporting, setIsImporting] = useState(false); // New Loading State
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (forceUnlock) {
            setTimeout(() => setTimer(0), 0);
            return;
        }

        const settings = getSettings();
        if (settings.disableChangelogTimer) {
            setTimeout(() => setTimer(0), 0);
            return;
        }

        const statuses = ["HANDSHAKING", "DECRYPTING", "SYNCING", "OPTIMIZING", "FINALIZING"];

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                const statusIndex = Math.min(4, Math.floor((15 - prev) / 3));
                setStatusText(statuses[statusIndex]);
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [forceUnlock]); 

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsImporting(true);
            try {
                const data = await importData(file);
                if (data) {
                    restoreSystemData(data);
                    onClaim();
                    // Small delay to show success state implicitly before reload
                    setTimeout(() => window.location.reload(), 500);
                }
            } catch (err) {
                alert("Failed to import data.");
                setIsImporting(false);
            }
        }
        // Reset input
        e.target.value = '';
    };

    const isReady = timer <= 0;
    const progressPercent = Math.min(100, Math.floor(((15 - timer) / 15) * 100));

    return (
        <div className="w-full bg-black/80 border-t border-white/5 backdrop-blur-xl relative overflow-hidden flex flex-col shrink-0 z-50">
            {/* Top Highlight Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>

            <div className="p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* LEFT: STATUS INDICATOR (Always Visible) */}
                <div className="w-full md:flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            {isReady ? (
                                <CheckCircle2 size={14} className="text-emerald-400" />
                            ) : (
                                <Activity size={14} className="text-emerald-500 animate-pulse" />
                            )}
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
                                {isReady ? "SYSTEM READY" : statusText}
                            </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-600">
                            {progressPercent}%
                        </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                        <div 
                            className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-300 ease-linear"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute top-0 right-0 h-full w-[2px] bg-white shadow-[0_0_5px_white]"></div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: ACTION BUTTONS (Responsive Grid) */}
                <div className="w-full md:w-auto flex gap-3 transition-all duration-500">
                    
                    {/* Secondary: Import Button - ALWAYS ENABLED with Loading State */}
                    <button 
                        onClick={() => !isImporting && fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold py-3 px-5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all text-[10px] uppercase tracking-wider group disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Import Backup"
                    >
                        {isImporting ? <Loader2 size={14} className="animate-spin text-blue-400" /> : <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" />}
                        <span>{isImporting ? "Loading..." : "Import"}</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json,.psc" />

                    {/* Primary: Update Button - BLOCKED BY TIMER */}
                    <button 
                        onClick={onClaim}
                        className={`
                            flex-[2] md:flex-none font-black py-3 px-8 rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest group whitespace-nowrap
                            ${isReady 
                                ? 'bg-white hover:bg-blue-50 text-black active:scale-95 cursor-pointer' 
                                : 'bg-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed'}
                        `}
                        disabled={!isReady || isImporting}
                    >
                        {isReady ? (
                            <>{t('changelog.update')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                        ) : (
                            <><Cpu size={14} className="animate-spin" /> {t('changelog.wait')} ({timer}s)</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
