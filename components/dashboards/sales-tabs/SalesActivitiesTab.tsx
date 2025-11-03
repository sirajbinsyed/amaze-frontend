"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, ShoppingCart } from "lucide-react"
import { type Customer, type Order, type RealCustomer } from "@/lib/sales"

interface SalesActivitiesTabProps {
    customers: Customer[]
    orders: Order[]
    realCustomers: RealCustomer[]
    getStatusColor: (status: string) => string
    getOrderStatusColor: (status: string) => string
}

export const SalesActivitiesTab: React.FC<SalesActivitiesTabProps> = ({
    customers,
    orders,
    realCustomers,
    getStatusColor,
    getOrderStatusColor
}) => {
    const allKnownCustomers: (Customer | RealCustomer)[] = [...customers, ...realCustomers];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><Calendar className="h-5 w-5 mr-2" />Recent Activities</CardTitle>
                <CardDescription>Track all customer interactions and communications</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {customers.slice(0, 2).map((lead) => (
                        <div key={`lead-activity-${lead.id}`} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0"><Target className="h-5 w-5 text-orange-600" /></div>
                            <div className="flex-1">
                                <p className="font-medium">Lead {lead.customer_name} added</p>
                                <p className="text-sm text-gray-600">Created by {lead.created_by_staff_name || 'Staff'} • {new Date(lead.created_on).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(lead.status)}>{lead.status}</Badge>
                        </div>
                    ))}
                    {orders.slice(0, 2).map((order) => {
                        const customer = allKnownCustomers.find(c => c.id === order.customer_id);
                        return (
                            <div key={`order-activity-${order.id}`} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0"><ShoppingCart className="h-5 w-5 text-green-600" /></div>
                                <div className="flex-1">
                                    <p className="font-medium">Order #{order.id} created</p>
                                    <p className="text-sm text-gray-600">Customer: {customer?.customer_name || 'Unknown'} • {new Date(order.created_on).toLocaleDateString()}</p>
                                </div>
                                <Badge variant="outline" className={getOrderStatusColor(order.status || 'pending')}>{order.status || 'pending'}</Badge>
                            </div>
                        )
                    })}
                    {customers.length === 0 && orders.length === 0 && (
                        <div className="text-center py-8"><Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No activities yet</p><p className="text-sm text-gray-400">Activities will appear here as you manage leads and orders</p></div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}