
import React, { useState, useEffect } from 'react';
import { Terminal, Lock, Unlock, DollarSign, Clock, CloudSun, Command, ChevronLeft, Send, Save, Sun, CloudRain, Wind, Moon } from 'lucide-react';
import { updateWalletBalance, setWalletBalance } from '../../services/smartphoneStorage';
import { Character } from '../../types';

interface CheatAppProps {
    onNavigate: (view: string) => void;
    activeCharacterId: string | null;
    participants: Character[];
    onCheat: (action: { type: string, value: any }) => void;
}

export const CheatApp: React.FC<CheatAppProps> = ({ onNavigate, activeCharacterId, participants, onCheat }) => {
    const [isLocked, setIsLocked] = useState(true);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    // Cheat States
    const [addMoneyAmount, setAddMoneyAmount] = useState('');
    const [setMoneyAmount, setSetMoneyAmount] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [selectedWeather, setSelectedWeather] = useState('Sunny');
    const [tempInput, setTempInput] = useState('');

    // Derived State for Guide
    const [activeCharName, setActiveCharName] = useState('Character');

    useEffect(() => {
        if (activeCharacterId) {
            const char = participants.find(p => p.id === activeCharacterId);
            if (char) {
                setActiveCharName(char.name);
            }
        }
    }, [activeCharacterId, participants]);

    const handlePinSubmit = () => {
        if (pin === '2026') {
            setIsLocked(false);
            setError('');
        } else {
            setError('ACCESS DENIED');
            setPin('');
        }
    };

    const handleAddMoney = () => {
        if (activeCharacterId && addMoneyAmount) {
            // FIX: Directly call storage service to update wallet and log transaction
            const success = updateWalletBalance(activeCharacterId, parseInt(addMoneyAmount), "CHEAT CODE: ADD_FUNDS", 'cheat');
            if (success) {
                setAddMoneyAmount('');
                alert("Funds injected successfully. Check Wallet.");
                // Trigger cheat event for parent to maybe refresh or log
                onCheat({ type: 'money', value: { amount: parseInt(addMoneyAmount), mode: 'add' } });
            } else {
                alert("Error: Transaction failed.");
            }
        }
    };

    const handleSetMoney = () => {
        if (activeCharacterId && setMoneyAmount) {
            // FIX: Directly call storage service to overwrite wallet
            const success = setWalletBalance(activeCharacterId, parseInt(setMoneyAmount));
            if (success) {
                setSetMoneyAmount('');
                alert("Balance overwritten. Check Wallet.");
                onCheat({ type: 'money', value: { amount: parseInt(setMoneyAmount), mode: 'set' } });
            } else {
                alert("Error: Transaction failed.");
            }
        }
    };

    const handleSetTime = () => {
        if (timeInput) {
            onCheat({ type: 'time', value: timeInput });
            setTimeInput('');
            alert("Temporal Shift Executed.");
        }
    };

    const handleSetWeather = () => {
        onCheat({ 
            type: 'weather', 
            value: { condition: selectedWeather, temp: tempInput ? parseInt(tempInput) : 28 } 
        });
        alert("Atmospheric Override Active.");
    };

    if (isLocked) {
        return (
            <div className="h-full flex flex-col bg-black font-mono text-green-500 p-8 items-center justify-center relative z-20">
                <div className="absolute top-4 left-4">
                    <button onClick={() => onNavigate('home')} className="text-green-800 hover:text-green-500"><ChevronLeft/></button>
                </div>
                <Lock size={48} className="mb-6 animate-pulse" />
                <h2 className="text-xl font-bold mb-8 tracking-widest border-b border-green-900 pb-2">SECURE TERMINAL</h2>
                
                <input 
                    type="password" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={4}
                    placeholder="ENTER PIN"
                    className="bg-zinc-900 border border-green-900 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] text-green-400 focus:border-green-500 outline-none w-full max-w-[200px] mb-4 placeholder-green-900"
                />
                
                <button 
                    onClick={handlePinSubmit}
                    className="w-full max-w-[200px] bg-green-900/20 border border-green-800 hover:bg-green-900/40 text-green-400 py-3 rounded hover:text-green-300 transition-all uppercase font-bold text-sm tracking-wider"
                >
                    Authenticate
                </button>

                {error && <p className="mt-6 text-red-500 font-bold animate-pulse">{error}</p>}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-950 font-mono text-green-400 relative z-20 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-green-900/50 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-10">
                <button onClick={() => onNavigate('home')} className="text-green-700 hover:text-green-400"><ChevronLeft/></button>
                <div className="flex items-center gap-2">
                    <Terminal size={16} />
                    <span className="font-bold tracking-wider text-sm">DEV_CONSOLE</span>
                </div>
                <div className="w-6"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                
                {/* Economy Section */}
                <section className="border border-green-900/50 rounded-xl p-4 bg-green-950/5">
                    <h3 className="text-xs font-bold text-green-600 uppercase mb-3 flex items-center gap-2">
                        <DollarSign size={12}/> Economy Protocol
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={addMoneyAmount}
                                onChange={(e) => setAddMoneyAmount(e.target.value)}
                                placeholder="Amount"
                                className="flex-1 bg-black border border-green-900/50 rounded px-3 py-2 text-sm focus:border-green-500 outline-none"
                            />
                            <button onClick={handleAddMoney} className="bg-green-900/30 border border-green-800 text-green-400 px-3 py-2 rounded hover:bg-green-800/50 text-xs font-bold">ADD</button>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={setMoneyAmount}
                                onChange={(e) => setSetMoneyAmount(e.target.value)}
                                placeholder="Set Balance"
                                className="flex-1 bg-black border border-green-900/50 rounded px-3 py-2 text-sm focus:border-green-500 outline-none"
                            />
                            <button onClick={handleSetMoney} className="bg-green-900/30 border border-green-800 text-green-400 px-3 py-2 rounded hover:bg-green-800/50 text-xs font-bold">SET</button>
                        </div>
                    </div>
                </section>

                {/* World Section */}
                <section className="border border-green-900/50 rounded-xl p-4 bg-green-950/5">
                    <h3 className="text-xs font-bold text-green-600 uppercase mb-3 flex items-center gap-2">
                        <Clock size={12}/> World State
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Time */}
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={timeInput}
                                onChange={(e) => setTimeInput(e.target.value)}
                                placeholder="YYYY:MM:DD:HH:MM"
                                className="flex-1 bg-black border border-green-900/50 rounded px-3 py-2 text-sm focus:border-green-500 outline-none"
                            />
                            <button onClick={handleSetTime} className="bg-green-900/30 border border-green-800 text-green-400 px-3 py-2 rounded hover:bg-green-800/50 text-xs font-bold">WARP</button>
                        </div>

                        {/* Weather */}
                        <div className="grid grid-cols-2 gap-2">
                            <select 
                                value={selectedWeather}
                                onChange={(e) => setSelectedWeather(e.target.value)}
                                className="bg-black border border-green-900/50 rounded px-2 py-2 text-sm focus:border-green-500 outline-none text-green-400"
                            >
                                <option value="Sunny">Sunny ☀️</option>
                                <option value="Rainy">Rainy 🌧️</option>
                                <option value="Stormy">Stormy ⛈️</option>
                                <option value="Cloudy">Cloudy ☁️</option>
                                <option value="Snowy">Snowy ❄️</option>
                            </select>
                            <input 
                                type="number" 
                                value={tempInput}
                                onChange={(e) => setTempInput(e.target.value)}
                                placeholder="Temp °C"
                                className="bg-black border border-green-900/50 rounded px-3 py-2 text-sm focus:border-green-500 outline-none"
                            />
                        </div>
                        <button onClick={handleSetWeather} className="w-full bg-green-900/30 border border-green-800 text-green-400 py-2 rounded hover:bg-green-800/50 text-xs font-bold flex items-center justify-center gap-2">
                            <CloudSun size={12} /> FORCE ATMOSPHERE
                        </button>
                    </div>
                </section>

                {/* Command Guide */}
                <section className="border border-green-900/50 rounded-xl p-4 bg-green-950/5">
                    <h3 className="text-xs font-bold text-green-600 uppercase mb-3 flex items-center gap-2">
                        <Command size={12}/> Slash Command Manual
                    </h3>
                    <div className="text-[10px] text-green-500/80 space-y-3 font-mono leading-relaxed bg-black/40 p-3 rounded border border-green-900/30">
                        <div>
                            <span className="text-green-300 font-bold block mb-1">Give Item</span>
                            <div className="bg-green-900/20 px-2 py-1 rounded">
                                {`/give ${activeCharName} <Item Name>`}
                            </div>
                        </div>
                        <div>
                            <span className="text-green-300 font-bold block mb-1">Get Money</span>
                            <div className="bg-green-900/20 px-2 py-1 rounded">
                                {`/getmoney ${activeCharName} <Nominal> <Message(Opsional)>`}
                            </div>
                        </div>
                        <div>
                            <span className="text-green-300 font-bold block mb-1">Gift</span>
                            <div className="bg-green-900/20 px-2 py-1 rounded">
                                {`/gift ${activeCharName} <Item Name>`}
                            </div>
                        </div>
                        <div className="pt-2 border-t border-green-900/30 italic opacity-70 text-[9px]">
                            *Note: Commands are case-sensitive relative to the active persona ID.
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};
