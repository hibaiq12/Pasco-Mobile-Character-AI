
import React, { useState } from 'react';
import { JOBS_DATA, CharacterPhoneData, toggleJobApplication } from '../../services/smartphoneStorage';
import { ChevronLeft, Clock, Search, Briefcase, MapPin, Filter, MoreHorizontal } from 'lucide-react';

interface JobAppProps {
    phoneData: CharacterPhoneData | null;
    activeCharacterId: string | null;
    onNavigate: (view: string) => void;
    refreshData: () => void;
}

export const JobApp: React.FC<JobAppProps> = ({ phoneData, activeCharacterId, onNavigate, refreshData }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleJobToggle = (jobId: string) => {
        if (activeCharacterId) {
            toggleJobApplication(activeCharacterId, jobId);
            refreshData();
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    // Filter jobs based on search
    const filteredJobs = JOBS_DATA.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-zinc-50 animate-fade-in relative z-10 font-sans">
             {/* Modern Minimal Header */}
             <div className="px-6 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-100">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => onNavigate('home')} className="p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <span className="text-sm font-bold tracking-wider text-zinc-900 uppercase">JobHub</span>
                    <button className="p-2 -mr-2 rounded-full hover:bg-zinc-100 text-zinc-400">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-none">Find your<br/>next chapter.</h2>
                    
                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" size={18} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search role or company..."
                            className="w-full bg-zinc-100 border-none rounded-2xl pl-10 pr-4 py-3.5 text-sm font-medium text-zinc-800 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-black/5 transition-all"
                        />
                    </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 custom-scrollbar">
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{filteredJobs.length} Positions</span>
                    <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium cursor-pointer hover:text-zinc-800 transition-colors">
                        <Filter size={12} /> Filter
                    </div>
                </div>

                {filteredJobs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                        <Briefcase size={32} className="mb-2 opacity-20" />
                        <p className="text-xs font-medium">No jobs found.</p>
                    </div>
                )}

                {filteredJobs.map(job => {
                    const isApplied = phoneData?.activeJobs.includes(job.id);
                    return (
                        <div key={job.id} className="group bg-white p-5 rounded-[1.5rem] shadow-sm border border-zinc-100 hover:shadow-lg hover:border-zinc-200 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-white shadow-lg shadow-black/5 ${job.color}`}>
                                        {job.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900 text-base leading-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                        <p className="text-xs text-zinc-500 font-medium mt-0.5">{job.company}</p>
                                    </div>
                                </div>
                                {isApplied && (
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-5">
                                <span className="px-2.5 py-1 rounded-lg bg-zinc-50 text-[10px] font-bold text-zinc-500 uppercase tracking-wide border border-zinc-100">
                                    {job.type}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-zinc-50 text-[10px] font-bold text-zinc-500 uppercase tracking-wide border border-zinc-100">
                                    {job.level}
                                </span>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-500">
                                    <Clock size={10} />
                                    {job.startHour.toString().padStart(2, '0')}:00 - {job.endHour.toString().padStart(2, '0')}:00
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-zinc-50 pt-4">
                                 <div>
                                     <span className="text-lg font-black text-zinc-900 tracking-tight">
                                        {formatCurrency(job.salaryDaily)}
                                     </span>
                                     <span className="text-[10px] text-zinc-400 font-medium ml-1">/ day</span>
                                 </div>
                                 <button 
                                    onClick={() => handleJobToggle(job.id)}
                                    className={`
                                        px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95
                                        ${isApplied 
                                            ? 'bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-500' 
                                            : 'bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/10'}
                                    `}
                                 >
                                    {isApplied ? 'Resign' : 'Apply Now'}
                                 </button>
                            </div>
                        </div>
                    );
                })}
             </div>
        </div>
    );
};
