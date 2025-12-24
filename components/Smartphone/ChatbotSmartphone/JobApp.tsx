
import React from 'react';
import { CharacterPhoneData } from '../../../services/smartphoneStorage';
import { JOBS_DATA, botToggleJob } from '../../../services/ChatbotSmartphoneStorage';
import { ChevronLeft, Briefcase, Clock, CheckCircle } from 'lucide-react';

interface JobAppProps {
    phoneData: CharacterPhoneData | null;
    activeCharacterId: string | null; // This is the base ID
    onNavigate: (view: string) => void;
    refreshData: () => void;
}

export const JobApp: React.FC<JobAppProps> = ({ phoneData, activeCharacterId, onNavigate, refreshData }) => {
    
    const handleToggle = (jobId: string) => {
        if (activeCharacterId) {
            botToggleJob(activeCharacterId, jobId); // Use Bot-specific toggle
            refreshData();
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="h-full flex flex-col bg-zinc-50 animate-fade-in relative z-10 font-sans">
             <div className="px-6 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-100">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => onNavigate('home')} className="p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <span className="text-sm font-bold tracking-wider text-zinc-900 uppercase">Bot JobHub</span>
                </div>
                <h2 className="text-2xl font-black text-zinc-900 leading-none">Manage Persona<br/>Employment</h2>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 custom-scrollbar">
                {JOBS_DATA.map(job => {
                    const isApplied = phoneData?.activeJobs.includes(job.id);
                    return (
                        <div key={job.id} className={`group p-4 rounded-2xl shadow-sm border transition-all duration-300 ${isApplied ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg text-white shadow-md ${job.color}`}>
                                        {job.icon}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-sm ${isApplied ? 'text-white' : 'text-zinc-900'}`}>{job.title}</h3>
                                        <p className="text-xs text-zinc-500 font-medium">{job.company}</p>
                                    </div>
                                </div>
                                {isApplied && <CheckCircle size={18} className="text-green-500" />}
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                                 <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100/10 border border-zinc-500/20">
                                    <Clock size={10} className="text-zinc-500" />
                                    <span className="text-[10px] font-mono text-zinc-500 font-bold">
                                        {job.startHour.toString().padStart(2, '0')}:00 - {job.endHour.toString().padStart(2, '0')}:00
                                    </span>
                                 </div>
                                 <button 
                                    onClick={() => handleToggle(job.id)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${isApplied ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`}
                                 >
                                    {isApplied ? 'Quit' : 'Assign'}
                                 </button>
                            </div>
                        </div>
                    );
                })}
             </div>
        </div>
    );
};
