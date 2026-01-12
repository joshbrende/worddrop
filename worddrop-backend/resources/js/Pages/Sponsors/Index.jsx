import { Head, router } from '@inertiajs/react';
import Layout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Search, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SponsorsIndex() {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });

    const fetchSponsors = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/admin/sponsors?per_page=15&page=${page}`);
            console.log('Sponsors API response:', response.data);
            if (response.data.success) {
                setSponsors(response.data.data);
                setPagination(response.data.meta);
            } else {
                console.error('API returned success=false:', response.data);
            }
        } catch (error) {
            console.error('Error fetching sponsors:', error);
            console.error('Error details:', error.response?.data || error.message);
            alert('Error loading sponsors: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSponsors();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this sponsor? This will also delete all associated questions.')) return;
        
        try {
            await axios.delete(`/api/admin/sponsors/${id}`);
            fetchSponsors(pagination.current_page);
        } catch (error) {
            alert('Error deleting sponsor: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredSponsors = sponsors.filter(sponsor =>
        sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sponsor.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout currentPage="sponsors">
            <Head title="Sponsor Management" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Sponsors</h1>
                        <p className="text-muted-foreground">Manage sponsors and their trivia questions</p>
                    </div>
                    <Button onClick={() => router.visit('/admin/sponsors/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Sponsor
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search sponsors..."
                                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Sponsors Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sponsors ({pagination.total})</CardTitle>
                        <CardDescription>All sponsors in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading...</div>
                        ) : sponsors.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No sponsors found. Check console for errors.</div>
                        ) : filteredSponsors.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No sponsors match your search.</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left p-3 font-medium">Logo</th>
                                                <th className="text-left p-3 font-medium">Name</th>
                                                <th className="text-left p-3 font-medium">Slug</th>
                                                <th className="text-left p-3 font-medium">Questions</th>
                                                <th className="text-left p-3 font-medium">Website</th>
                                                <th className="text-left p-3 font-medium">Status</th>
                                                <th className="text-right p-3 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSponsors.map((sponsor) => (
                                                <tr key={sponsor.id} className="border-b border-border hover:bg-accent/50">
                                                    <td className="p-3">
                                                        {sponsor.logo_url ? (
                                                            <img
                                                                src={sponsor.logo_url}
                                                                alt={sponsor.name}
                                                                className="h-10 w-10 object-contain"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xs">
                                                                No Logo
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 font-medium">{sponsor.name}</td>
                                                    <td className="p-3 text-muted-foreground">{sponsor.slug || '-'}</td>
                                                    <td className="p-3">{sponsor.questions_count || 0}</td>
                                                    <td className="p-3">
                                                        {sponsor.website_url ? (
                                                            <a
                                                                href={sponsor.website_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-primary hover:underline"
                                                            >
                                                                Visit
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            sponsor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {sponsor.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => router.visit(`/admin/sponsors/${sponsor.id}/edit`)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(sponsor.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {pagination.last_page > 1 && (
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                                            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                                            {pagination.total} sponsors
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={pagination.current_page === 1}
                                                onClick={() => fetchSponsors(pagination.current_page - 1)}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={pagination.current_page === pagination.last_page}
                                                onClick={() => fetchSponsors(pagination.current_page + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
