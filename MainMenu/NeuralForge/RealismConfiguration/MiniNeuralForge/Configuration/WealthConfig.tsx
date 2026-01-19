
import React from 'react';
import { Slider, InputField } from '../../SharedComponents';
import { DollarSign, CreditCard, TrendingUp } from 'lucide-react';

interface WealthConfigProps {
    data: any;
    onChange: (key: string, value: any) => void;
}

export const WealthConfig: React.FC<WealthConfigProps> = ({ data, onChange }) => {
    const wealthLevel = data.wealthLevel || 50;
    
    const getWealthLabel = (val: number) => {
        if (val < 20) return "Destitute / Debt";
        if (val < 40) return "Lower Class";
        if (val < 60) return "Middle Class";
        if (val < 80) return "Upper Class";
        return "Ultra Rich / Elite";
    };

    return (
        <div className="space-y-6 animate-fade-in w-full">
            {/* Status Card - Responsive Height */}
            <div className="bg-gradient-to-br from-emerald-900/40 to-zinc-900 border border-emerald-500/20 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-lg">
                <div className="absolute -right-6 -top-6 text-emerald-500/10 pointer-events-none">
                    <DollarSign size={120} />
                </div>
                
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CreditCard size={14} /> Financial Status
                </h3>
                <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {getWealthLabel(wealthLevel)}
                </p>
                <p className="text-[10px] md:text-xs text-emerald-200/60 mt-2 max-w-md">
                    Determines starting wallet balance, inventory quality, and reaction to prices.
                </p>
            </div>

            {/* Controls - Adaptive Grid */}
            <div className="bg-zinc-900/30 p-5 md:p-6 rounded-3xl border border-white/5 space-y-6 md:space-y-8">
                
                <Slider 
                    label="Economic Tier"
                    value={wealthLevel}
                    onChange={(v) => onChange('wealthLevel', v)}
                    leftLabel="Poverty"
                    rightLabel="Opulence"
                    accentColor="emerald"
                    insight="Higher tiers unlock luxury responses."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Spending Habit Selector */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                            <TrendingUp size={12} /> Spending Habit
                        </label>
                        <div className="flex bg-black/40 p-1.5 rounded-xl border border-emerald-900/30 gap-1">
                            {['Frugal', 'Balanced', 'Lavish'].map((habit) => (
                                <button
                                    key={habit}
                                    onClick={() => onChange('spendingHabit', habit)}
                                    className={`
                                        flex-1 py-2.5 text-[10px] font-bold uppercase rounded-lg transition-all
                                        ${data.spendingHabit === habit 
                                            ? 'bg-emerald-600 text-white shadow-md' 
                                            : 'text-zinc-500 hover:text-emerald-400 hover:bg-white/5'}
                                    `}
                                >
                                    {habit}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Assets Input */}
                    <div className="w-full">
                        <InputField 
                            labelKey="Assets (Vehicle/Property)" 
                            value={data.assets || ''}
                            onChange={(v) => onChange('assets', v)}
                            placeholderKey="e.g. Private Jet, Old Bicycle"
                            tooltipKey="Visual indicator of wealth in narrative."
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
