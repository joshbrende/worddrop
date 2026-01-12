import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Dashboard({ stats }) {
    return (
        <Layout currentPage="dashboard">
            <Head title="Dashboard" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Quick Create
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || '0.00'}</div>
                            <p className="text-xs text-muted-foreground flex items-center">
                                <span className="text-green-500 mr-1">+12.5%</span>
                                Trending up this month
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Visitors for the last 6 months.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.newCustomers?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-muted-foreground flex items-center">
                                <span className="text-red-500 mr-1">-20%</span>
                                Down 20% this period
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Acquisition needs attention.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.activeAccounts?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-muted-foreground flex items-center">
                                <span className="text-green-500 mr-1">+12.5%</span>
                                Strong user retention
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Engagement exceed targets.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.growthRate || '0'}%</div>
                            <p className="text-xs text-muted-foreground flex items-center">
                                <span className="text-green-500 mr-1">+4.5%</span>
                                Steady performance increase
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Meets growth projections.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Total Visitors</CardTitle>
                                <CardDescription>Total for the last 3 months</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">Last 3 months</Button>
                                <Button variant="outline" size="sm">Last 30 days</Button>
                                <Button variant="default" size="sm">Last 7 days</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                            Chart will be implemented here
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
