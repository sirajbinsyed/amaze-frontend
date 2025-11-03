// 'use client';

// import { useState } from 'react';
// import { Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { ActiveStaff } from '@/lib/hr';

// interface ManualAttendanceEntryProps {
//   staffs: ActiveStaff[];
//   isLoadingStaffs: boolean;
//   isSubmitting: boolean;
//   selectedStaffId: string;
//   setSelectedStaffId: (id: string) => void;
//   attendanceDate: string;
//   setAttendanceDate: (date: string) => void;
//   attendanceTime: string;
//   setAttendanceTime: (time: string) => void;
//   manualStatus: string;
//   setManualStatus: (status: string) => void;
//   onCheckIn: () => Promise<void>;
//   onCheckOut: () => Promise<void>;
// }

// const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'leave', 'halfday'] as const;

// export function ManualAttendanceEntry({
//   staffs,
//   isLoadingStaffs,
//   isSubmitting,
//   selectedStaffId,
//   setSelectedStaffId,
//   attendanceDate,
//   setAttendanceDate,
//   attendanceTime,
//   setAttendanceTime,
//   manualStatus,
//   setManualStatus,
//   onCheckIn,
//   onCheckOut,
// }: ManualAttendanceEntryProps) {
//   const staffLoadingMessage = isLoadingStaffs ? (
//     <SelectItem value="loading" disabled>Loading staff...</SelectItem>
//   ) : (
//     <SelectItem value="none" disabled>No active staff found</SelectItem>
//   );

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center">
//           <Clock className="h-5 w-5 mr-2 text-indigo-600" />
//           Manual Attendance Entry
//         </CardTitle>
//         <CardDescription>
//           Select a staff member, date, time, and the resulting status required for Check Out.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {/* Shared Inputs */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           {/* Staff Select */}
//           <div className="lg:col-span-2">
//             <label className="text-sm font-medium leading-none mb-1 block">Staff Member</label>
//             <Select value={selectedStaffId} onValueChange={setSelectedStaffId} disabled={isSubmitting || isLoadingStaffs || staffs.length === 0}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Staff" />
//               </SelectTrigger>
//               <SelectContent>
//                 {isLoadingStaffs ? staffLoadingMessage : staffs.length === 0 ? staffLoadingMessage : staffs.map((staff) => (
//                   <SelectItem key={staff.id} value={staff.id.toString()}>
//                     {staff.name} - {staff.role}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           {/* Date Input */}
//           <div>
//             <label className="text-sm font-medium leading-none mb-1 block">Date</label>
//             <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} disabled={isSubmitting} />
//           </div>
//           {/* Time Input */}
//           <div>
//             <label className="text-sm font-medium leading-none mb-1 block">Time (HH:MM)</label>
//             <Input type="time" value={attendanceTime} onChange={(e) => setAttendanceTime(e.target.value)} disabled={isSubmitting} />
//           </div>
//           {/* Status Select */}
//           <div className="lg:col-span-2">
//             <label className="text-sm font-medium leading-none mb-1 block">Status</label>
//             <Select value={manualStatus} onValueChange={setManualStatus} disabled={isSubmitting}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 {ATTENDANCE_STATUSES.map((status) => {
//                   const words = status.split(/[-_]/);
//                   const label = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//                   return <SelectItem key={status} value={status}>{label}</SelectItem>;
//                 })}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//         {/* Action Buttons */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
//           {/* Check In Section */}
//           <Card className="border-l-4 border-green-500 bg-green-50/50">
//             <CardHeader className="py-2">
//               <CardTitle className="text-lg text-green-700">Check In</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Button
//                 onClick={onCheckIn}
//                 className="w-full bg-green-600 hover:bg-green-700 disabled:pointer-events-none"
//                 disabled={isSubmitting || !selectedStaffId || isLoadingStaffs}
//               >
//                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
//                 {isSubmitting ? 'Submitting Check-In...' : 'Record Check In'}
//               </Button>
//             </CardContent>
//           </Card>
//           {/* Check Out Section */}
//           <Card className="border-l-4 border-blue-500 bg-blue-50/50">
//             <CardHeader className="py-2">
//               <CardTitle className="text-lg text-blue-700">Check Out</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Button
//                 onClick={onCheckOut}
//                 className="w-full bg-blue-600 hover:bg-blue-700 disabled:pointer-events-none"
//                 disabled={isSubmitting || !selectedStaffId || isLoadingStaffs || !manualStatus}
//               >
//                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
//                 {isSubmitting ? 'Submitting Check-Out...' : 'Record Check Out'}
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
