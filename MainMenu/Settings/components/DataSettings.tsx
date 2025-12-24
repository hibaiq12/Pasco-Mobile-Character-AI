
import React from 'react';
import { Download, Upload, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import { t } from '../../../services/translationService';

interface DataSettingsProps {
    exportName: string;
    setExportName: (name: string) => void;
    handleExport: () => void;
    onImportClick: () => void;
    onNukeClick: () => void;
    isResetting: boolean;
}

export const DataSettings: React.FC<DataSettingsProps> = ({ 
    exportName, setExportName, handleExport, onImportClick, onNukeClick, isResetting 
}) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-semibold text-white mb-2">{t('set.mem.title')}</h2>
                <p className="text-zinc-500 text-sm">{t('set.mem.desc')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="p-3 bg-zinc-900 rounded-xl text-zinc-400 shrink-0">
                            <Download size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-200">{t('set.mem.export')}</h3>
                            <p className="text-xs text-zinc-500">Download JSON of all characters & chats</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input 
                            type="text" 
                            value={exportName}
                            onChange={(e) => setExportName(e.target.value)}
                            placeholder="pasco_backup"
                            className="w-full sm:w-40 bg-black/20 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500/50 outline-none transition-colors placeholder-zinc-600"
                        />
                        <Button variant="secondary" onClick={handleExport}>Export</Button>
                    </div>
                </div>

                <div className="p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900 rounded-xl text-zinc-400">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-200">{t('set.mem.import')}</h3>
                            <p className="text-xs text-zinc-500">Restore characters & chat history</p>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={onImportClick}>Import</Button>
                </div>

                <div className="p-6 bg-red-950/10 rounded-2xl border border-red-500/20 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-red-900/20 rounded-xl text-red-500">
                            {isResetting ? <Loader2 size={24} className="animate-spin"/> : <Trash2 size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-red-400">{t('set.mem.reset')}</h3>
                            <p className="text-xs text-red-400/60">{isResetting ? "Purging system..." : "Irreversible data wipe"}</p>
                        </div>
                    </div>
                    <Button variant="danger" onClick={onNukeClick} className="relative z-10" disabled={isResetting}>
                        {isResetting ? "Purging..." : "Nuke Data"}
                    </Button>
                </div>
            </div>
            
            <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-300 leading-relaxed text-center">
                    <strong>Privacy Note:</strong> Pasco stores all your conversation data locally in your browser's storage. We do not transmit your logs to any external server other than Google Gemini API for processing.
                </p>
            </div>
        </div>
    );
};
