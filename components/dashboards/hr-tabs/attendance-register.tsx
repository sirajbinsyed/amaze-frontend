// "use client"

// import { useState, useMemo } from "react"
// import { useToast } from "@/components/ui/use-toast"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

// // --- ICONS ---
// import {
//   Clock, Calendar, CheckCircle, XCircle, AlertTriangle, User, Loader2, CalendarOff, Filter, XCircle as ClearFilterIcon, AlertCircle, Edit, X, Clock10
// } from "lucide-react"

// // --- API & TYPE DEFINITIONS (Scoped to this component) ---
// import { ActiveStaff, Attendance } from "@/lib/hr"

// interface AttendanceUpdatePayload {
//     id: number; 
//     staff_id: number;
//     date: string;
//     checkin_time?: string | null;
//     checkout_time?: string | null;
//     status?: string;
// }

// type ComprehensiveAttendance = Attendance & {
//     id: number | string; // Allows string IDs for synthetic records
// };

// // --- CONSTANTS ---
// const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'leave', 'half_day'];
// const STATUS_PRIORITY: Record<string, number> = {
//     'present': 1, 'late': 2, 'half_day': 3, 'leave': 4, 'absent': 5, 'unknown': 99,
// };

// // --- HELPER FUNCTIONS ---
// const getTodayDateString = () => new Date().toISOString().split('T')[0];

// const formatTimeFromISO = (isoString: string | null | undefined): string => {
//     if (!isoString) return 'N/A';
//     try {
//         const date = new Date(isoString);
//         return isNaN(date.getTime()) ? 'N/A' : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//     } catch {
//         return 'N/A';
//     }
// };

// const getAttendanceStatusBadge = (status: string | null) => {
//     const safeStatus = status?.toLowerCase() || 'unknown';
//     let color: string;
//     let Icon: React.ElementType;
//     let label: string = safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

//     switch (safeStatus) {
//         case 'present': color = 'bg-green-100 text-green-800'; Icon = CheckCircle; break;
//         case 'late': color = 'bg-yellow-100 text-yellow-800'; Icon = AlertTriangle; break;
//         case 'absent': color = 'bg-red-100 text-red-800'; Icon = XCircle; break;
//         case 'leave': color = 'bg-blue-100 text-blue-800'; Icon = CalendarOff; break;
//         case 'half_day': color = 'bg-indigo-100 text-indigo-800'; Icon = Clock10; label = 'Half Day'; break;
//         default: color = 'bg-gray-100 text-gray-800'; Icon = Clock; label = status || 'N/A';
//     }

//     return (
//         <Badge className={`capitalize ${color} font-medium`}>
//             <Icon className="h-3 w-3 mr-1" /> {label}
//         </Badge>
//     );
// };

// // =============================================================
// // SUB-COMPONENT 1: ATTENDANCE EDIT MODAL
// // =============================================================
// interface AttendanceEditModalProps {
//     record: ComprehensiveAttendance;
//     staffs: ActiveStaff[];
//     isOpen: boolean;
//     onClose: () => void;
//     onUpdate: (payload: AttendanceUpdatePayload) => Promise<void>;
// }

// const AttendanceEditModal: React.FC<AttendanceEditModalProps> = ({ record, staffs, isOpen, onClose, onUpdate }) => {
//     const { toast } = useToast();
//     const isRealRecord = typeof record.id === 'number';

//     if (!isOpen || !isRealRecord) return null;

//     const staff = staffs.find(s => s.id === record.staff_id);
//     const [checkInTime, setCheckInTime] = useState(record.checkin_time ? new Date(record.checkin_time).toTimeString().slice(0, 5) : '');
//     const [checkOutTime, setCheckOutTime] = useState(record.checkout_time ? new Date(record.checkout_time).toTimeString().slice(0, 5) : '');
//     const [status, setStatus] = useState(record.status || 'present');
//     const [isSaving, setIsSaving] = useState(false);

//     const handleSave = async () => {
//         setIsSaving(true);
//         const timeToISO = (time: string | null): string | null => {
//             if (!time) return null;
//             const [hours, minutes] = time.split(':').map(Number);
//             const date = new Date(record.date);
//             date.setHours(hours, minutes, 0, 0);
//             return date.toISOString();
//         };

//         if (!timeToISO(checkInTime) && !['absent', 'leave'].includes(status)) {
//             toast({ description: "Check-in time is required unless status is Absent or Leave.", variant: "destructive" });
//             setIsSaving(false);
//             return;
//         }

//         const payload: AttendanceUpdatePayload = {
//             id: record.id as number,
//             staff_id: record.staff_id,
//             date: record.date,
//             checkin_time: timeToISO(checkInTime),
//             checkout_time: timeToISO(checkOutTime),
//             status: status,
//         };

//         try {
//             await onUpdate(payload);
//             onClose();
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     return (
//         <Dialog open={isOpen} onOpenChange={onClose}>
//             <DialogContent className="sm:max-w-[425px]">
//                 <DialogHeader>
//                     <DialogTitle>Edit Attendance Record</DialogTitle>
//                     <DialogDescription>Modifying details for {staff?.name || '...'} on {record.date}.</DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                     <div className="space-y-1">
//                         <label className="text-sm font-medium">Status</label>
//                         <Select value={status} onValueChange={setStatus}>
//                             <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
//                             <SelectContent>
//                                 {ATTENDANCE_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                     <div className="space-y-1">
//                         <label className="text-sm font-medium">Clock In Time</label>
//                         <Input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
//                     </div>
//                     <div className="space-y-1">
//                         <label className="text-sm font-medium">Clock Out Time (Optional)</label>
//                         <Input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
//                     </div>
//                 </div>
//                 <DialogFooter>
//                     <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
//                     <Button onClick={handleSave} disabled={isSaving}>
//                         {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                         {isSaving ? 'Saving...' : 'Save Changes'}
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// };

// // =============================================================
// // SUB-COMPONENT 2: ATTENDANCE REGISTER SECTION
// // =============================================================
// interface AttendanceRegisterSectionProps {
//     data: ComprehensiveAttendance[];
//     isFiltered: boolean;
//     onEdit: (record: ComprehensiveAttendance) => void;
// }

// const AttendanceRegisterSection: React.FC<AttendanceRegisterSectionProps> = ({ data, isFiltered, onEdit }) => {
//     const groupedData = useMemo(() => {
//         const groups = data.reduce((acc, record) => {
//             const dateStr = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
//             if (!acc[dateStr]) acc[dateStr] = [];
//             acc[dateStr].push(record);
//             return acc;
//         }, {} as Record<string, ComprehensiveAttendance[]>);

//         for (const date in groups) {
//             groups[date].sort((a, b) => (STATUS_PRIORITY[a.status || ''] || 99) - (STATUS_PRIORITY[b.status || ''] || 99) || (a.staff_name || '').localeCompare(b.staff_name || ''));
//         }
//         return groups;
//     }, [data]);

//     const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

//     if (data.length === 0) {
//         return (
//             <div className="text-center py-10">
//                 <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
//                 <p className="text-gray-500">{isFiltered ? "No records match the current filter criteria." : "No attendance history available."}</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {sortedDates.map((dateStr) => (
//                 <Card key={dateStr}>
//                     <CardHeader className="bg-gray-50 border-b">
//                         <CardTitle className="flex items-center text-lg font-bold text-gray-700">
//                             <Calendar className="h-5 w-5 mr-3 text-blue-600" />
//                             Attendance for {dateStr}
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent className="p-0">
//                         <div className="hidden sm:grid grid-cols-7 text-xs font-semibold uppercase text-gray-500 bg-gray-100 py-3 px-6 border-b">
//                             <div className="col-span-2">Staff Member</div>
//                             <div>Role</div>
//                             <div>Clock In</div>
//                             <div>Clock Out</div>
//                             <div className="text-center">Status</div>
//                             <div className="text-right">Actions</div>
//                         </div>
//                         {groupedData[dateStr].map((record) => {
//                             const isSynthetic = typeof record.id !== 'number';
//                             return (
//                                 <div key={record.id} className={`grid grid-cols-3 sm:grid-cols-7 items-center gap-2 sm:gap-4 p-4 border-b ${isSynthetic ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
//                                     <div className="col-span-2 font-medium">{record.staff_name || '...'}</div>
//                                     <div className="hidden sm:block text-sm text-gray-600">{record.staff_role || 'N/A'}</div>
//                                     <div className="text-sm hidden sm:block">{isSynthetic ? 'N/A' : formatTimeFromISO(record.checkin_time)}</div>
//                                     <div className="text-sm hidden sm:block">{isSynthetic ? 'N/A' : formatTimeFromISO(record.checkout_time)}</div>
//                                     <div className="col-span-1 text-center hidden sm:block">{getAttendanceStatusBadge(record.status)}</div>
//                                     <div className="col-span-1 flex justify-end">
//                                         <Button variant="ghost" size="sm" onClick={() => onEdit(record)} title={isSynthetic ? "Cannot edit synthetic record." : "Edit"} disabled={isSynthetic}>
//                                             {isSynthetic ? <X className="h-4 w-4 text-gray-300" /> : <Edit className="h-4 w-4 text-blue-500" />}
//                                         </Button>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </CardContent>
//                 </Card>
//             ))}
//         </div>
//     );
// };

// // =============================================================
// // MAIN PAGE COMPONENT
// // =============================================================
// interface AttendanceRegisterPageProps {
//     attendanceRecords: Attendance[];
//     staffs: ActiveStaff[];
//     isLoading: boolean;
//     onUpdateRecord: (payload: AttendanceUpdatePayload) => Promise<void>;
// }

// export function AttendanceRegisterPage({ attendanceRecords, staffs, isLoading, onUpdateRecord }: AttendanceRegisterPageProps) {
//     const { toast } = useToast();
//     const [filterDate, setFilterDate] = useState<string>('');
//     const [filterStaffId, setFilterStaffId] = useState<string>('all');
//     const [editingRecord, setEditingRecord] = useState<ComprehensiveAttendance | null>(null);

//     const isFilterActive = filterDate !== '' || filterStaffId !== 'all';

//     const getComprehensiveAttendance = useMemo((): ComprehensiveAttendance[] => {
//         const staffIdFilterNum = filterStaffId !== 'all' ? parseInt(filterStaffId) : null;
//         let records = attendanceRecords;
//         if (staffIdFilterNum) {
//             records = records.filter(r => r.staff_id === staffIdFilterNum);
//         }
        
//         const relevantDates = new Set(records.map(r => r.date));
//         if (filterDate) {
//              if (!relevantDates.has(filterDate)) relevantDates.add(filterDate);
//         } else if (!relevantDates.has(getTodayDateString())) {
//              relevantDates.add(getTodayDateString());
//         }

//         const sortedDates = Array.from(relevantDates).sort().reverse();
//         const rosterStaff = staffIdFilterNum ? staffs.filter(s => s.id === staffIdFilterNum) : staffs;
        
//         let comprehensiveList: ComprehensiveAttendance[] = [];
//         for (const date of sortedDates) {
//             const recordsForDate = records.filter(r => r.date === date);
//             const recordedStaffIds = new Set(recordsForDate.map(r => r.staff_id));
//             comprehensiveList.push(...recordsForDate);
            
//             if (new Date(date).getTime() <= new Date(getTodayDateString()).getTime()) {
//                 for (const staff of rosterStaff) {
//                     if (!recordedStaffIds.has(staff.id)) {
//                         comprehensiveList.push({
//                             id: `synthetic-${date}-${staff.id}`,
//                             staff_id: staff.id,
//                             staff_name: staff.name,
//                             staff_role: staff.role,
//                             date: date,
//                             checkin_time: null,
//                             checkout_time: null,
//                             status: 'absent',
//                             created_at: '',
//                             updated_at: '',
//                         });
//                     }
//                 }
//             }
//         }
//         return filterDate ? comprehensiveList.filter(r => r.date === filterDate) : comprehensiveList;
//     }, [filterDate, filterStaffId, attendanceRecords, staffs]);

//     return (
//         <>
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center">
//                         <Calendar className="h-5 w-5 mr-2 text-green-600" />
//                         Staff Attendance Register {isLoading && <Loader2 className="ml-3 h-4 w-4 animate-spin" />}
//                     </CardTitle>
//                     <CardDescription>
//                         Review daily staff attendance records. Missing entries for past/present dates are marked as 'Absent'.
//                     </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex flex-wrap items-end gap-3">
//                         <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
//                         <div className="flex flex-col gap-1 w-full sm:w-[180px]">
//                             <label className="text-xs font-medium text-gray-600">Filter by Date</label>
//                             <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} disabled={isLoading} />
//                         </div>
//                         <div className="flex flex-col gap-1 w-full sm:w-[180px]">
//                             <label className="text-xs font-medium text-gray-600">Filter by Staff</label>
//                             <Select value={filterStaffId} onValueChange={setFilterStaffId} disabled={isLoading || staffs.length === 0}>
//                                 <SelectTrigger><SelectValue placeholder="All Staff" /></SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="all">All Staff</SelectItem>
//                                     {staffs.map((staff) => <SelectItem key={`filter-${staff.id}`} value={staff.id.toString()}>{staff.name}</SelectItem>)}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         {isFilterActive && (
//                             <Button variant="outline" size="sm" onClick={() => { setFilterDate(''); setFilterStaffId('all'); toast({ description: "Filters cleared." }); }} className="mt-auto h-9 text-red-600 border-red-200 hover:bg-red-50">
//                                 <ClearFilterIcon className="h-4 w-4 mr-1" /> Clear
//                             </Button>
//                         )}
//                     </div>
//                     {isLoading ? (
//                         <div className="text-center py-10 text-gray-500">
//                             <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
//                             Loading attendance data...
//                         </div>
//                     ) : (
//                         <AttendanceRegisterSection data={getComprehensiveAttendance} isFiltered={isFilterActive} onEdit={setEditingRecord} />
//                     )}
//                 </CardContent>
//             </Card>

//             {editingRecord && (
//                 <AttendanceEditModal
//                     isOpen={!!editingRecord}
//                     onClose={() => setEditingRecord(null)}
//                     record={editingRecord}
//                     staffs={staffs}
//                     onUpdate={onUpdateRecord}
//                 />
//             )}
//         </>
//     );
// }