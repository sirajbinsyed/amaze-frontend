// admin-tabs/attendance-tab-content.tsx
"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// --- ICONS (Edit icon removed) ---
import {
  Clock, Calendar, CheckCircle, XCircle, AlertTriangle, User, Loader2, CalendarOff, Filter, X as ClearFilterIcon, Clock10, AlertCircle
} from "lucide-react";

// --- API & TYPE IMPORTS (Assuming these are in @/lib/hr) ---
import { 
    getActiveStaffs, 
    getAllAttendance, 
    ActiveStaff, 
    Attendance, 
    ApiResponse 
} from "@/lib/admin"; 

// --- TYPE DEFINITIONS ---
type ComprehensiveAttendance = Attendance & {
    id: number | string;
};

// --- CONSTANTS ---
const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'leave', 'half_day'];
const STATUS_PRIORITY: Record<string, number> = {
    'present': 1,
    'late': 2,
    'half_day': 3,
    'leave': 4,
    'absent': 5,
    'unknown': 99,
};

// --- HELPER FUNCTIONS ---
const formatTimeFromISO = (isoString: string | null | undefined): string => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return 'N/A';
    }
};

const getAttendanceStatusBadge = (status: string | null) => {
    const safeStatus = status?.toLowerCase() || 'unknown';
    let color: string, Icon: React.ElementType, label: string = safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

    switch (safeStatus) {
        case 'present': color = 'bg-green-100 text-green-800'; Icon = CheckCircle; break;
        case 'late': color = 'bg-yellow-100 text-yellow-800'; Icon = AlertTriangle; break;
        case 'absent': color = 'bg-red-100 text-red-800'; Icon = XCircle; break;
        case 'leave': color = 'bg-blue-100 text-blue-800'; Icon = CalendarOff; break;
        case 'half_day': color = 'bg-indigo-100 text-indigo-800'; Icon = Clock10; label = 'Half Day'; break;
        default: color = 'bg-gray-100 text-gray-800'; Icon = Clock; label = status || 'N/A';
    }

    return (
        <Badge className={`capitalize ${color} font-medium`}>
            <Icon className="h-3 w-3 mr-1" /> {label}
        </Badge>
    );
};

// =============================================================
// SUB-COMPONENT: Attendance Register Display Section (UPDATED)
// =============================================================
interface AttendanceRegisterSectionProps {
    data: ComprehensiveAttendance[];
    isFiltered: boolean;
}

const AttendanceRegisterSection: React.FC<AttendanceRegisterSectionProps> = ({ data, isFiltered }) => {
    const groupedData = useMemo(() => {
        const groups = data.reduce((acc, record) => {
            if (!record.date) return acc;
            const dateStr = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(record);
            return acc;
        }, {} as Record<string, ComprehensiveAttendance[]>);

        Object.values(groups).forEach(records => {
            records.sort((a, b) => {
                const priorityA = STATUS_PRIORITY[a.status?.toLowerCase() || 'unknown'] || 99;
                const priorityB = STATUS_PRIORITY[b.status?.toLowerCase() || 'unknown'] || 99;
                if (priorityA !== priorityB) return priorityA - priorityB;
                return (a.staff_name || '').localeCompare(b.staff_name || '');
            });
        });
        return groups;
    }, [data]);
    
    const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (data.length === 0) {
        return (
             <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="font-semibold text-gray-700">No Records Found</p>
                <p className="text-sm text-gray-500">
                    {isFiltered ? "No records match the current filter criteria." : "There are no attendance records to display yet."}
                </p>
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
                            Attendance for {dateStr} (Total: {groupedData[dateStr].length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Grid layout updated to 8 columns, "Actions" removed */}
                        <div className="hidden sm:grid grid-cols-8 text-xs font-semibold uppercase text-gray-500 bg-gray-100 py-3 px-6 border-b">
                            <div className="col-span-2">Staff Member</div>
                            <div>Role</div>
                            <div>Clock In</div>
                            <div>Clock Out</div>
                            <div className="text-center">Status</div>
                            <div className="col-span-2">Updated By</div>
                        </div>
                        
                        {/* Row grid layout updated to 8 columns */}
                        {groupedData[dateStr].map((record) => (
                            <div key={record.id} className="grid grid-cols-2 sm:grid-cols-8 items-center gap-2 sm:gap-4 p-4 border-b last:border-b-0 transition hover:bg-gray-50">
                                <div className="col-span-2 flex items-center">
                                    <User className="h-4 w-4 mr-2 text-gray-400 hidden sm:inline" />
                                    <span className="font-medium text-gray-900">{record.staff_name || 'Unknown'}</span>
                                </div>
                                <div className="hidden sm:block text-sm text-gray-600">{record.staff_role || 'N/A'}</div>
                                <div className="hidden sm:block text-sm">{formatTimeFromISO(record.checkin_time)}</div>
                                <div className="hidden sm:block text-sm">{formatTimeFromISO(record.checkout_time)}</div>
                                <div className="text-center hidden sm:block">{getAttendanceStatusBadge(record.status)}</div>
                                <div className="hidden sm:block col-span-2 text-sm text-gray-600">
                                    {record.updated_by_name 
                                        ? `${record.updated_by_name} (${record.updated_by_role || 'N/A'})`
                                        : 'System/Auto'}
                                </div>
                                {/* Edit button and its container are removed */}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};


// =============================================================
// MAIN COMPONENT: Attendance Management Page
// =============================================================
export const AttendanceManagementPage = () => {
    const { toast } = useToast();

    // --- STATE MANAGEMENT ---
    const [staffs, setStaffs] = useState<ActiveStaff[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // Editing state is removed
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterStaffId, setFilterStaffId] = useState<string>('all');
    const [filterMonth, setFilterMonth] = useState<string>('');

    // --- DATA FETCHING ---
    const fetchAttendance = useCallback(async () => {
        const result = await getAllAttendance();
        if (result.data && Array.isArray(result.data)) {
            setAttendanceRecords(result.data);
        } else if (result.error) {
            toast({ title: "Error Fetching Attendance", description: result.error, variant: "destructive" });
        }
    }, [toast]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const staffResult = await getActiveStaffs();
            
            if (staffResult.data && Array.isArray(staffResult.data.staffs)) {
                setStaffs(staffResult.data.staffs);
            } else if(staffResult.error) {
                toast({ title: "Error Fetching Staff", description: staffResult.error, variant: "destructive" });
                setStaffs([]); 
            }

            await fetchAttendance();
            setIsLoading(false);
        };
        fetchData();
    }, [fetchAttendance, toast]);

    // --- EVENT HANDLERS ---
    // handleUpdateRecord function is removed
    const clearFilters = () => {
        setFilterDate('');
        setFilterMonth('');
        setFilterStaffId('all');
        toast({ description: "Filters cleared." });
    };

    // --- FILTERING LOGIC ---
    const filteredAttendance = useMemo((): ComprehensiveAttendance[] => {
        let records = Array.isArray(attendanceRecords) ? [...attendanceRecords] : [];
        if (filterStaffId !== 'all') {
            records = records.filter(r => r.staff_id === parseInt(filterStaffId));
        }
        if (filterMonth) {
            records = records.filter(r => r.date && r.date.startsWith(filterMonth));
        } else if (filterDate) {
            records = records.filter(r => r.date === filterDate);
        }
        return records;
    }, [filterDate, filterMonth, filterStaffId, attendanceRecords]);

    const isFilterActive = filterDate !== '' || filterMonth !== '' || filterStaffId !== 'all';

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" /> Staff Attendance Register
                        {isLoading && <Loader2 className="ml-3 h-4 w-4 animate-spin" />}
                    </CardTitle>
                    <CardDescription>
                        Review and filter all recorded staff attendance entries.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex flex-wrap items-end gap-3">
                        <Filter className="h-5 w-5 text-gray-500 flex-shrink-0 mr-2" />
                        <div className="flex flex-col gap-1 w-full sm:w-auto flex-grow">
                            <label className="text-xs font-medium text-gray-600">Filter by Month</label>
                            <Input type="month" value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); if (e.target.value) setFilterDate(''); }} disabled={isLoading} />
                        </div>
                        <div className="flex flex-col gap-1 w-full sm:w-auto flex-grow">
                            <label className="text-xs font-medium text-gray-600">Or by Specific Date</label>
                            <Input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); if (e.target.value) setFilterMonth(''); }} disabled={isLoading} />
                        </div>
                        <div className="flex flex-col gap-1 w-full sm:w-auto flex-grow">
                            <label className="text-xs font-medium text-gray-600">Filter by Staff</label>
                            <Select value={filterStaffId} onValueChange={setFilterStaffId} disabled={isLoading || !Array.isArray(staffs) || staffs.length === 0}>
                                <SelectTrigger><SelectValue placeholder="All Staff" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Staff</SelectItem>
                                    {Array.isArray(staffs) && staffs.map((staff) => (
                                        <SelectItem key={staff.id} value={staff.id.toString()}>
                                            {`${staff.name} (${staff.role})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {isFilterActive && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                <ClearFilterIcon className="h-4 w-4 mr-1" /> Clear
                            </Button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                            Loading attendance data...
                        </div>
                    ) : (
                        <AttendanceRegisterSection
                            data={filteredAttendance}
                            isFiltered={isFilterActive}
                        />
                    )}
                </CardContent>
            </Card>

            <Toaster />
            {/* The AttendanceEditModal component rendering is removed */}
        </>
    );
};