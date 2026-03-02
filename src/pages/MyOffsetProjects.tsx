/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useOffsetStore } from "@/store/offsetStore";
import { useAuthStore } from "@/store/auth";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    CheckCircle,
    Clock,
    ExternalLink,
    Loader2,
    Search,
    XCircle,
} from "lucide-react";

type OffsetType = "individual" | "calculation";

interface HistorySourceItem {
    transaction_id?: string;
    confirmation_number?: string;
    certificate_number?: string;
    project_name?: string;
    certification_name?: string;
    carbon_emission_metric_tons?: number;
    total_cost_usd?: number;
    total_tons?: number;
    total_cost?: number;
    currency?: string;
    date_of_issue?: string;
    date?: string;
    status?: string;
    carbon_offset_details?: {
        certificate_number?: string;
    };
}

interface CertificateItem {
    certificate_number?: string;
    project_name?: string;
    certification_name?: string;
    carbon_emission_metric_tons?: number;
    total_cost_usd?: number;
    date_of_issue?: string;
    currency?: string;
}

type HistoryRow = {
    id: string;
    certificateNumber: string;
    confirmationNumber: string;
    projectLabel: string;
    projectSubLabel: string;
    tons: number;
    amount: number;
    currency: string;
    date: string;
    status: string;
};

export default function MyOffsetProjects() {
    const {
        myOffsets,
        certificates,
        offsetHistory,
        loading,
        error,
        historyLoading,
        historyError,
        certificatesLoading,
        certificatesError,
        fetchMyOffsetsWithFilters,
        fetchOffsetHistoryWithFilters,
        fetchCertificatesWithFilters,
    } = useOffsetStore();

    const { accessToken } = useAuthStore();
    const role = useAuthStore((state) => state.user?.role);
    const isAdmin = role === "super_admin";

    const [historyOffsetType, setHistoryOffsetType] = useState<OffsetType>(
        "calculation"
    );
    const [certificateOffsetType, setCertificateOffsetType] =
        useState<OffsetType>("calculation");
    const [email, setEmail] = useState("");
    const [appliedEmail, setAppliedEmail] = useState("");

    const {
        currentPage,
        itemsPerPage,
        paginate,
        goToPage,
        handleItemsPerPageChange,
        setCurrentPage,
    } = usePagination<HistoryRow>(5);

    const {
        currentPage: certificatesPage,
        itemsPerPage: certificatesItemsPerPage,
        paginate: paginateCertificates,
        goToPage: goToCertificatesPage,
        handleItemsPerPageChange: handleCertificatesItemsPerPageChange,
        setCurrentPage: setCertificatesCurrentPage,
    } = usePagination<CertificateItem>(5);

    const historyRows = useMemo(() => {
        const sourceRows = (isAdmin ? offsetHistory : myOffsets) || [];

        return (sourceRows as HistorySourceItem[])
            .map((item, index) => ({
                id:
                    item.transaction_id ||
                    item.confirmation_number ||
                    item.certificate_number ||
                    `${item.date_of_issue || item.date || "row"}-${index}`,
                certificateNumber:
                    item.certificate_number ||
                    item.carbon_offset_details?.certificate_number ||
                    "N/A",
                confirmationNumber:
                    item.confirmation_number || item.transaction_id || "N/A",
                projectLabel:
                    item.project_name ||
                    ((item as any).projects
                        ?.map((project: { project_name?: string }) => project.project_name)
                        ?.filter(Boolean)
                        ?.join(", ") ||
                        "N/A"),
                projectSubLabel:
                    item.certification_name,
                tons: item.carbon_emission_metric_tons || item.total_tons || 0,
                amount: item.total_cost_usd || item.total_cost || 0,
                currency: item.currency || "USD",
                date: item.date_of_issue || item.date || "",
                status: item.status || "issued",
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [isAdmin, myOffsets, offsetHistory]);

    const {
        paginatedItems: paginatedHistory,
        totalItems: totalHistory,
        totalPages: totalHistoryPages,
        startIndex: historyStartIndex,
        endIndex: historyEndIndex,
    } = paginate(historyRows);

    const {
        paginatedItems: paginatedCertificates,
        totalItems: totalCertificates,
        totalPages: totalCertificatesPages,
        startIndex: certificatesStartIndex,
        endIndex: certificatesEndIndex,
    } = paginateCertificates(certificates || []);

    useEffect(() => {
        if (!accessToken) return;

        if (isAdmin) {
            fetchOffsetHistoryWithFilters(accessToken, {
                user_email: appliedEmail || undefined,
                offset_type: historyOffsetType,
                payment_type: "one_time",
            });
            return;
        }

        fetchMyOffsetsWithFilters(accessToken, {
            offset_type: historyOffsetType,
            payment_type: "one_time",
        });

        fetchCertificatesWithFilters(accessToken, {
            offset_type: certificateOffsetType,
            payment_type: "one_time",
        });
    }, [
        accessToken,
        appliedEmail,
        certificateOffsetType,
        fetchCertificatesWithFilters,
        fetchMyOffsetsWithFilters,
        fetchOffsetHistoryWithFilters,
        historyOffsetType,
        isAdmin,
    ]);

    useEffect(() => {
        setCurrentPage(1);
    }, [historyRows.length, setCurrentPage]);

    useEffect(() => {
        setCertificatesCurrentPage(1);
    }, [certificates.length, setCertificatesCurrentPage]);

    const formatCurrency = (amount: number, currency = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(amount || 0);
    };

    const formatDate = (date: string) => {
        if (!date) return "N/A";
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return "N/A";
        return format(parsedDate, "MMM dd, yyyy");
    };

    const handleViewCertificate = (certificateNumber: string) => {
        if (!certificateNumber || certificateNumber === "N/A") return;
        window.open(
            `${import.meta.env.VITE_CERT_URL}/certificate/${certificateNumber}`,
            "_blank"
        );
    };

    const handleSearchByEmail = () => {
        setAppliedEmail(email.trim());
    };

    const handleClearSearch = () => {
        setEmail("");
        setAppliedEmail("");
    };

    const handleEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearchByEmail();
        }
    };

    const isHistoryLoading = isAdmin ? historyLoading : loading;
    const historyErrorText = isAdmin ? historyError : error;

    if (isHistoryLoading && historyRows.length === 0) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-6rem)]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
            </div>
        );
    }

    if (historyErrorText && historyRows.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)] text-red-500">
                Error: {historyErrorText}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Carbon Offsets</h1>
                    <p className="text-muted-foreground mt-2">
                        View your carbon offset history and impact
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Offsets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-primary">
                            {historyRows.reduce((sum, row) => sum + row.tons, 0).toFixed(2)} tons
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Investment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-primary">
                            {formatCurrency(historyRows.reduce((sum, row) => sum + row.amount, 0))}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Projects Supported</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                            {new Set(historyRows.map((row) => row.projectLabel)).size}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Offset History</h2>
                            <p className="text-muted-foreground mt-1">
                                {isAdmin
                                    ? "Track and manage user offset history by type."
                                    : "View your offset history by contribution type."}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <Tabs
                                value={historyOffsetType}
                                onValueChange={(value) => setHistoryOffsetType(value as OffsetType)}
                                className="w-auto"
                            >
                                <TabsList>
                                    <TabsTrigger value="calculation" className="flex items-center gap-2">
                                        Offset History
                                    </TabsTrigger>
                                    <TabsTrigger value="individual" className="flex items-center gap-2">
                                        Individual Contribution
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {isAdmin && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        onKeyDown={handleEmailKeyDown}
                                        placeholder="Search by email"
                                        className="sm:w-64"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSearchByEmail}
                                        disabled={isHistoryLoading}
                                        className="flex items-center gap-1"
                                    >
                                        <Search className="h-4 w-4" />
                                        Search
                                    </Button>
                                    {appliedEmail && (
                                        <Button size="sm" variant="outline" onClick={handleClearSearch}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            {isAdmin && <TableHead>Certificate #</TableHead>}
                            <TableHead>Confirmation #</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Carbon Offset (MT)</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date Issued</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isHistoryLoading ? (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8">
                                    <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
                                    <p className="text-muted-foreground">Loading records...</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedHistory.map((row) => (
                                <TableRow key={row.id}>
                                    {isAdmin && (
                                        <TableCell className="font-mono font-semibold">{row.certificateNumber}</TableCell>
                                    )}
                                    <TableCell className="font-mono">{row.confirmationNumber}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{row.projectLabel}</p>
                                            {row.projectSubLabel && (
                                                <p className="text-sm text-muted-foreground">{row.projectSubLabel}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{row.tons.toFixed(2)} tons</TableCell>
                                    <TableCell className="font-semibold text-primary">
                                        {formatCurrency(row.amount, row.currency)}
                                    </TableCell>
                                    <TableCell>{formatDate(row.date)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                row.status === "completed" || row.status === "issued"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className={
                                                row.status === "completed" || row.status === "issued"
                                                    ? "bg-green-500 hover:bg-green-600"
                                                    : row.status === "pending"
                                                        ? "bg-yellow-500 hover:bg-yellow-600"
                                                        : "bg-red-500 hover:bg-red-600"
                                            }
                                        >
                                            <div className="flex items-center gap-1">
                                                {row.status === "completed" || row.status === "issued" ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : row.status === "pending" ? (
                                                    <Clock className="h-4 w-4" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                            </div>
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}

                        {!isHistoryLoading && historyRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center text-muted-foreground py-8">
                                    {isAdmin && appliedEmail
                                        ? "No offset history found for this email and tab."
                                        : "No offset records found."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {historyRows.length > 0 && (
                    <div className="p-4 border-t">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalHistoryPages}
                            onPageChange={goToPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            itemsPerPage={itemsPerPage}
                            totalItems={totalHistory}
                            startIndex={historyStartIndex}
                            endIndex={historyEndIndex}
                            showItemsPerPage={true}
                        />
                    </div>
                )}
            </div>

            {!isAdmin && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">My Certificates</h2>
                                <p className="text-muted-foreground mt-1">
                                    View and download certificates by contribution type.
                                </p>
                            </div>

                            <Tabs
                                value={certificateOffsetType}
                                onValueChange={(value) =>
                                    setCertificateOffsetType(value as OffsetType)
                                }
                                className="w-auto"
                            >
                                <TabsList>
                                    <TabsTrigger value="calculation" className="flex items-center gap-2">
                                        Offset History
                                    </TabsTrigger>
                                    <TabsTrigger value="individual" className="flex items-center gap-2">
                                        Individual Contribution
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Certificate #</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Carbon Offset (MT)</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date Issued</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {certificatesLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
                                        <p className="text-muted-foreground">Loading certificates...</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedCertificates.map((certificate, index) => (
                                    <TableRow
                                        key={certificate.certificate_number || `${certificate.project_name || "cert"}-${index}`}
                                    >
                                        <TableCell className="font-mono font-semibold">
                                            {certificate.certificate_number || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{certificate.project_name || "N/A"}</p>
                                                {certificate.certification_name && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {certificate.certification_name}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {(certificate.carbon_emission_metric_tons || 0).toFixed(2)} tons
                                        </TableCell>
                                        <TableCell className="font-semibold text-primary">
                                            {formatCurrency(
                                                certificate.total_cost_usd || 0,
                                                certificate.currency || "USD"
                                            )}
                                        </TableCell>
                                        <TableCell>{formatDate(certificate.date_of_issue || "")}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() =>
                                                    handleViewCertificate(certificate.certificate_number || "")
                                                }
                                                disabled={!certificate.certificate_number}
                                                className="inline-flex items-center gap-1"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}

                            {!certificatesLoading && certificates.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        {certificatesError || "No certificates found."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {certificates.length > 0 && (
                        <div className="p-4 border-t">
                            <Pagination
                                currentPage={certificatesPage}
                                totalPages={totalCertificatesPages}
                                onPageChange={goToCertificatesPage}
                                onItemsPerPageChange={handleCertificatesItemsPerPageChange}
                                itemsPerPage={certificatesItemsPerPage}
                                totalItems={totalCertificates}
                                startIndex={certificatesStartIndex}
                                endIndex={certificatesEndIndex}
                                showItemsPerPage={true}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
