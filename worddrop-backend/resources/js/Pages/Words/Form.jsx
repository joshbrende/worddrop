import { Head, router, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function WordForm({ wordId = null }) {
    const isEditing = !!wordId;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [error, setError] = useState(null);
    const [wordData, setWordData] = useState(null);

    const { data, setData, post, put, processing } = useForm({
        word: '',
        question: '',
        date: '',
        category: '',
        hint: '',
        difficulty: 'medium',
        points: 100,
        is_active: true,
    });

    useEffect(() => {
        if (isEditing && wordId) {
            axios.get(`/api/admin/words/${wordId}`)
                .then(response => {
                    if (response.data.success) {
                        const word = response.data.data;
                        setWordData(word);
                        setData({
                            word: word.word || '',
                            question: word.question || '',
                            date: word.date ? word.date.split('T')[0] : '',
                            category: word.category || '',
                            hint: word.hint || '',
                            difficulty: word.difficulty || 'medium',
                            points: word.points || 100,
                            is_active: word.is_active !== undefined ? word.is_active : true,
                        });
                    }
                })
                .catch(error => {
                    setError('Error loading word: ' + (error.response?.data?.message || error.message));
                })
                .finally(() => {
                    setFetching(false);
                });
        }
    }, [wordId, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                await axios.put(`/api/admin/words/${wordId}`, data);
            } else {
                await axios.post('/api/admin/words', data);
            }
            router.visit('/admin/words');
        } catch (error) {
            setError(error.response?.data?.message || error.response?.data?.errors || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Layout currentPage="words">
                <Head title="Loading..." />
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading word data...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentPage="words">
            <Head title={isEditing ? 'Edit Word' : 'Create Word'} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{isEditing ? 'Edit Word' : 'Create Word'}</h1>
                        <p className="text-muted-foreground">
                            {isEditing ? 'Update word details' : 'Add a new word for Word of the Day'}
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.visit('/admin/words')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Word Details</CardTitle>
                        <CardDescription>Fill in the information for the word</CardDescription>
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
                                    <label className="block text-sm font-medium mb-2">Word *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.word}
                                        onChange={(e) => setData('word', e.target.value)}
                                        required
                                        placeholder="e.g., PUZZLE"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Date *</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Question/Clue</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.question}
                                        onChange={(e) => setData('question', e.target.value)}
                                        rows={3}
                                        placeholder="The clue or question for this word"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                    >
                                        <option value="">Select a category</option>
                                        <option value="Science">Science</option>
                                        <option value="Geography">Geography</option>
                                        <option value="History">History</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Food">Food</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Animals">Animals</option>
                                        <option value="Space">Space</option>
                                        <option value="Music">Music</option>
                                        <option value="Holiday">Holiday</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Hint</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.hint}
                                        onChange={(e) => setData('hint', e.target.value)}
                                        rows={2}
                                        placeholder="Additional hint for players"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Difficulty *</label>
                                    <select
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.difficulty}
                                        onChange={(e) => setData('difficulty', e.target.value)}
                                        required
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Points *</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                        value={data.points}
                                        onChange={(e) => setData('points', parseInt(e.target.value))}
                                        min="1"
                                        required
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
                                    onClick={() => router.visit('/admin/words')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading || processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {loading ? 'Saving...' : isEditing ? 'Update Word' : 'Create Word'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
