// components/dashboards/sales/SalesCustomersTab.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Phone, MessageSquare, Edit, ShoppingCart } from "lucide-react"
import { type RealCustomer, type StaffUser } from "@/lib/sales"

interface SalesCustomersTabProps {
    error: string
    isRealCustomersLoading: boolean
    realCustomerSearchTerm: string
    setRealCustomerSearchTerm: (term: string) => void
    customerStaffFilterName: string
    setCustomerStaffFilterName: (name: string) => void
    customerFromDate: string
    setCustomerFromDate: (date: string) => void
    customerToDate: string
    setCustomerToDate: (date: string) => void
    staffs: StaffUser[]
    isStaffLoading: boolean
    filteredRealCustomers: RealCustomer[]
    handleViewRealCustomer: (customer: RealCustomer) => void
    handleEditRealCustomer: (customer: RealCustomer) => void
    handleMakeNewOrder: (customer: RealCustomer) => void
}

export const SalesCustomersTab: React.FC<SalesCustomersTabProps> = ({
    error,
    isRealCustomersLoading,
    realCustomerSearchTerm,
    setRealCustomerSearchTerm,
    customerStaffFilterName,
    setCustomerStaffFilterName,
    customerFromDate,
    setCustomerFromDate,
    customerToDate,
    setCustomerToDate,
    staffs,
    isStaffLoading,
    filteredRealCustomers,
    handleViewRealCustomer,
    handleEditRealCustomer,
    handleMakeNewOrder,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><Users className="h-5 w-5 mr-2" />Customer Management</CardTitle>
                <CardDescription>View your existing customers who have placed orders.</CardDescription>
            </CardHeader>
            <CardContent>
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

                {/* CUSTOMER SEARCH AND FILTER SECTION */}
                <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-2 mb-6 gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[150px]"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search customers..." className="pl-10" value={realCustomerSearchTerm} onChange={(e) => setRealCustomerSearchTerm(e.target.value)} /></div>

                    {/* STAFF FILTER */}
                    <Select value={customerStaffFilterName} onValueChange={setCustomerStaffFilterName} disabled={isStaffLoading}>
                        <SelectTrigger className="w-full md:w-[150px] flex-shrink-0">
                            <SelectValue placeholder="Staff" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Staff</SelectItem>
                            {staffs.map(staff => (<SelectItem key={staff.id} value={staff.staff_name}>{staff.staff_name}</SelectItem>))}
                        </SelectContent>
                    </Select>

                    {/* FROM DATE INPUT */}
                    <Input
                        type="date"
                        placeholder="From Date"
                        value={customerFromDate}
                        onChange={(e) => setCustomerFromDate(e.target.value)}
                        className="w-full md:w-[150px] flex-shrink-0"
                    />
                    
                    {/* TO DATE INPUT */}
                    <Input
                        type="date"
                        placeholder="To Date"
                        value={customerToDate}
                        onChange={(e) => setCustomerToDate(e.target.value)}
                        className="w-full md:w-[150px] flex-shrink-0"
                    />
                </div>

                {isRealCustomersLoading ? (
                    <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-2 text-sm text-gray-500">Loading customers...</p></div>
                ) : (
                    <div className="space-y-4">
                        {filteredRealCustomers.length === 0 ? (
                            <div className="text-center py-8"><Users className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No customers found matching criteria.</p><p className="text-sm text-gray-400">Leads that are converted to orders will appear here.</p></div>
                        ) : (
                            filteredRealCustomers.map((customer) => (
                                <div key={customer.id} className="border rounded-lg p-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center"><Users className="h-6 w-6 text-blue-600" /></div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{customer.customer_name}</h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 sm:gap-x-4 mt-1 text-sm text-gray-500"><span className="flex items-center"><Phone className="h-3 w-3 mr-1" />{customer.mobile_number}</span><span className="flex items-center"><MessageSquare className="h-3 w-3 mr-1" />{customer.whatsapp_number}</span></div>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <div className="text-xs text-gray-500 mb-2 space-y-1">
                                                <p>Created by {customer.created_by_staff_name} on {new Date(customer.created_on).toLocaleDateString()}</p>
                                                <p>Last updated: {new Date(customer.updated_on).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                                                <Button variant="secondary" size="sm" onClick={() => handleViewRealCustomer(customer)}>View Details</Button>
                                                <Button variant="outline" size="sm" onClick={() => handleEditRealCustomer(customer)}><Edit className="h-3 w-3 mr-1" />Edit</Button>
                                                <Button variant="default" size="sm" onClick={() => handleMakeNewOrder(customer)} className="bg-green-600 hover:bg-green-700 text-white"><ShoppingCart className="h-3 w-3 mr-1" />Make New Order</Button>
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