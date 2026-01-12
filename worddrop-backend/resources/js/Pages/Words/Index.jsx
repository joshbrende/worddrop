import { Head, router } from '@inertiajs/react';
import Layout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Calendar, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function WordsIndex() {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });

    const fetchWords = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/admin/words?per_page=15&page=${page}`);
            console.log('Words API response:', response.data);
            if (response.data.success) {
                setWords(response.data.data);
                setPagination(response.data.meta);
            } else {
                console.error('API returned success=false:', response.data);
            }
        } catch (error) {
            console.error('Error fetching words:', error);
            console.error('Error details:', error.response?.data || error.message);
            alert('Error loading words: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWords();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this word?')) return;
        
        try {
            await axios.delete(`/api/admin/words/${id}`);
            fetchWords(pagination.current_page);
        } catch (error) {
            alert('Error deleting word: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredWords = words.filter(word =>
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout currentPage="words">
            <Head title="Word of the Day Management" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Word of the Day</h1>
                        <p className="text-muted-foreground">Manage words for the daily challenge</p>
                    </div>
                    <Button onClick={() => router.visit('/admin/words/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Word
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search words..."
                                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Words Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Words ({pagination.total})</CardTitle>
                        <CardDescription>All words assigned to dates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading...</div>
                        ) : words.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No words found. Check console for errors.</div>
                        ) : filteredWords.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No words match your search.</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left p-3 font-medium">Word</th>
                                                <th className="text-left p-3 font-medium">Date</th>
                                                <th className="text-left p-3 font-medium">Category</th>
                                                <th className="text-left p-3 font-medium">Difficulty</th>
                                                <th className="text-left p-3 font-medium">Points</th>
                                                <th className="text-left p-3 font-medium">Status</th>
                                                <th className="text-right p-3 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredWords.map((word) => (
                                                <tr key={word.id} className="border-b border-border hover:bg-accent/50">
                                                    <td className="p-3 font-medium">{word.word}</td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            {new Date(word.date).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">{word.category || '-'}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            word.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                            word.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {word.difficulty}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">{word.points}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            word.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {word.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => router.visit(`/admin/words/${word.id}/edit`)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(word.id)}
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
                                            {pagination.total} words
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={pagination.current_page === 1}
                                                onClick={() => fetchWords(pagination.current_page - 1)}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={pagination.current_page === pagination.last_page}
                                                onClick={() => fetchWords(pagination.current_page + 1)}
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
