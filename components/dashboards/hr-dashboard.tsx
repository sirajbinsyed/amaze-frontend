"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { DashboardLayout } from "../dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"


// --- ICONS ---
import {
  Clock, LogIn, Calendar, CheckCircle, XCircle, AlertTriangle, User, Loader2, CalendarOff, Filter, XCircle as ClearFilterIcon, AlertCircle, LogOut, Edit, X, Clock10
} from "lucide-react"

// --- API IMPORTS ---
import { 
    getActiveStaffs, 
    getAllAttendance, 
    createAttendance,
    checkoutAttendance, 
    ActiveStaff, 
    Attendance, 
    AttendanceCreatePayload,
    ApiResponse 
} from "@/lib/hr"; 

// --- TYPE DEFINITIONS ---
interface AttendanceUpdatePayload {
    id: number; 
    staff_id: number;
    date: string;
    checkin_time?: string | null;
    checkout_time?: string | null;
    status?: string;
}

// Extend Attendance interface for synthetic records
type ComprehensiveAttendance = Attendance & {
    id: number | string; // Allows string IDs for synthetic records
};

// --- SIMULATED UPDATE API FUNCTION (Replace with your actual implementation) ---
async function updateAttendance(
    payload: AttendanceUpdatePayload
): Promise<ApiResponse<{ message: string; attendance: Attendance }>> {
    console.log("Simulating API Update with payload:", payload);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (typeof payload.id === 'number') { // Ensure ID is a number for real update
                 resolve({ data: { message: "Update successful", attendance: {} as Attendance } });
            } else {
                 resolve({ error: "Record ID missing or invalid data provided for update." });
            }
        }, 800);
    });
}

// Array of all possible statuses for easier maintenance
const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'leave', 'half_day'];

// Define the order priority for display (Lower number = higher priority = earlier in list)
const STATUS_PRIORITY: Record<string, number> = {
    'present': 1,
    'late': 2,
    'half_day': 3,
    'leave': 4,
    'absent': 5,
    'unknown': 99,
};


// --- Helper Functions (Time Formatting) ---
const formatTimeFromISO = (isoString: string | null | undefined): string => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
             const timeParts = isoString.split(':');
             if (timeParts.length >= 2) {
                 const [hours, minutes] = timeParts.map(Number);
                 const tempDate = new Date();
                 tempDate.setHours(hours, minutes, 0, 0);
                 return tempDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
             }
             return 'N/A';
        }
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return 'N/A';
    }
};

const getAttendanceStatusBadge = (status: string | null) => {
    const safeStatus = status?.toLowerCase() || 'unknown';
    let color: string;
    let Icon: React.ElementType;
    let label: string = safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

    switch (safeStatus) {
        case 'present':
            color = 'bg-green-100 text-green-800';
            Icon = CheckCircle;
            break;
        case 'late':
            color = 'bg-yellow-100 text-yellow-800';
            Icon = AlertTriangle;
            break;
        case 'absent':
            color = 'bg-red-100 text-red-800';
            Icon = XCircle;
            break;
        case 'leave':
            color = 'bg-blue-100 text-blue-800';
            Icon = CalendarOff;
            break;
        case 'half_day': 
            color = 'bg-indigo-100 text-indigo-800';
            Icon = Clock10;
            label = 'Half Day';
            break;
        default:
            color = 'bg-gray-100 text-gray-800';
            Icon = Clock;
            label = status || 'N/A';
    }

    return (
        <Badge className={`capitalize ${color} font-medium`}>
            <Icon className="h-3 w-3 mr-1" /> {label}
        </Badge>
    );
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];


// =============================================================
// 1. ATTENDANCE EDIT MODAL COMPONENT
// =============================================================

interface AttendanceEditModalProps {
    record: ComprehensiveAttendance;
    staffs: ActiveStaff[];
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (payload: AttendanceUpdatePayload) => Promise<void>;
}

const AttendanceEditModal: React.FC<AttendanceEditModalProps> = ({ record, staffs, isOpen, onClose, onUpdate }) => {
    const { toast } = useToast();
    
    const isRealRecord = typeof record.id === 'number';

    // This modal should never open for a synthetic record anyway, but this is a safeguard.
    if (!isRealRecord) {
        onClose();
        return null;
    }

    const staff = staffs.find(s => s.id === record.staff_id);
    
    const [checkInTime, setCheckInTime] = useState(
        record.checkin_time ? new Date(record.checkin_time).toTimeString().slice(0, 5) : ''
    );
    const [checkOutTime, setCheckOutTime] = useState(
        record.checkout_time ? new Date(record.checkout_time).toTimeString().slice(0, 5) : ''
    );
    const [status, setStatus] = useState(record.status || 'present');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isRealRecord) {
            setCheckInTime(record.checkin_time ? new Date(record.checkin_time).toTimeString().slice(0, 5) : '');
            setCheckOutTime(record.checkout_time ? new Date(record.checkout_time).toTimeString().slice(0, 5) : '');
            setStatus(record.status || 'present');
        }
    }, [record, isRealRecord]);


    const handleSave = async () => {
        if (!isRealRecord) return;

        setIsSaving(true);

        const timeToISO = (time: string | null): string | null => {
            if (!time) return null;
            const [hours, minutes] = time.split(':').map(Number);
            const date = new Date(record.date);
            date.setHours(hours, minutes, 0, 0);
            return date.toISOString();
        };

        const checkinISO = timeToISO(checkInTime);
        const checkoutISO = timeToISO(checkOutTime);

        if (!checkinISO && status !== 'absent' && status !== 'leave') {
            toast({ 
                description: "Check-in time is required if status is Present, Late, or Half Day.", 
                variant: "destructive" 
            });
            setIsSaving(false);
            return;
        }

        const payload: AttendanceUpdatePayload = {
            id: record.id as number, 
            staff_id: record.staff_id,
            date: record.date,
            checkin_time: checkinISO,
            checkout_time: checkoutISO,
            status: status,
        };

        try {
            await onUpdate(payload);
            onClose();
        } catch (error) {
            // Error handling is managed by onUpdate (in parent)
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Attendance Record</DialogTitle>
                    <DialogDescription>
                        Modify attendance details for {staff?.name || 'Unknown Staff'} on {record.date}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    
                    {/* Status Select (Updated options) */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {ATTENDANCE_STATUSES.map(s => (
                                    <SelectItem key={s} value={s}>{s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Check In Time */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Clock In Time</label>
                        <Input
                            type="time"
                            value={checkInTime}
                            onChange={(e) => setCheckInTime(e.target.value)}
                        />
                    </div>
                    
                    {/* Check Out Time */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Clock Out Time (Optional)</label>
                        <Input
                            type="time"
                            value={checkOutTime}
                            onChange={(e) => setCheckOutTime(e.target.value)}
                        />
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Edit className="mr-2 h-4 w-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// =============================================================
// 2. ATTENDANCE REGISTER COMPONENT (Updated sorting logic)
// =============================================================

interface AttendanceRegisterSectionProps {
    data: ComprehensiveAttendance[];
    isFiltered: boolean;
    activeStaffs: ActiveStaff[]; 
    onEdit: (record: ComprehensiveAttendance) => void; 
}

const AttendanceRegisterSection: React.FC<AttendanceRegisterSectionProps> = ({ data, isFiltered, onEdit }) => {
    
    // Grouping by date and applying custom sorting
    const groupedData = useMemo(() => {
        return data.reduce((acc, record) => {
            const dateStr = record.date 
                ? new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) 
                : 'Unknown Date';
            
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(record);
            
            // Custom Sort logic: Status Priority -> Staff Name
            acc[dateStr].sort((a, b) => {
                const statusA = (a.status || 'unknown').toLowerCase();
                const statusB = (b.status || 'unknown').toLowerCase();
                
                const priorityA = STATUS_PRIORITY[statusA] || 99;
                const priorityB = STATUS_PRIORITY[statusB] || 99;
                
                if (priorityA !== priorityB) {
                    return priorityA - priorityB; // Sort by priority (lower number first)
                }
                
                // Secondary sort: Staff Name alphabetically
                return (a.staff_name || '').localeCompare(b.staff_name || '');
            });
            
            return acc;
        }, {} as Record<string, ComprehensiveAttendance[]>);
    }, [data]);
    
    // Sorting dates (newest first)
    const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (data.length === 0 && isFiltered) {
        return (
            <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                    No records match the current filter criteria.
                </p>
            </div>
        )
    }

    if (data.length === 0 && !isFiltered) {
         return (
             <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No attendance history available.</p>
            </div>
         )
    }

    return (
        <div className="space-y-6">
            {sortedDates.map((dateStr) => (
                <Card key={dateStr}>
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="flex items-center text-lg font-bold text-gray-700">
                            <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                            Attendance for {dateStr} (Total Records: {groupedData[dateStr].length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop/Tablet Header */}
                        <div className="hidden sm:grid grid-cols-7 text-xs font-semibold uppercase text-gray-500 bg-gray-100 py-3 px-6 border-b">
                            <div className="col-span-2">Staff Member</div>
                            <div>Role</div>
                            <div>Clock In</div>
                            <div>Clock Out</div>
                            <div className="text-center">Status</div>
                            <div className="text-right">Actions</div> 
                        </div>
                        
                        {/* Attendance Rows */}
                        {groupedData[dateStr].map((record) => {
                            // Since we removed synthetic records, this check is less critical but harmless.
                            const isSynthetic = typeof record.id !== 'number';
                            
                            return (
                                <div key={record.id} className={`grid grid-cols-3 sm:grid-cols-7 items-center gap-2 sm:gap-4 p-4 border-b transition hover:bg-gray-50`}>
                                    
                                    {/* Staff Member (Col 1-2) */}
                                    <div className="col-span-2 flex items-center">
                                        <User className="h-4 w-4 mr-2 text-gray-400 hidden sm:inline" />
                                        <span className="font-medium text-base">{record.staff_name || 'Unknown'}</span>
                                    </div>
                                    
                                    {/* Role (Col 3) */}
                                    <div className="hidden sm:block text-sm text-gray-600">
                                        {record.staff_role || 'N/A'}
                                    </div>

                                    {/* Clock In (Col 4) */}
                                    <div className="text-sm hidden sm:block">
                                        {formatTimeFromISO(record.checkin_time)}
                                    </div>
                                    
                                    {/* Clock Out (Col 5) */}
                                    <div className="text-sm hidden sm:block">
                                        {formatTimeFromISO(record.checkout_time)}
                                    </div>
                                    
                                    {/* Status (Col 6) */}
                                    <div className="col-span-1 text-center hidden sm:block">
                                        {getAttendanceStatusBadge(record.status)}
                                    </div>

                                    {/* Actions (Col 7) */}
                                    <div className="col-span-1 flex justify-end">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => onEdit(record)}
                                            title="Edit Attendance"
                                            disabled={isSynthetic} // Will always be false now
                                        >
                                            {isSynthetic ? (
                                                <X className="h-4 w-4 text-gray-300" />
                                            ) : (
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

// =============================================================
// 3. SUBMISSION ERROR MODAL COMPONENT (Unchanged)
// =============================================================

interface SubmissionErrorModalProps {
    error: string | null;
    onClose: () => void;
}

const SubmissionErrorModal: React.FC<SubmissionErrorModalProps> = ({ error, onClose }) => {
    return (
        <Dialog open={!!error} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] border-red-500">
                <DialogHeader className="flex flex-row items-center space-x-3">
                    <XCircle className="h-6 w-6 text-red-600" />
                    <DialogTitle className="text-red-600">Attendance Submission Failed</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    We could not complete your manual attendance entry due to the following issue reported by the system:
                </DialogDescription>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 font-mono text-sm">
                    {error}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// =============================================================
// 4. HR DASHBOARD COMPONENT (Main Logic & Comprehensive Roster)
// =============================================================
export function HRDashboard() {
  const { toast } = useToast()

  // --- API DATA STATES ---
  const [staffs, setStaffs] = useState<ActiveStaff[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([])
  
  // --- LOADING STATES ---
  const [isLoadingStaffs, setIsLoadingStaffs] = useState(true)
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true)
  
  // --- MANUAL ATTENDANCE INPUT STATE ---
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [attendanceTime, setAttendanceTime] = useState(new Date().toTimeString().slice(0, 5)) 
  const [attendanceDate, setAttendanceDate] = useState(getTodayDateString()); 
  const [manualStatus, setManualStatus] = useState<string>('present'); 
  const [isSubmitting, setIsSubmitting] = useState(false) 

  // --- MODAL STATES ---
  const [editingRecord, setEditingRecord] = useState<ComprehensiveAttendance | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null); 

  // --- ATTENDANCE REGISTER FILTER STATE ---
  const [filterDate, setFilterDate] = useState<string>('') 
  const [filterStaffId, setFilterStaffId] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('');


  // Function to fetch and update attendance records
  const fetchAttendance = useCallback(async () => {
    setIsLoadingAttendance(true);
    const result = await getAllAttendance();
    if (result.data) {
      setAttendanceRecords(result.data);
    } else {
      toast({ 
        title: "Error Fetching Attendance", 
        description: result.error, 
        variant: "destructive" 
      });
    }
    setIsLoadingAttendance(false);
  }, [toast]);


  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      const staffResult = await getActiveStaffs();
      if (staffResult.data) {
        setStaffs(staffResult.data);
      } else {
        toast({ 
            title: "Error Fetching Staffs", 
            description: staffResult.error, 
            variant: "destructive" 
        });
      }
      setIsLoadingStaffs(false);
      await fetchAttendance();
    };
    fetchData();
  }, [toast, fetchAttendance]);


  // --- HELPER FUNCTIONS ---
  const resetForm = () => {
    setSelectedStaffId("");
    setAttendanceTime(new Date().toTimeString().slice(0, 5));
    setAttendanceDate(getTodayDateString());
    setManualStatus('present'); 
  }

  const getSubmissionDateTime = (dateString: string, timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const submissionDateTime = new Date(dateString); 
    submissionDateTime.setHours(hours, minutes, 0, 0); 
    return submissionDateTime;
  }
  
  // --- 1. CHECK-IN SUBMISSION LOGIC (using createAttendance) ---
  const handleCheckInSubmit = async () => {
    if (!selectedStaffId || !attendanceTime || !attendanceDate) {
      toast({ 
        title: "Validation Error", 
        description: "Please select staff, date, and time for check-in.", 
        variant: "destructive" 
      })
      return
    }
    
    const statusToSend = manualStatus || 'present'; 

    setIsSubmitting(true)
    setSubmissionError(null); 
    const staffIdNum = parseInt(selectedStaffId);
    const staffName = staffs.find(s => s.id === staffIdNum)?.name || 'Unknown Staff'
    const submissionDateTime = getSubmissionDateTime(attendanceDate, attendanceTime);

    const payload: AttendanceCreatePayload = {
        staff_id: staffIdNum,
        date: attendanceDate, 
        status: statusToSend, 
        checkin_time: submissionDateTime.toISOString(),
    };

    try {
        const result = await createAttendance(payload);
        
        if (result.data) {
            toast({
                title: "Check-In Recorded",
                description: `${staffName} clocked in successfully on ${attendanceDate} with status: ${statusToSend}.`,
                duration: 5000,
            })
            await fetchAttendance();
            resetForm();
        } else {
            const errorMessage = result.error || "Unknown API error during check-in.";
            setSubmissionError(errorMessage); 
            toast({
                title: "Check-In Failed",
                description: "Review the error details in the pop-up window.",
                variant: "destructive",
            });
            
        }
    } catch (error: any) {
        setSubmissionError(`An unexpected error occurred: ${error.message}`);
        toast({
            title: "System Error",
            description: "An unexpected error occurred. See modal for details.",
            variant: "destructive",
        })
    } finally {
        setIsSubmitting(false)
    }
  }


  // --- 2. CHECK-OUT SUBMISSION LOGIC (using checkoutAttendance) ---
  const handleCheckOutSubmit = async () => {
    if (!selectedStaffId || !attendanceTime || !attendanceDate || !manualStatus) {
      toast({ 
        title: "Validation Error", 
        description: "Please select staff, date, time, AND status for check-out.", 
        variant: "destructive" 
      })
      return
    }

    setIsSubmitting(true)
    setSubmissionError(null); 
    const staffIdNum = parseInt(selectedStaffId);
    const staffName = staffs.find(s => s.id === staffIdNum)?.name || 'Unknown Staff'
    const submissionDateTime = getSubmissionDateTime(attendanceDate, attendanceTime);

    try {
        // Use the selected status for checkout
        const result = await checkoutAttendance(
            staffIdNum,
            attendanceDate,
            submissionDateTime.toISOString(), 
            manualStatus 
        );
        
        if (result.data) {
            toast({
                title: "Check-Out Recorded",
                description: `${staffName} clocked out successfully on ${attendanceDate}, setting final status to: ${manualStatus}.`,
                duration: 5000,
            })
            await fetchAttendance();
            resetForm();
        } else {
            const errorMessage = result.error || "Unknown API error during check-out.";
            setSubmissionError(errorMessage); 
            toast({
                title: "Check-Out Failed",
                description: "Review the error details in the pop-up window.",
                variant: "destructive",
            });
        }
    } catch (error: any) {
         setSubmissionError(`An unexpected error occurred: ${error.message}`);
         toast({
            title: "System Error",
            description: "An unexpected error occurred. See modal for details.",
            variant: "destructive",
        })
    } finally {
        setIsSubmitting(false)
    }
  }

  // --- 3. GENERIC UPDATE LOGIC (Used by Edit Modal) ---
  const handleUpdateRecord = async (payload: AttendanceUpdatePayload) => {
      try {
          const result = await updateAttendance(payload); 
          
          if (result.data) {
              toast({
                  title: "Record Updated",
                  description: `Attendance record ID ${payload.id} successfully modified.`,
                  duration: 4000,
              });
              await fetchAttendance();
          } else {
              const errorMessage = result.error || "Unknown API error during update.";
              
              toast({
                  title: "Update Failed",
                  description: `Could not update record: ${errorMessage}`,
                  variant: "destructive",
              });
              throw new Error(errorMessage);
          }
      } catch (error: any) {
          throw error; 
      }
  }


  // ====================================================================
  // --- CORE FILTERING LOGIC (Simplified) ---
  // ====================================================================

  const getComprehensiveAttendance = useMemo((): ComprehensiveAttendance[] => {
    let filteredRecords = [...attendanceRecords];
    
    // 1. Apply Staff Filter
    const staffIdFilterNum = filterStaffId !== 'all' && filterStaffId !== '' ? parseInt(filterStaffId) : null;
    if (staffIdFilterNum) {
        filteredRecords = filteredRecords.filter(record => record.staff_id === staffIdFilterNum);
    }

    // 2. Apply Period Filter (Month takes precedence)
    if (filterMonth) {
        filteredRecords = filteredRecords.filter(r => r.date.startsWith(filterMonth));
    } else if (filterDate) {
        filteredRecords = filteredRecords.filter(r => r.date === filterDate);
    }
    
    return filteredRecords;

  }, [filterDate, filterMonth, filterStaffId, attendanceRecords]);


  const isFilterActive = filterDate !== '' || filterMonth !== '' || filterStaffId !== 'all';
  
  const staffLoadingMessage = isLoadingStaffs ? (
      <SelectItem value="loading" disabled>Loading staff...</SelectItem>
  ) : (
      <SelectItem value="none" disabled>No active staff found</SelectItem>
  );

  return (
    <DashboardLayout title="Human Resources Dashboard" role="hr">
      <main className="flex-1 space-y-6 p-4 md:p-6 overflow-y-auto">
        
        <Tabs defaultValue="manual_entry" className="space-y-6"> 
            
            {/* --- TABS LIST --- */}
            <div className="flex justify-center">
                <TabsList className="grid w-full grid-cols-2 md:w-fit md:mx-auto">
                    <TabsTrigger value="manual_entry">Manual Attendance Entry</TabsTrigger>
                    <TabsTrigger value="attendance_register">Attendance Register</TabsTrigger>
                </TabsList>
            </div>

            {/* ==================================================================== */}
            {/* MANUAL ATTENDANCE ENTRY SECTION                                      */}
            {/* ==================================================================== */}
            <TabsContent value="manual_entry">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                        Manual Attendance Entry
                        </CardTitle>
                        <CardDescription>
                        Select a staff member, date, time, and the resulting status (required for Check Out).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        
                        {/* Shared Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            
                            {/* 1. Staff Select */}
                            <div className="lg:col-span-2">
                                <label className="text-sm font-medium leading-none mb-1 block">Staff Member</label>
                                <Select
                                value={selectedStaffId}
                                onValueChange={setSelectedStaffId}
                                disabled={isSubmitting || isLoadingStaffs || staffs.length === 0}
                                >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingStaffs ? staffLoadingMessage : (
                                        staffs.length === 0 ? staffLoadingMessage :
                                        staffs.map((staff) => (
                                            <SelectItem key={staff.id} value={staff.id.toString()}>
                                                {staff.name} ({staff.role})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                                </Select>
                            </div>

                            {/* 2. Date Input */}
                            <div>
                                <label className="text-sm font-medium leading-none mb-1 block">Date</label>
                                <Input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                disabled={isSubmitting}
                                />
                            </div>

                            {/* 3. Time Input */}
                            <div>
                                <label className="text-sm font-medium leading-none mb-1 block">Time (HH:MM)</label>
                                <Input
                                type="time"
                                value={attendanceTime}
                                onChange={(e) => setAttendanceTime(e.target.value)}
                                disabled={isSubmitting}
                                />
                            </div>

                            {/* 4. Status Select */}
                            <div className="lg:col-span-2">
                                <label className="text-sm font-medium leading-none mb-1 block">Status</label>
                                <Select 
                                    value={manualStatus} 
                                    onValueChange={setManualStatus}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ATTENDANCE_STATUSES.map(s => (
                                            <SelectItem key={s} value={s}>{s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            
                            {/* --- CHECK IN SECTION --- */}
                            <Card className="border-l-4 border-green-500 bg-green-50/50">
                                <CardHeader className="py-2">
                                    <CardTitle className="text-lg text-green-700">Check In</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button 
                                    onClick={handleCheckInSubmit} 
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    disabled={isSubmitting || !selectedStaffId || isLoadingStaffs}
                                    >
                                    {isSubmitting ? (
                                        <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting Check-In...
                                        </>
                                    ) : (
                                        <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Record Check In
                                        </>
                                    )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* --- CHECK OUT SECTION --- */}
                            <Card className="border-l-4 border-blue-500 bg-blue-50/50">
                                <CardHeader className="py-2">
                                    <CardTitle className="text-lg text-blue-700">Check Out</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button 
                                    onClick={handleCheckOutSubmit} 
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={isSubmitting || !selectedStaffId || isLoadingStaffs || !manualStatus}
                                    >
                                    {isSubmitting ? (
                                        <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting Check-Out...
                                        </>
                                    ) : (
                                        <>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Record Check Out
                                        </>
                                    )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                    </CardContent>
                </Card>
            </TabsContent>

            {/* ==================================================================== */}
            {/* ATTENDANCE REGISTER SECTION (Using ComprehensiveAttendance)          */}
            {/* ==================================================================== */}
            <TabsContent value="attendance_register">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-green-600" />
                            Staff Attendance Register {isLoadingAttendance && <Loader2 className="ml-3 h-4 w-4 animate-spin" />}
                        </CardTitle>
                        <CardDescription>
                           Review and filter all recorded staff attendance. Only entries that exist in the system will be displayed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        
                        <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex flex-wrap items-end gap-3">
                            <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            
                            <div className="flex flex-col gap-1 w-full sm:w-[180px] flex-shrink-0">
                                <label className="text-xs font-medium text-gray-600">Filter by Month</label>
                                <Input 
                                    type="month" 
                                    value={filterMonth} 
                                    onChange={(e) => {
                                        setFilterMonth(e.target.value);
                                        if (e.target.value) setFilterDate('');
                                    }} 
                                    disabled={isLoadingAttendance}
                                />
                            </div>

                            <div className="flex flex-col gap-1 w-full sm:w-[180px] flex-shrink-0">
                                <label className="text-xs font-medium text-gray-600">Or by Specific Date</label>
                                <Input 
                                    type="date" 
                                    value={filterDate} 
                                    onChange={(e) => {
                                        setFilterDate(e.target.value);
                                        if (e.target.value) setFilterMonth('');
                                    }} 
                                    disabled={isLoadingAttendance}
                                />
                            </div>

                            <div className="flex flex-col gap-1 w-full sm:w-[180px] flex-shrink-0">
                                <label className="text-xs font-medium text-gray-600">Filter by Staff</label>
                                <Select 
                                    value={filterStaffId} 
                                    onValueChange={setFilterStaffId}
                                    disabled={isLoadingAttendance || isLoadingStaffs}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Staff</SelectItem>
                                        {staffs.map((staff) => (
                                            <SelectItem key={`filter-${staff.id}`} value={staff.id.toString()}>
                                                {staff.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {isFilterActive && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => { 
                                        setFilterDate(''); 
                                        setFilterMonth('');
                                        setFilterStaffId('all'); 
                                        toast({ description: "Filters cleared." }); 
                                    }}
                                    className="mt-auto h-9 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <ClearFilterIcon className="h-4 w-4 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>
                        
                        {isLoadingAttendance ? (
                            <div className="text-center py-10 text-gray-500">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                                Loading attendance data...
                            </div>
                        ) : (
                            <AttendanceRegisterSection 
                                data={getComprehensiveAttendance} 
                                isFiltered={isFilterActive}
                                activeStaffs={staffs} 
                                onEdit={setEditingRecord}
                            />
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
      </main>
      <Toaster />

      {editingRecord && (
          <AttendanceEditModal
              isOpen={!!editingRecord}
              onClose={() => setEditingRecord(null)}
              record={editingRecord}
              staffs={staffs}
              onUpdate={handleUpdateRecord}
          />
      )}
      
      <SubmissionErrorModal
        error={submissionError}
        onClose={() => setSubmissionError(null)}
      />
    </DashboardLayout>
  )
}