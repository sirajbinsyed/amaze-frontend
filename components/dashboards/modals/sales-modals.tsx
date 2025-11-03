
"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
    Phone,
    MessageSquare,
    IndianRupee,
    Loader2
} from "lucide-react"

import { CustomerForm, type CustomerFormData } from "@/components/customer-form"
import { OrderForm } from "@/components/order-form"
import { type Customer, type Order, type RealCustomer } from "@/lib/sales" // Adjusted type imports
import { type OrderById } from "@/app/dashboard/sales/page" // Assuming this is the correct path for OrderById

// --- Helper functions (copied locally for dialog styling) ---
const getStatusColor = (status: string) => {
    switch (status) {
        case 'cold': return 'bg-blue-100 text-blue-800'
        case 'warm': return 'bg-orange-100 text-orange-800'
        case 'hot': return 'bg-red-100 text-red-800'
        case 'converted': return 'bg-green-100 text-green-800'
        case 'lost': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

const getOrderStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        case 'confirmed': return 'bg-blue-100 text-blue-800'
        case 'in_progress': return 'bg-orange-100 text-orange-800'
        case 'completed': return 'bg-green-100 text-green-800'
        case 'cancelled': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

// Define the interface for props expected by SalesModals
interface SalesModalsProps {
    // Form State & Handlers
    isCustomerFormOpen: boolean
    setIsCustomerFormOpen: (open: boolean) => void
    isOrderFormOpen: boolean
    setIsOrderFormOpen: (open: boolean) => void
    formMode: 'create' | 'edit'
    editingItem: Customer | RealCustomer | null
    editingEntityType: 'lead' | 'customer' | null
    handleSaveItem: (id: number, data: CustomerFormData) => Promise<void>
    handleFormSuccess: () => void

    // Order Context
    convertingCustomer: Customer | null
    setConvertingCustomer: (customer: Customer | null) => void
    orderingForCustomer: RealCustomer | null
    setOrderingForCustomer: (customer: RealCustomer | null) => void
    editingOrder: Order | null
    setEditingOrder: (order: Order | null) => void

    // Detail View State & Handlers
    viewingLead: Customer | null
    setViewingLead: (lead: Customer | null) => void
    viewingRealCustomer: RealCustomer | null
    setViewingRealCustomer: (customer: RealCustomer | null) => void
    viewingOrder: OrderById | null
    setViewingOrder: (order: OrderById | null) => void
    isOrderDetailsLoading: boolean
}

export const SalesModals: React.FC<SalesModalsProps> = ({
    isCustomerFormOpen,
    setIsCustomerFormOpen,
    isOrderFormOpen,
    setIsOrderFormOpen,
    formMode,
    editingItem,
    editingEntityType,
    handleSaveItem,
    handleFormSuccess,
    convertingCustomer,
    setConvertingCustomer,
    orderingForCustomer,
    setOrderingForCustomer,
    editingOrder,
    setEditingOrder,
    viewingLead,
    setViewingLead,
    viewingRealCustomer,
    setViewingRealCustomer,
    viewingOrder,
    setViewingOrder,
    isOrderDetailsLoading,
}) => {

    const handleOrderFormClose = () => {
        setIsOrderFormOpen(false)
        setConvertingCustomer(null)
        setEditingOrder(null)
        setOrderingForCustomer(null)
    }
    
    return (
        <>
            {/* 1. Customer/Lead Form Modal */}
            <CustomerForm
                isOpen={isCustomerFormOpen}
                onClose={() => setIsCustomerFormOpen(false)}
                onSuccess={handleFormSuccess}
                customer={editingItem}
                mode={formMode}
                onSave={handleSaveItem}
            />

            {/* 2. Order Form Modal */}
            <OrderForm
                isOpen={isOrderFormOpen}
                onClose={handleOrderFormClose}
                onSuccess={handleFormSuccess}
                order={editingOrder}
                customer={convertingCustomer || orderingForCustomer}
                mode={editingOrder ? 'edit' : 'create'}
            />

            {/* 3. Lead Details View Dialog */}
            <Dialog open={!!viewingLead} onOpenChange={(open) => { if (!open) setViewingLead(null) }}>
                <DialogContent className="sm:max-w-[425px] md:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Lead Details: {viewingLead?.customer_name}</DialogTitle>
                        <DialogDescription>
                            Comprehensive information about this potential customer lead.
                        </DialogDescription>
                    </DialogHeader>
                    {viewingLead && (
                        <div className="grid gap-4 py-4 text-sm">

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Name</span>
                                <span className="col-span-2 font-semibold text-blue-700">{viewingLead.customer_name}</span>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Status</span>
                                <Badge className={getStatusColor(viewingLead.status)}>{viewingLead.status}</Badge>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4 border-t pt-4">
                                <span className="font-medium text-gray-500">Mobile Number</span>
                                <a
                                    href={`tel:${viewingLead.mobile_number}`}
                                    className="col-span-2 flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-150"
                                >
                                    <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                    {viewingLead.mobile_number}
                                </a>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">WhatsApp Number</span>
                                {viewingLead.whatsapp_number ? (
                                    <a
                                        href={`https://wa.me/${viewingLead.whatsapp_number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="col-span-2 flex items-center text-green-600 hover:text-green-800 font-medium transition duration-150"
                                    >
                                        <MessageSquare className="h-3 w-3 mr-2 text-gray-400" />
                                        {viewingLead.whatsapp_number}
                                    </a>
                                ) : (
                                    <span className="col-span-2 flex items-center text-gray-500">
                                        <MessageSquare className="h-3 w-3 mr-2 text-gray-400" />
                                        N/A
                                    </span>
                                )}
                            </div>

                            {/* Requirement/Description */}
                            <div className="pt-4 border-t mt-4">
                                <p className="font-medium text-gray-500 mb-2">Requirement/Notes</p>
                                {/* Note: using project_committed_on or description depending on your Customer API structure, sticking to the existing field used in the lead context in the original code. */}
                                <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border">{(viewingLead as any).requirements || 'No specific requirement/notes provided.'}</p>
                            </div>

                            {/* Address */}
                            <div className="pt-4 border-t">
                                <p className="font-medium text-gray-500 mb-2">Address</p>
                                <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border">{viewingLead.address || 'No address provided.'}</p>
                            </div>

                            <div className="mt-4 pt-4 text-xs text-gray-500 text-right">
                                <p>Created by: {viewingLead.created_by_staff_name || 'Staff'} on {new Date(viewingLead.created_on).toLocaleDateString()}</p>
                                <p>Last Updated: {new Date(viewingLead.updated_on).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* 4. Real Customer Details View Dialog */}
            <Dialog open={!!viewingRealCustomer} onOpenChange={(open) => { if (!open) setViewingRealCustomer(null) }}>
                <DialogContent className="sm:max-w-[425px] md:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Customer Details: {viewingRealCustomer?.customer_name}</DialogTitle>
                        <DialogDescription>
                            Detailed information about this existing customer.
                        </DialogDescription>
                    </DialogHeader>
                    {viewingRealCustomer && (
                        <div className="grid gap-4 py-4 text-sm">

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">Name</span>
                                <span className="col-span-2 font-semibold text-blue-700">{viewingRealCustomer.customer_name}</span>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4 border-t pt-4">
                                <span className="font-medium text-gray-500">Mobile Number</span>
                                <a
                                    href={`tel:${viewingRealCustomer.mobile_number}`}
                                    className="col-span-2 flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-150"
                                >
                                    <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                    {viewingRealCustomer.mobile_number}
                                </a>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="font-medium text-gray-500">WhatsApp Number</span>
                                {viewingRealCustomer.whatsapp_number ? (
                                    <a
                                        href={`https://wa.me/${viewingRealCustomer.whatsapp_number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="col-span-2 flex items-center text-green-600 hover:text-green-800 font-medium transition duration-150"
                                    >
                                        <MessageSquare className="h-3 w-3 mr-2 text-gray-400" />
                                        {viewingRealCustomer.whatsapp_number}
                                    </a>
                                ) : (
                                    <span className="col-span-2 flex items-center text-gray-500">
                                        <MessageSquare className="h-3 w-3 mr-2 text-gray-400" />
                                        N/A
                                    </span>
                                )}
                            </div>

                            <div className="pt-4 border-t mt-4">
                                <p className="font-medium text-gray-500 mb-2">Address</p>
                                <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border">{viewingRealCustomer.address || 'No address provided.'}</p>
                            </div>

                            <div className="mt-4 pt-4 text-xs text-gray-500 text-right">
                                <p>Customer ID: {viewingRealCustomer.id}</p>
                                <p>Created by: {viewingRealCustomer.created_by_staff_name || 'Staff'} on {new Date(viewingRealCustomer.created_on).toLocaleDateString()}</p>
                                <p>Last Updated: {new Date(viewingRealCustomer.updated_on).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* 5. Order Details View Dialog */}
            <Dialog open={!!viewingOrder} onOpenChange={(open) => { if (!open) setViewingOrder(null) }}>
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
                                
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <span className="font-medium text-gray-500">Customer Name</span>
                                    <span className="col-span-2 font-semibold text-blue-700">{viewingOrder.customer_name || 'N/A'}</span>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <span className="font-medium text-gray-500">Mobile Number</span>
                                    {viewingOrder.mobile_number ? (
                                        <a
                                            href={`tel:${viewingOrder.mobile_number}`}
                                            className="col-span-2 flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-150"
                                        >
                                            <Phone className="h-3 w-3 mr-2 text-gray-400"/>
                                            {viewingOrder.mobile_number}
                                        </a>
                                    ) : (
                                        <span className="col-span-2 text-gray-500">N/A</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <span className="font-medium text-gray-500">WhatsApp Number</span>
                                    {viewingOrder.whatsapp_number ? (
                                        <a
                                            href={`https://wa.me/${viewingOrder.whatsapp_number}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="col-span-2 flex items-center text-green-600 hover:text-green-800 font-medium transition duration-150"
                                        >
                                            <MessageSquare className="h-3 w-3 mr-2 text-gray-400"/>
                                            {viewingOrder.whatsapp_number}
                                        </a>
                                    ) : (
                                        <span className="col-span-2 text-gray-500">N/A</span>
                                    )}
                                </div>

                                <div className="pt-4 border-t mt-4">
                                    <p className="font-medium text-gray-500 mb-2">Address</p>
                                    <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border">{viewingOrder.address || 'No address provided.'}</p>
                                </div>


                                <div className="grid grid-cols-3 items-center gap-4 border-t pt-4">
                                    <span className="font-medium text-gray-500">Category</span>
                                    <span className="col-span-2">{viewingOrder.category || 'N/A'}</span>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <span className="font-medium text-gray-500">Amount</span>
                                    <span className="col-span-2 flex items-center text-green-700 font-bold">
                                    <IndianRupee className="w-4 h-4 mr-1" />
                                    {viewingOrder.amount ? viewingOrder.amount.toLocaleString() : 'N/A'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <span className="font-medium text-gray-500">Status</span>
                                    <Badge className={getOrderStatusColor(viewingOrder.status || 'pending')}>{viewingOrder.status || 'Pending'}</Badge>
                                </div>

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

                                <div className="pt-4 border-t mt-4">
                                    <p className="font-medium text-gray-500 mb-2">Description</p>
                                    <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border">{viewingOrder.description || 'No description provided.'}</p>
                                </div>

                                <div className="mt-4 pt-4 text-xs text-gray-500 text-right flex-shrink-0">
                                    <p>Created by: {viewingOrder.created_by_staff_name || 'Staff'} on {new Date(viewingOrder.created_on).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}