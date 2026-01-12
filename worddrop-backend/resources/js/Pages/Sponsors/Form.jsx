import { Head, router, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SponsorForm({ sponsorId = null }) {
    const isEditing = !!sponsorId;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [error, setError] = useState(null);
    const [sponsorData, setSponsorData] = useState(null);

    const { data, setData, post, put, processing } = useForm({
        name: '',
        slug: '',
        logo_url: '',
        website_url: '',
        description: '',
        contact_email: '',
        contact_name: '',
        is_active: true,
    });

    useEffect(() => {
        if (isEditing && sponsorId) {
            axios.get(`/api/admin/sponsors/${sponsorId}`)
                .then(response => {
                    if (response.data.success) {
                        const sponsor = response.data.data;
                        setSponsorData(sponsor);
                        setData({
                            name: sponsor.name || '',
                            slug: sponsor.slug || '',
                            logo_url: sponsor.logo_url || '',
                            website_url: sponsor.website_url || '',
                            description: sponsor.description || '',
                            contact_email: sponsor.contact_email || '',
                            contact_name: sponsor.contact_name || '',
                            is_active: sponsor.is_active !== undefined ? sponsor.is_active : true,
                        });
                    }
                })
                .catch(error => {
                    setError('Error loading sponsor: ' + (error.response?.data?.message || error.message));
                })
                .finally(() => {
                    setFetching(false);
                });
        }
    }, [sponsorId, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                await axios.put(`/api/admin/sponsors/${sponsorId}`, data);
            } else {
                await axios.post('/api/admin/sponsors', data);
            }
            router.visit('/admin/sponsors');
        } catch (error) {
            setError(error.response?.data?.message || error.response?.data?.errors || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Layout currentPage="sponsors">
                <Head title="Loading..." />
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading sponsor data...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentPage="sponsors">
            <Head title={isEditing ? 'Edit Sponsor' : 'Create Sponsor'} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{isEditing ? 'Edit Sponsor' : 'Create Sponsor'}</h1>
                        <p className="text-muted-foreground">
                            {isEditing ? 'Update sponsor details' : 'Add a new sponsor'}
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.visit('/admin/sponsors')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sponsor Details</CardTitle>
                        <CardDescription>Fill in the information for the sponsor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        placeholder="e.g., Acme Corporation"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Slug</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="auto-generated if empty"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        URL-friendly identifier (auto-generated from name if empty)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Logo URL</label>
                                    <input
                                        type="url"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.logo_url}
                                        onChange={(e) => setData('logo_url', e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                    />
                                    {data.logo_url && (
                                        <div className="mt-2">
                                            <img
                                                src={data.logo_url}
                                                alt="Logo preview"
                                                className="h-16 w-16 object-contain border border-input rounded"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Website URL</label>
                                    <input
                                        type="url"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.website_url}
                                        onChange={(e) => setData('website_url', e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        placeholder="Brief description about the sponsor"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Contact Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.contact_name}
                                        onChange={(e) => setData('contact_name', e.target.value)}
                                        placeholder="Contact person name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Contact Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.contact_email}
                                        onChange={(e) => setData('contact_email', e.target.value)}
                                        placeholder="contact@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                            />
                                            <span>Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/sponsors')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading || processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {loading ? 'Saving...' : isEditing ? 'Update Sponsor' : 'Create Sponsor'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
