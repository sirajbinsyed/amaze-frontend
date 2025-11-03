// admin-tabs/financials-tab-content.tsx
"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// --- API Client Imports for Financial Reports ---
import {
    getAllDailySalesReports,
    deleteDailySalesReport,
    DailySalesReport,
} from "@/lib/accounts";

// --- Icons ---
import {
    Trash2,
    ListOrdered,
    Calendar,
    ChevronDown,
    Info,
} from "lucide-react";

// =============================================================
// TYPES & HELPERS
// =============================================================

// --- Financial Report UI Type ---
type AccountDetails = { [key: string]: number; }
type DailyReportEntry = {
    id: number;
    date: string;
    totalSaleOrder: number;
    totalSaleOrderAmount: number;
    saleOrderCollection: number;
    saleOrderBalAmount: number;
    totalDayCollection: number;
    totalCash: number;
    totalAC: number;
    acDetails: AccountDetails;
};

// --- Helper Functions ---
const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const mapApiToComponent = (apiReport: DailySalesReport): DailyReportEntry => {
    const displayDate = apiReport.date
        ? new Date(apiReport.date + 'T00:00:00').toLocaleDateString('en-GB').replace(/\//g, '-')
        : 'N/A';

    return {
        id: apiReport.id,
        date: displayDate,
        totalSaleOrder: apiReport.total_sales_order ?? 0,
        totalSaleOrderAmount: apiReport.total_sale_order_amount ?? 0,
        saleOrderCollection: apiReport.sale_order_collection ?? 0,
        saleOrderBalAmount: apiReport.sale_order_balance_amount ?? 0,
        totalDayCollection: apiReport.total_day_collection ?? 0,
        totalCash: apiReport.total_amount_on_cash ?? 0,
        totalAC: apiReport.total_amount_on_ac ?? 0,
        acDetails: {
            IOB: apiReport.iob ?? 0, CD: apiReport.cd ?? 0, ANIL: apiReport.anil ?? 0, REMYA: apiReport.remya ?? 0,
            'RGB-186 SWIPING MACHINE': apiReport.rgb_186_swiping_machine ?? 0, 'AMAZE A/C': apiReport.amaze_ac ?? 0, CHEQUE: apiReport.cheque ?? 0,
        },
    };
};

// =============================================================
// CHILD COMPONENT: DailyReportRegister
// =============================================================
interface DailyReportRegisterProps {
    reports: DailySalesReport[];
    isLoading: boolean;
    onDelete: (id: number) => void;
}

const DailyReportRegister = ({ reports, isLoading, onDelete }: DailyReportRegisterProps) => {
    const sortedReports = useMemo(() => {
        return [...reports].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA; // Sort descending (newest first)
        });
    }, [reports]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="py-3 px-4">
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <div className="px-4 py-3 border-t">
                            <Skeleton className="h-5 w-1/4" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sortedReports.map((report) => {
                const displayReport = mapApiToComponent(report);
                // Filter out account details with a zero amount to avoid clutter
                const activeAcDetails = Object.entries(displayReport.acDetails)
                                              .filter(([, amount]) => amount > 0);

                return (
                    <Card key={report.id}>
                        <CardHeader className="py-3 px-4 border-b">
                            <div className="flex justify-between items-center gap-2">
                                <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
                                    <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                                    Report Date: {displayReport.date}
                                </CardTitle>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge className="bg-green-600 hover:bg-green-700 hidden sm:block">
                                        Total Collection: {formatINR(displayReport.totalDayCollection)}
                                    </Badge>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onDelete(report.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between px-4 py-2 text-sm font-medium">
                                    <span>View Details</span>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 border-t space-y-6">
                                {/* --- Section 1: Sale Order Summary --- */}
                                <div>
                                    <h4 className="font-semibold text-md mb-3 border-b pb-1">Sale Order Summary</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div><span className="text-gray-500">Total Orders:</span> <p className="font-medium">{displayReport.totalSaleOrder} NO'S</p></div>
                                        <div><span className="text-gray-500">Order Amount:</span> <p className="font-medium">{formatINR(displayReport.totalSaleOrderAmount)}</p></div>
                                        <div><span className="text-gray-500">Order Collected:</span> <p className="font-medium text-green-700">{formatINR(displayReport.saleOrderCollection)}</p></div>
                                        <div><span className="text-gray-500">Order Balance:</span> <p className="font-medium text-red-600">{formatINR(displayReport.saleOrderBalAmount)}</p></div>
                                    </div>
                                </div>
                                
                                {/* --- Section 2: Cash Book Breakdown --- */}
                                <div>
                                    <h4 className="font-semibold text-md mb-3 border-b pb-1">Cash Book Breakdown</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div><span className="text-gray-500">Total Cash:</span> <p className="font-medium">{formatINR(displayReport.totalCash)}</p></div>
                                        <div><span className="text-gray-500">Total A/C:</span> <p className="font-medium">{formatINR(displayReport.totalAC)}</p></div>
                                    </div>
                                </div>

                                {/* --- Section 3: A/C Specifics --- */}
                                {activeAcDetails.length > 0 && (
                                    <div>
                                        <h5 className="font-semibold text-sm mb-2">A/C Specifics (Online Work)</h5>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs bg-gray-50 p-3 rounded">
                                            {activeAcDetails.map(([key, amount]) => (
                                                <div key={key}>
                                                    <span className="text-gray-600">{key}:</span> 
                                                    <p className="font-medium">{formatINR(amount)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                )
            })}
            {!isLoading && reports.length === 0 && (
                <div className="text-center py-10">
                    <Info className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No financial reports found.</p>
                </div>
            )}
        </div>
    );
};

// =============================================================
// MAIN PAGE COMPONENT
// =============================================================
export const AdminFinancialsPage = () => {
    const { toast } = useToast();

    // --- State for Daily Financial Reports ---
    const [reportHistory, setReportHistory] = useState<DailySalesReport[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);

    const fetchReports = async () => {
        setIsLoadingReports(true);
        const response = await getAllDailySalesReports();
        if (response.data) {
            setReportHistory(response.data);
        } else {
            toast({ title: "Error Fetching Reports", description: response.error, variant: "destructive" });
        }
        setIsLoadingReports(false);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDeleteReport = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this financial report? This action cannot be undone.")) {
            const response = await deleteDailySalesReport(id);
            if (response.data) {
                toast({ title: "Success", description: "Report has been deleted." });
                fetchReports(); // Refresh the list
            } else {
                toast({ title: "Deletion Failed", description: response.error, variant: "destructive" });
            }
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ListOrdered className="h-5 w-5 mr-2 text-green-600" />
                        Historical Daily Financial Reports
                    </CardTitle>
                    <CardDescription>
                        Review or delete previously submitted end-of-day financial summaries.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DailyReportRegister
                        reports={reportHistory}
                        isLoading={isLoadingReports}
                        onDelete={handleDeleteReport}
                    />
                </CardContent>
            </Card>
            <Toaster />
        </div>
    )
}