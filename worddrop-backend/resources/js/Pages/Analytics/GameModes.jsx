import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Award, Target, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function GameModesAnalytics() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all');
    const [data, setData] = useState(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/admin/analytics/game-modes?period=${period}`);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            alert('Error loading analytics: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    if (loading) {
        return (
            <Layout currentPage="analytics">
                <Head title="Game Modes Analytics" />
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading analytics...</div>
                </div>
            </Layout>
        );
    }

    if (!data) {
        return (
            <Layout currentPage="analytics">
                <Head title="Game Modes Analytics" />
                <div className="text-center py-8 text-muted-foreground">No data available</div>
            </Layout>
        );
    }

    const { word_of_day, sponsor_trivia, overall } = data;

    return (
        <Layout currentPage="analytics">
            <Head title="Game Modes Analytics" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Game Modes Analytics</h1>
                        <p className="text-muted-foreground">Statistics for Word of the Day and Sponsor Trivia</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={period === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('all')}
                        >
                            All Time
                        </Button>
                        <Button
                            variant={period === '90days' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('90days')}
                        >
                            Last 90 Days
                        </Button>
                        <Button
                            variant={period === '30days' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('30days')}
                        >
                            Last 30 Days
                        </Button>
                        <Button
                            variant={period === '7days' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('7days')}
                        >
                            Last 7 Days
                        </Button>
                    </div>
                </div>

                {/* Overall Statistics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overall.total_users}</div>
                            <p className="text-xs text-muted-foreground">Registered users</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Word of Day Found</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overall.users_who_found_word_of_day}</div>
                            <p className="text-xs text-muted-foreground">
                                {overall.word_of_day_participation_rate}% participation rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sponsor Questions</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overall.users_who_answered_sponsor}</div>
                            <p className="text-xs text-muted-foreground">
                                {overall.sponsor_participation_rate}% participation rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Found Both</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overall.users_who_found_both}</div>
                            <p className="text-xs text-muted-foreground">Users who completed both</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Word of the Day Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Word of the Day Statistics</CardTitle>
                            <CardDescription>Performance metrics for daily word challenges</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Found</p>
                                    <p className="text-2xl font-bold">{word_of_day.total_found}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Unique Users</p>
                                    <p className="text-2xl font-bold">{word_of_day.unique_users}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Points</p>
                                    <p className="text-2xl font-bold">{word_of_day.total_points_awarded.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg Points</p>
                                    <p className="text-2xl font-bold">{word_of_day.average_points}</p>
                                </div>
                            </div>

                            {word_of_day.by_word.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Top Words Found</h4>
                                    <div className="space-y-2">
                                        {word_of_day.by_word.slice(0, 5).map((word) => (
                                            <div key={word.id} className="flex justify-between items-center p-2 bg-muted rounded">
                                                <div>
                                                    <p className="font-medium">{word.word}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(word.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">{word.times_found}</p>
                                                    <p className="text-xs text-muted-foreground">{word.unique_users} users</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sponsor Trivia Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sponsor Trivia Statistics</CardTitle>
                            <CardDescription>Performance metrics for sponsor questions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Answered</p>
                                    <p className="text-2xl font-bold">{sponsor_trivia.total_answered}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Unique Users</p>
                                    <p className="text-2xl font-bold">{sponsor_trivia.unique_users}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Points</p>
                                    <p className="text-2xl font-bold">{sponsor_trivia.total_points_awarded.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg Points</p>
                                    <p className="text-2xl font-bold">{sponsor_trivia.average_points}</p>
                                </div>
                            </div>

                            {sponsor_trivia.by_sponsor.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Top Sponsors</h4>
                                    <div className="space-y-2">
                                        {sponsor_trivia.by_sponsor.slice(0, 5).map((sponsor) => (
                                            <div key={sponsor.id} className="flex justify-between items-center p-2 bg-muted rounded">
                                                <div>
                                                    <p className="font-medium">{sponsor.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">{sponsor.times_answered}</p>
                                                    <p className="text-xs text-muted-foreground">{sponsor.unique_users} users</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Activity Breakdown</CardTitle>
                        <CardDescription>Last 30 days of activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Word of the Day</h4>
                                <div className="space-y-1 max-h-64 overflow-y-auto">
                                    {word_of_day.daily_breakdown.map((day) => (
                                        <div key={day.date} className="flex justify-between items-center text-sm">
                                            <span>{new Date(day.date).toLocaleDateString()}</span>
                                            <span className="font-medium">{day.count} found ({day.unique_users} users)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Sponsor Trivia</h4>
                                <div className="space-y-1 max-h-64 overflow-y-auto">
                                    {sponsor_trivia.daily_breakdown.map((day) => (
                                        <div key={day.date} className="flex justify-between items-center text-sm">
                                            <span>{new Date(day.date).toLocaleDateString()}</span>
                                            <span className="font-medium">{day.count} answered ({day.unique_users} users)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
