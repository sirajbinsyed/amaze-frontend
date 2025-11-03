// components/dashboards/sales/SalesOrdersTab.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Search, ShoppingCart, Edit, Trash2 } from "lucide-react"
import { type Order, type Customer, type RealCustomer, type StaffUser } from "@/lib/sales"

interface SalesOrdersTabProps {
    error: string
    isOrdersLoading: boolean
    orderSearchTerm: string
    setOrderSearchTerm: (term: string) => void
    orderStaffFilterName: string
    setOrderStaffFilterName: (name: string) => void
    orderStatusFilter: string
    setOrderStatusFilter: (status: string) => void
    orderFromDate: string
    setOrderFromDate: (date: string) => void
    orderToDate: string
    setOrderToDate: (date: string) => void
    staffs: StaffUser[]
    isStaffLoading: boolean
    filteredOrders: Order[]
    ORDER_STATUSES: string[]
    customers: Customer[]
    realCustomers: RealCustomer[]
    handleViewOrder: (order: Order) => void
    handleEditOrder: (order: Order) => void
    handleDeleteOrder: (id: number) => void
    getOrderStatusColor: (status: string) => string
}

export const SalesOrdersTab: React.FC<SalesOrdersTabProps> = ({
    error,
    isOrdersLoading,
    orderSearchTerm,
    setOrderSearchTerm,
    orderStaffFilterName,
    setOrderStaffFilterName,
    orderStatusFilter,
    setOrderStatusFilter,
    orderFromDate,
    setOrderFromDate,
    orderToDate,
    setOrderToDate,
    staffs,
    isStaffLoading,
    filteredOrders,
    ORDER_STATUSES,
    customers,
    realCustomers,
    handleViewOrder,
    handleEditOrder,
    handleDeleteOrder,
    getOrderStatusColor
}) => {
    // Combine customer lists for lookup
    const allKnownCustomers: (Customer | RealCustomer)[] = [...customers, ...realCustomers];

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center"><ShoppingCart className="h-5 w-5 mr-2" />Order Management</CardTitle>
                        <CardDescription>Manage customer orders and track project progress</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

                {/* ORDER SEARCH AND FILTER SECTION */}
                <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-2 mb-6 gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[150px]"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search orders..." className="pl-10" value={orderSearchTerm} onChange={(e) => setOrderSearchTerm(e.target.value)} /></div>

                    {/* STAFF FILTER */}
                    <Select value={orderStaffFilterName} onValueChange={setOrderStaffFilterName} disabled={isStaffLoading}>
                        <SelectTrigger className="w-full md:w-[150px] flex-shrink-0">
                            <SelectValue placeholder="Staff" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Staff</SelectItem>
                            {staffs.map(staff => (<SelectItem key={staff.id} value={staff.staff_name}>{staff.staff_name}</SelectItem>))}
                        </SelectContent>
                    </Select>

                    {/* STATUS FILTER */}
                    <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                        <SelectTrigger className="w-full md:w-[150px] flex-shrink-0">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {ORDER_STATUSES.map(status => (<SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</SelectItem>))}
                        </SelectContent>
                    </Select>

                    {/* FROM DATE INPUT */}
                    <Input
                        type="date"
                        placeholder="From Date"
                        value={orderFromDate}
                        onChange={(e) => setOrderFromDate(e.target.value)}
                        className="w-full md:w-[150px] flex-shrink-0"
                    />
                    
                    {/* TO DATE INPUT */}
                    <Input
                        type="date"
                        placeholder="To Date"
                        value={orderToDate}
                        onChange={(e) => setOrderToDate(e.target.value)}
                        className="w-full md:w-[150px] flex-shrink-0"
                    />
                </div>

                {isOrdersLoading ? (
                    <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-2 text-sm text-gray-500">Loading orders...</p></div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-8"><ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No orders found matching criteria.</p></div>
                        ) : (
                            filteredOrders.map((order) => {
                                const customer = allKnownCustomers.find(c => c.id === order.customer_id);
                                return (
                                    <div key={order.id} className="border rounded-lg p-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center"><ShoppingCart className="h-6 w-6 text-green-600" /></div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                                                    <p className="text-gray-600">{customer?.customer_name || 'Unknown Customer'}</p>
                                                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                                                        <p>Created by {order.created_by_staff_name || 'Staff'} on {new Date(order.created_on).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <div className="flex items-center justify-start md:justify-end space-x-2 mb-2"><Badge variant="default" className={getOrderStatusColor(order.status || 'pending')}>{order.status || 'pending'}</Badge></div>
                                                <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                                                    <Button variant="secondary" size="sm" onClick={() => handleViewOrder(order)}>View Details</Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}><Edit className="h-3 w-3 mr-1" />Edit</Button>
                                                    <AlertDialog><AlertDialogTrigger asChild><Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"><Trash2 className="h-3 w-3 mr-1" />Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Order</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete Order #{order.id}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}