
import { Settings, MessageSquare, Zap, AppWindow, ShieldAlert, CloudDownload, Timer, Binary, LayoutTemplate, LucideIcon } from 'lucide-react';
import { ViewState } from '../../../../../types';

export interface PreviewModule {
    id: string;
    label: string;
    desc: string;
    icon: LucideIcon;
    target: ViewState;
    color: string;
    glow: string;
}

export const PREVIEW_COLUMNS: { title: string; icon: LucideIcon; color: string; modules: PreviewModule[] }[] = [
    {
        title: "Communication Protocols",
        icon: MessageSquare,
        color: "text-blue-400",
        modules: [
            {
                id: 'chat_pasco',
                label: 'PascoAI Chat',
                desc: 'Direct Neural Link with Core OS',
                icon: Zap,
                target: ViewState.PREVIEW, // Internal state handling in UI
                color: 'text-amber-400',
                glow: 'shadow-amber-500/20'
            },
            {
                id: 'settings_apps',
                label: 'Settings Apps',
                desc: 'System Configuration & Tools',
                icon: Settings,
                target: ViewState.PREVIEW, // Internal state handling in UI
                color: 'text-cyan-400',
                glow: 'shadow-cyan-500/20'
            },
            {
                id: 'popup_card',
                label: 'Pop Up Card',
                desc: 'System Alerts & Announcements',
                icon: AppWindow,
                target: ViewState.PREVIEW, // Internal state handling in UI
                color: 'text-purple-400',
                glow: 'shadow-purple-500/20'
            }
        ]
    },
    {
        title: "Screen Protocols",
        icon: LayoutTemplate,
        color: "text-red-400",
        modules: [
            {
                id: 'maintenance_screen',
                label: 'Maintenance Screen',
                desc: 'System Lockdown Interface',
                icon: ShieldAlert,
                target: ViewState.PREVIEW,
                color: 'text-orange-500',
                glow: 'shadow-orange-500/20'
            },
            {
                id: 'update_screen',
                label: 'Update Screen',
                desc: 'Patch Installation Simulation',
                icon: CloudDownload,
                target: ViewState.PREVIEW,
                color: 'text-blue-500',
                glow: 'shadow-blue-500/20'
            },
            {
                id: 'countdown_screen',
                label: 'Countdown Screen',
                desc: 'Event Launch Timer',
                icon: Timer,
                target: ViewState.PREVIEW,
                color: 'text-fuchsia-500',
                glow: 'shadow-fuchsia-500/20'
            },
            {
                id: 'pas_screen',
                label: 'Pas Screen',
                desc: 'Primary Bootloader',
                icon: Binary,
                target: ViewState.PREVIEW,
                color: 'text-white',
                glow: 'shadow-white/20'
            }
        ]
    }
];

export const SYSTEM_STATS: unknown[] = [];
