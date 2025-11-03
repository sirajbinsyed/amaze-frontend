// components/dashboards/crm/LeadsTab.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Search, Target, Plus, ArrowRight, Edit, Trash2 } from "lucide-react"
import { type Customer, type StaffUser } from "@/lib/api"

// Define the expected props
interface LeadsTabProps {
    error: string
    isLoading: boolean
    searchTerm: string
    setSearchTerm: (term: string) => void
    leadStaffFilterName: string
    setLeadStaffFilterName: (name: string) => void
    leadStatusFilter: string
    setLeadStatusFilter: (status: string) => void
    leadFromDate: string
    setLeadFromDate: (date: string) => void
    leadToDate: string
    setLeadToDate: (date: string) => void
    staffs: StaffUser[]
    isStaffLoading: boolean
    filteredCustomers: Customer[]
    LEAD_STATUSES: string[]
    handleAddCustomer: () => void
    handleViewLead: (lead: Customer) => void
    handleEditCustomer: (lead: Customer) => void
    handleConvertToOrder: (lead: Customer) => void
    handleDeleteCustomer: (id: number) => void
    getStatusColor: (status: string) => string
}

export const LeadsTab: React.FC<LeadsTabProps> = ({
    error,
    isLoading,
    searchTerm,
    setSearchTerm,
    leadStaffFilterName,
    setLeadStaffFilterName,
    leadStatusFilter,
    setLeadStatusFilter,
    leadFromDate,
    setLeadFromDate,
    leadToDate,
    setLeadToDate,
    staffs,
    isStaffLoading,
    filteredCustomers,
    LEAD_STATUSES,
    handleAddCustomer,
    handleViewLead,
    handleEditCustomer,
    handleConvertToOrder,
    handleDeleteCustomer,
    getStatusColor
}) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center"><Target className="h-5 w-5 mr-2" />Lead Management</CardTitle>
                        <CardDescription>Track and manage your sales pipeline</CardDescription>
                    </div>
                    <Button className="w-full sm:w-auto" onClick={handleAddCustomer}><Plus className="h-4 w-4 mr-2" />Add Lead</Button>
                </div>
            </CardHeader>
            <CardContent>
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

                {/* LEAD SEARCH AND FILTER SECTION */}
                <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-2 mb-6 gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[150px]"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search leads..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>

                    {/* STAFF FILTER */}
                    <Select value={leadStaffFilterName} onValueChange={setLeadStaffFilterName} disabled={isStaffLoading}>
                        <SelectTrigger className="w-full md:w-[150px] flex-shrink-0">
                            <SelectValue placeholder="Staff" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Staff</SelectItem>
                            {staffs.map(staff => (<SelectItem key={staff.id} value={staff.staff_name}>{staff.staff_name}</SelectItem>))}
                        </SelectContent>
                    </Select>

                    {/* STATUS FILTER */}
                    <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                        <SelectTrigger className="w-full md:w-[150px] flex-shrink-0">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {LEAD_STATUSES.map(status => (<SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>))}
                        </SelectContent>
                    </Select>
                    
                    {/* FROM DATE INPUT */}
                    <Input
                        type="date"
                        placeholder="From Date"
                        value={leadFromDate}
                        onChange={(e) => setLeadFromDate(e.target.value)}
                        className="w-full md:w-[150px] flex-shrink-0"
                    />
                    
                    {/* TO DATE INPUT */}
                    <Input
                        type="date"
                        placeholder="To Date"
                        value={leadToDate}
                        onChange={(e) => setLeadToDate(e.target.value)}
                        className="w-full md:w-[150px] flex-shrink-0"
                    />
                </div>

                {isLoading ? (
                    <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-2 text-sm text-gray-500">Loading leads...</p></div>
                ) : (
                    <div className="space-y-4">
                        {filteredCustomers.length === 0 ? (
                            <div className="text-center py-8"><Target className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No leads found matching criteria.</p></div>
                        ) : (
                            filteredCustomers.map((lead) => (
                                <div key={lead.id} className="border rounded-lg p-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-orange-100 rounded-full flex-shrink-0 flex items-center justify-center"><Target className="h-6 w-6 text-orange-600" /></div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{lead.customer_name}</h3>
                                                <div className="text-xs text-gray-500 mt-1 space-y-1">
                                                    <p>Created by {lead.created_by_staff_name || 'Staff'} on {new Date(lead.created_on).toLocaleDateString()}</p>
                                                    <p>Last updated: {new Date(lead.updated_on).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <div className="flex items-center justify-start md:justify-end space-x-2 mb-2"><Badge variant="default" className={getStatusColor(lead.status)}>{lead.status}</Badge></div>
                                            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                                                <Button variant="secondary" size="sm" onClick={() => handleViewLead(lead)}>View Details</Button>
                                                <Button variant="outline" size="sm" onClick={() => handleEditCustomer(lead)}><Edit className="h-3 w-3 mr-1" />Edit</Button>
                                                <Button variant="default" size="sm" onClick={() => handleConvertToOrder(lead)} className="bg-green-600 hover:bg-green-700 text-white"><ArrowRight className="h-3 w-3 mr-1" />Convert to Order</Button>
                                                <AlertDialog><AlertDialogTrigger asChild><Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"><Trash2 className="h-3 w-3 mr-1" />Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Lead</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete {lead.customer_name}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCustomer(lead.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}