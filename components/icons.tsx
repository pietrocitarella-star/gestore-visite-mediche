// FIX: Export FileDown to resolve import error in App.tsx. Renamed imported FileDown to FileDownFromLucide to avoid naming conflicts.
import { Plus, Edit2, Trash2, X, FileDown as FileDownFromLucide, Bot, Activity, FileText, Microscope, LayoutDashboard, Pencil, Copy, FileUp, Users, CalendarCheck } from 'lucide-react';

export const PlusIcon = () => <Plus className="h-5 w-5" />;
export const EditIcon = () => <Edit2 size={18} />;
export const TrashIcon = () => <Trash2 size={18} />;
export const XIcon = () => <X className="h-6 w-6" />;
export const DownloadIcon = () => <FileDownFromLucide className="h-5 w-5" />;
export const BotIcon = () => <Bot className="mr-2 h-5 w-5" />;
export const DashboardIcon = () => <LayoutDashboard className="mr-2 h-5 w-5" />;
export const VisitsIcon = () => <FileText className="mr-2 h-5 w-5" />;
export const ExamsIcon = () => <Microscope className="mr-2 h-5 w-5" />;
export const ActivityIcon = () => <Activity className="h-6 w-6 text-white" />;
export const PencilIcon = () => <Pencil size={16} />;
export const CopyIcon = () => <Copy size={16} />;
export const UploadIcon = () => <FileUp className="h-5 w-5" />;
export const SpecialistsIcon = () => <Users className="mr-2 h-5 w-5" />;
export const CalendarCheckIcon = () => <CalendarCheck className="h-6 w-6" />;
export const FileDown = FileDownFromLucide;