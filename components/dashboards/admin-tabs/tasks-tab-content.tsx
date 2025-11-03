// src/components/admin/task-management-page.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Updated import to include getActiveStaffs
import { 
    type DetailedTask, 
    type OrderById, 
    getOrder, 
    getActiveStaffs, 
} from "@/lib/admin" 

// Components needed for the modal
import { useToast } from "@/components/ui/use-toast"
// NEW IMPORT: Assuming EditTaskForm exists at this path based on the reference file
import { EditTaskForm } from "@/components/edit-task-form" 

import { 
    CheckSquare, Plus, Search, Filter, Edit, ChevronDown, User, UserPlus, Calendar, FolderOpen, Eye, 
    Loader2, IndianRupee, Package, Phone, MessageSquare, CreditCard, Truck 
} from "lucide-react"

// =============================================================
// STAFF TYPE DEFINITION (Matching the API response structure)
// =============================================================
export interface Staff {
    id: number;
    name: string; 
    role: string;
}

// =============================================================
// HELPER FUNCTIONS 
// =============================================================

const TASK_STATUSES = ['pending', 'assigned', 'inprogress', 'completed'];
const ORDER_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled']; 

const getTaskStatusColor = (status?: string | null) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'inprogress': case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
}

const getProjectStatusColor = (status?: string | null) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'in_progress': return 'bg-blue-100 text-blue-800'
    case 'pending': return 'bg-orange-100 text-orange-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPaymentStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    let color = 'bg-gray-100 text-gray-800';
    let label = status;

    if (lowerStatus === 'paid' || lowerStatus === 'completed') {
        color = 'bg-green-100 text-green-800';
    } else if (lowerStatus === 'pending' || lowerStatus === 'unpaid') {
        color = 'bg-red-100 text-red-800';
    } else if (lowerStatus === 'partial') {
        color = 'bg-yellow-100 text-yellow-800';
    }

    return <Badge className={`capitalize ${color}`}>{label.replace(/_/g, ' ')}</Badge>;
};

// Updated Props: Removed handleOpenEditTaskModal, added onTaskDataChange
interface TaskManagementProps {
    tasks: DetailedTask[];
    isLoading: boolean;
    setActiveTab: (tab: string) => void;
    setSearchTerm: (term: string) => void; 
    onTaskDataChange: () => void; // Signal parent component to refresh task list
}

export const TaskManagementPage: React.FC<TaskManagementProps> = ({
    tasks,
    isLoading,
    setActiveTab,
    setSearchTerm,
    onTaskDataChange, // Updated prop usage
}) => {
    const { toast } = useToast();
    
    // --- Staff State (New: Fetched dynamically) ---
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isStaffLoading, setIsStaffLoading] = useState(true);

    // --- Task Filter States ---
    const [taskSearchTerm, setTaskSearchTerm] = useState("");
    const [taskStaffFilterName, setTaskStaffFilterName] = useState("all");
    const [taskStatusFilter, setTaskStatusFilter] = useState("all");
    const [taskFromDate, setTaskFromDate] = useState("");
    const [taskToDate, setTaskToDate] = useState("");
    const [isTaskFilterOpen, setIsTaskFilterOpen] = useState(false);

    // --- Task Edit Modal States (NEW) ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<DetailedTask | null>(null);

    // --- View Detail States for Order Modal 
    const [viewingOrder, setViewingOrder] = useState<OrderById | null>(null);
    const [isOrderDetailsLoading, setIsOrderDetailsLoading] = useState(false);

    // --- Fetch Active Staff on Component Mount (New) ---
    useEffect(() => {
        const fetchStaff = async () => {
            setIsStaffLoading(true);
            try {
                const response = await getActiveStaffs();
                if (response.data && response.data.staffs) {
                    setStaff(response.data.staffs as Staff[]);
                } else {
                    console.error("Failed to load active staff:", response.error);
                    toast({
                        title: "Error",
                        description: "Failed to load staff list.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("API Error fetching staff:", error);
                toast({
                    title: "API Error",
                    description: "An unexpected error occurred while fetching staff.",
                    variant: "destructive",
                });
            } finally {
                setIsStaffLoading(false);
            }
        };

        fetchStaff();
    }, [toast]);

    // --- Task Edit Handlers (NEW) ---
    const handleOpenEditModal = (task: DetailedTask) => {
        setSelectedTaskForEdit(task);
        setIsEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setSelectedTaskForEdit(null);
        // Notify the parent component to refresh the task list
        onTaskDataChange(); 
        toast({
            title: "Task Updated",
            description: "Task changes saved successfully.",
        });
    };
    
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch =
                (task.task_description?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                task.assigned_to?.staff_name?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                task.order_id?.toString().includes(taskSearchTerm));

            const matchesStatus = taskStatusFilter === 'all' || task.status?.toLowerCase() === taskStatusFilter.toLowerCase();
            
            // Staff filter: Matches against fetched staff names
            const matchesStaff = taskStaffFilterName === 'all' || task.assigned_to?.staff_name === taskStaffFilterName; 

            let matchesDate = true;
            const taskCompletionTime = task.completion_time ? new Date(task.completion_time).getTime() : null;
            const hasDateFilters = taskFromDate || taskToDate;

            if (hasDateFilters) {
                if (taskCompletionTime === null) {
                    matchesDate = false;
                } else {
                    if (taskFromDate) {
                        const fromDate = new Date(taskFromDate).getTime();
                        matchesDate = matchesDate && taskCompletionTime >= fromDate;
                    }
                    if (taskToDate) {
                        const toDate = new Date(taskToDate);
                        toDate.setDate(toDate.getDate() + 1);
                        const toDateTime = toDate.getTime();
                        matchesDate = matchesDate && taskCompletionTime < toDateTime;
                    }
                }
            }
            return matchesSearch && matchesStatus && matchesStaff && matchesDate;
        });
    }, [tasks, taskSearchTerm, taskStatusFilter, taskStaffFilterName, taskFromDate, taskToDate]);

    const handleViewOrder = async (orderId: number) => {
        setViewingOrder(null);
        setIsOrderDetailsLoading(true);

        setViewingOrder({ id: orderId } as OrderById); 
        
        try {
            const orderResponse = await getOrder(orderId);
            
            if (orderResponse.data) {
                setViewingOrder(orderResponse.data);
            } else {
                console.error("Failed to load detailed order view:", orderResponse.error);
                toast({
                    title: "Error",
                    description: "Failed to load detailed project information.",
                    variant: "destructive",
                });
                setViewingOrder(null); 
            }
        } catch (error) {
             toast({
                title: "API Error",
                description: `An unexpected error occurred while fetching order details for ID ${orderId}.`,
                variant: "destructive",
            });
            setViewingOrder(null);
        } finally {
            setIsOrderDetailsLoading(false);
        }
    };

    const renderTaskFilters = (isMobile: boolean) => (
        <>
            <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Search tasks, staff, or order ID..." 
                    className="pl-10" 
                    value={taskSearchTerm}
                    onChange={(e) => setTaskSearchTerm(e.target.value)}
                />
            </div>

            {/* Updated STAFF FILTER: Now uses fetched staff with name and role display */}
            <Select value={taskStaffFilterName} onValueChange={setTaskStaffFilterName} disabled={isLoading || isStaffLoading}>
                <SelectTrigger className="w-full md:w-[180px] flex-shrink-0">
                    <SelectValue placeholder="Assigned Staff" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {staff.map(s => (
                        <SelectItem key={s.id} value={s.name}>
                            {s.name} ({s.role})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* STATUS FILTER */}
            <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px] flex-shrink-0">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {TASK_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* DATE INPUTS */}
            <Input type="date" value={taskFromDate} onChange={(e) => setTaskFromDate(e.target.value)} className="w-full md:w-[150px] flex-shrink-0" />
            <Input type="date" value={taskToDate} onChange={(e) => setTaskToDate(e.target.value)} className="w-full md:w-[150px] flex-shrink-0" />
        </>
    );

    const filterCount = [taskStatusFilter, taskStaffFilterName, taskFromDate, taskToDate].filter(f => f !== 'all' && f !== '').length;

    return (
        <>
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center">
                            <CheckSquare className="h-5 w-5 mr-2" />
                            Task Management
                        </CardTitle>
                        <CardDescription>Track individual tasks and assignments</CardDescription>
                    </div>
                    {/* Placeholder for New Task button */}
                    <Button className="w-full sm:w-auto" disabled> 
                        <Plus className="h-4 w-4 mr-2" />
                        New Task (Disabled)
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters (Desktop) */}
                <div className="hidden md:flex items-center space-x-2 mb-6 gap-2 flex-wrap">
                    {renderTaskFilters(false)}
                </div>

                {/* Filters (Mobile Collapsible) */}
                <Collapsible 
                    open={isTaskFilterOpen} 
                    onOpenChange={setIsTaskFilterOpen} 
                    className="md:hidden mb-4 border rounded-lg bg-gray-50"
                >
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start text-sm text-gray-700 p-3 h-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters ({filterCount})
                        <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isTaskFilterOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 p-3 pt-0">
                    <div className="flex flex-col gap-3">
                        {renderTaskFilters(true)}
                    </div>
                </CollapsibleContent>
                </Collapsible>
                
                {isLoading || isStaffLoading ? (
                    <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading tasks and staff...</p>
                    </div>
                </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No tasks found matching criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map((task) => (
                        <div key={task.id} className="border rounded-lg p-4 transition-shadow hover:shadow-md bg-white">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
                                        <CheckSquare className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{task.task_description || "Untitled Task"}</h3>
                                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <span className="font-medium text-gray-800">Assigned To:</span>{' '}
                                                    {task.assigned_to?.staff_name ? (
                                                        <>{task.assigned_to.staff_name}{task.assigned_to.role && <span className="text-gray-500"> ({task.assigned_to.role})</span>}</>
                                                    ) : (<span className="italic">Not Assigned</span>)}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <UserPlus className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <span className="font-medium text-gray-800">Assigned By:</span>{' '}
                                                    {task.assigned_by?.staff_name ? (
                                                        <>{task.assigned_by.staff_name}{task.assigned_by.role && <span className="text-gray-500"> ({task.assigned_by.role})</span>}</>
                                                    ) : (<span className="italic">System/Unknown</span>)}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <span className="font-medium text-gray-800">Due Date:</span>{' '}
                                                    {task.completion_time ? new Date(task.completion_time).toLocaleDateString() : "TBD"}
                                                </div>
                                            </div>
                                            {task.updated_by?.staff_name && (
                                                <div className="flex items-center">
                                                    <Edit className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <div>
                                                        <span className="font-medium text-gray-800">Updated By:</span>{' '}
                                                        {task.updated_by.staff_name}
                                                        {task.updated_by.role && <span className="text-gray-500"> ({task.updated_by.role})</span>}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center">
                                                <FolderOpen className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <span className="font-medium text-gray-800">Project:</span>{' '}
                                                    PRJ-{task.order_id}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto text-left md:text-right">
                                    <Badge variant="secondary" className={`capitalize ${getTaskStatusColor(task.status)}`}>{task.status}</Badge>
                                    <div className="flex justify-start md:justify-end space-x-2 mt-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleOpenEditModal(task)} // *** CALLS INTERNAL HANDLER ***
                                        >
                                        <Edit className="h-3 w-3 mr-1" />Edit
                                        </Button>
                                        
                                        <Button 
                                            variant="secondary" 
                                            size="sm"
                                            onClick={() => handleViewOrder(task.order_id)}
                                        >
                                        <Eye className="h-3 w-3 mr-1" />View Order
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
        
        {/* ============================================================= */}
        {/* TASK EDIT FORM MODAL (NEWLY ADDED) */}
        {/* ============================================================= */}
        <EditTaskForm
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={handleEditSuccess}
            task={selectedTaskForEdit}
            staffList={staff} // Pass staff list for reassignment options
        />

        {/* ============================================================= */}
        {/* ORDER DETAILS VIEW DIALOG (Only shows Order Details) */}
        {/* ============================================================= */}
        <Dialog open={!!viewingOrder} onOpenChange={(open) => { 
            if (!open) { 
                setViewingOrder(null);
                setIsOrderDetailsLoading(false);
            } 
        }}>
            <DialogContent className="sm:max-w-[425px] md:max-w-xl flex flex-col max-h-[90vh]">
                
                <DialogHeader className="flex-shrink-0">
                <DialogTitle>Order Details #{viewingOrder?.id}</DialogTitle>
                <DialogDescription>
                    Comprehensive information about this customer order.
                </DialogDescription>
                </DialogHeader>
                
                {isOrderDetailsLoading ? (
                    <div className="py-10 flex flex-col items-center flex-grow">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm text-gray-500">Loading order details...</p>
                </div>
                ) : viewingOrder && (
                    <div className="overflow-y-auto flex-grow pr-2">
                        <div className="grid gap-4 py-4 text-sm">
                            
                            {/* CUSTOMER INFO SECTION */}
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <h4 className="font-bold text-gray-700 mb-2">Customer Information</h4>
                                
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <span className="font-medium text-gray-500">Customer Name</span>
                                    <span className="col-span-2 font-semibold text-blue-700">{viewingOrder.customer_name || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <span className="font-medium text-gray-500">Mobile Number</span>
                                    {viewingOrder.mobile_number ? (
                                        <a
                                            href={`tel:${viewingOrder.mobile_number}`}
                                            className="col-span-2 flex items-center text-blue-600 hover:text-blue-800 transition duration-150"
                                        >
                                        <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                        {viewingOrder.mobile_number}
                                        </a>
                                    ) : (
                                        <span className="col-span-2 text-gray-500">N/A</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <span className="font-medium text-gray-500">WhatsApp</span>
                                    {viewingOrder.whatsapp_number ? (
                                        <a
                                            href={`https://wa.me/${viewingOrder.whatsapp_number}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="col-span-2 flex items-center text-green-600 hover:text-green-800 transition duration-150"
                                        >
                                        <MessageSquare className="h-3 w-3 mr-2 text-gray-400" />
                                        {viewingOrder.whatsapp_number}
                                        </a>
                                    ) : (
                                        <span className="col-span-2 text-gray-500">N/A</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* ORDER CORE DETAILS */}
                            <h4 className="font-bold text-gray-700 mt-2 border-t pt-3">Product & Order Details</h4>
                            
                            {/* Generated Order ID Display */}
                            {viewingOrder.generated_order_id && (
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <span className="font-medium text-gray-500">Generated ID</span>
                                    <span className="col-span-2 font-bold text-red-600">{viewingOrder.generated_order_id}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Product Name</span>
                                <span className="col-span-2">{viewingOrder.product_name || 'N/A'}</span>
                            </div>
                            
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500 flex items-center"><Package className="h-4 w-4 mr-1" /> Type</span>
                                <span className="col-span-2 font-medium text-purple-700 capitalize">{viewingOrder.order_type?.replace(/_/g, ' ') || 'N/A'}</span>
                            </div>
                            
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Category</span>
                                <span className="col-span-2">{viewingOrder.category || 'N/A'}</span>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Quantity</span>
                                <span className="col-span-2">{viewingOrder.quantity || 0}</span>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Status</span>
                                <Badge className={getProjectStatusColor(viewingOrder.status || 'pending')}>{viewingOrder.status || 'Pending'}</Badge>
                            </div>
                            
                            {/* FINANCIAL DETAILS */}
                            <h4 className="font-bold text-gray-700 mt-4 border-t pt-3 flex items-center"><IndianRupee className="h-4 w-4 mr-2" /> Financials</h4>
                            
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Total Billed Amount</span>
                                <span className="col-span-2 flex items-center text-blue-700 font-bold">
                                    {/* Using viewingOrder.amount or total_amount based on API structure */}
                                    ₹ {(viewingOrder.total_amount || viewingOrder.amount)?.toLocaleString('en-IN') || '0.00'} 
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Additional Charges</span>
                                <span className="col-span-2 flex items-center text-gray-700 font-medium">
                                    ₹ {viewingOrder.additional_amount ? viewingOrder.additional_amount.toLocaleString('en-IN') : '0.00'} 
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Amount Paid</span>
                                <span className="col-span-2 flex items-center text-orange-700 font-medium">
                                    ₹ {viewingOrder.amount_payed ? viewingOrder.amount_payed.toLocaleString('en-IN') : '0.00'}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Payment Status</span>
                                <span className="col-span-2">{getPaymentStatusBadge(viewingOrder.payment_status || 'pending')}</span>
                            </div>
                            
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500 flex items-center"><CreditCard className="h-4 w-4 mr-1" /> Payment Method</span>
                                <span className="col-span-2 capitalize">{viewingOrder.payment_method?.replace(/_/g, ' ') || 'N/A'}</span>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Account Name</span>
                                <span className="col-span-2">{viewingOrder.account_name || 'N/A'}</span>
                            </div>
                            
                            {/* DATE DETAILS */}
                            <h4 className="font-bold text-gray-700 mt-4 border-t pt-3">Timeline</h4>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Project Commitment</span>
                                <span className="col-span-2">{viewingOrder.project_committed_on || 'N/A'}</span>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Start Date</span>
                                <span className="col-span-2">{viewingOrder.start_on ? new Date(viewingOrder.start_on).toLocaleDateString() : 'N/A'}</span>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Completion Target</span>
                                <span className="col-span-2">{viewingOrder.completion_date ? new Date(viewingOrder.completion_date).toLocaleDateString() : 'N/A'}</span>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Completed On</span>
                                <span className="col-span-2">{viewingOrder.completed_on ? new Date(viewingOrder.completed_on).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            
                            {/* DELIVERY DETAILS */}
                            <h4 className="font-bold text-gray-700 mt-4 border-t pt-3 flex items-center"><Truck className="h-4 w-4 mr-2" /> Delivery</h4>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Delivery Type</span>
                                <span className="col-span-2 capitalize">{viewingOrder.delivery_type?.replace(/_/g, ' ') || 'N/A'}</span>
                            </div>

                            {viewingOrder.delivery_type?.toLowerCase() !== 'pickup' && viewingOrder.delivery_address && (
                                <div className="pt-2">
                                    <p className="font-medium text-gray-500 mb-2">Delivery Address</p>
                                    <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border">{viewingOrder.delivery_address}</p>
                                </div>
                            )}
                            
                            {viewingOrder.delivery_type?.toLowerCase() === 'home_delivery' && !viewingOrder.delivery_address && (
                                <div className="pt-2 text-red-500 italic">
                                    Delivery selected, but no address recorded.
                                </div>
                            )}
                            
                            {/* DESCRIPTION */}
                            <div className="pt-4 border-t mt-4">
                                <p className="font-medium text-gray-500 mb-2">Description / Notes</p>
                                <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border">{viewingOrder.description || 'No description provided.'}</p>
                            </div>

                            {/* FOOTER */}
                            <div className="mt-4 pt-4 text-xs text-gray-500 text-right flex-shrink-0">
                                <p>Created by: {viewingOrder.created_by_staff_name || 'Staff'} on {new Date(viewingOrder.created_on).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
        
        {/* If Toaster is not rendered globally, uncomment this line */}
        {/* <Toaster /> */} 
        </>
    );
};