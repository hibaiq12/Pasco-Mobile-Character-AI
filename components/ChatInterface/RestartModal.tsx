
import React from 'react';
import { RotateCcw, Cpu, Terminal, CheckCircle } from 'lucide-react';

interface RestartModalProps {
    show: boolean;
    isRestarting: boolean;
    isRebootSuccess: boolean;
    restartProgress: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export const RestartModal: React.FC<RestartModalProps> = ({
    show, isRestarting, isRebootSuccess, restartProgress, onConfirm, onCancel
}) => {
    if (!show && !isRestarting) return null;

    if (isRestarting) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 animate-fade-in select-none">
                {isRebootSuccess ? (
                    <div className="w-full max-w-md flex flex-col items-center animate-in zoom-in-50 duration-500">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.5)] animate-[pulse_1s_ease-in-out_infinite]">
                                <CheckCircle size={48} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                            </div>
                            <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-[0.2em] uppercase mb-2 animate-[pulse_2s_ease-in-out_infinite] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            System Restored
                        </h2>
                        <p className="text-cyan-400 font-mono text-sm tracking-widest">
                            MEMORY BANKS FLUSHED // READY
                        </p>
                        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-6"></div>
                    </div>
                ) : (
                    <div className="w-full max-w-md space-y-6 text-center">
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-spin-slow">
                            <Terminal size={40} className="text-cyan-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">System Rebooting</h2>
                            <p className="text-sm text-cyan-400/80 font-mono">Re-instancing Neural Pathways...</p>
                        </div>
                        <div className="space-y-2 text-left bg-zinc-900/50 p-4 rounded-xl border border-cyan-500/10 font-mono text-xs text-cyan-300/70 shadow-inner">
                            <p>> Terminating current session thread...</p>
                            <p className={restartProgress > 20 ? 'opacity-100 text-cyan-200' : 'opacity-30'}>> Flushing short-term memory buffer...</p>
                            <p className={restartProgress > 50 ? 'opacity-100 text-cyan-200' : 'opacity-30'}>> Calibrating personality matrix...</p>
                            <p className={restartProgress > 80 ? 'opacity-100 text-cyan-200' : 'opacity-30'}>> Establishing fresh link...</p>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-150 ease-linear relative" 
                                style={{ width: `${restartProgress}%` }}
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_white]"></div>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-cyan-500 tracking-widest">{restartProgress}% SYNCHRONIZED</span>
                    </div>
                )}
            </div>
        );
    }

    return (
      <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-blue-500/30 p-8 rounded-3xl w-[400px] shadow-[0_0_50px_rgba(59,130,246,0.2)] relative scale-100 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 animate-pulse">
                  <RotateCcw size={36} className="text-blue-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Reboot Simulation?</h3>
              <p className="text-sm text-zinc-400 text-center mb-8 leading-relaxed">
                  Are you sure you want to restart the chat? This will <span className="text-blue-400 font-bold">wipe the current session memory</span> and start fresh. Archived timelines will remain safe.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                  <button 
                      onClick={onConfirm} 
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 text-sm transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                      <Cpu size={16} /> Confirm Reboot
                  </button>
                  <button 
                      onClick={onCancel} 
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-xl text-sm transition-colors uppercase tracking-widest"
                  >
                      Cancel
                  </button>
              </div>
          </div>
      </div>
    );
};
