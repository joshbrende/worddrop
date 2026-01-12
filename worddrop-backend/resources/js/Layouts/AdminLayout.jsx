import { Link } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    RefreshCw, 
    BarChart3, 
    Folder, 
    Users, 
    Database, 
    FileText, 
    FileType,
    MoreHorizontal,
    BookOpen,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children, currentPage = 'dashboard' }) {
    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: currentPage === 'dashboard' },
        { name: 'Word of the Day', href: '/admin/words', icon: BookOpen, current: currentPage === 'words' },
        { name: 'Sponsors', href: '/admin/sponsors', icon: Building2, current: currentPage === 'sponsors' },
        { name: 'Analytics', href: '/admin/analytics/game-modes', icon: BarChart3, current: currentPage === 'analytics' },
    ];

    const documents = [
        { name: 'Data Library', href: '/admin/data-library', icon: Database },
        { name: 'Reports', href: '/admin/reports', icon: FileText },
        { name: 'Word Assistant', href: '/admin/word-assistant', icon: FileType },
        { name: 'More', href: '/admin/more', icon: MoreHorizontal },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <nav className="border-b border-border bg-card">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-6">
                        <Link href="/admin/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                            Examples
                        </Link>
                        <Link href="/admin/dashboard" className="text-sm font-medium text-foreground">
                            Dashboard
                        </Link>
                        <Link href="/admin/tasks" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                            Tasks
                        </Link>
                        <Link href="/admin/playground" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                            Playground
                        </Link>
                        <Link href="/admin/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                            Authentication
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <select className="bg-background border border-input rounded-md px-3 py-1 text-sm">
                            <option>Theme: Neutral</option>
                        </select>
                        <button className="text-muted-foreground hover:text-foreground">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 border-r border-border bg-card">
                    <div className="flex h-full flex-col">
                        {/* Logo */}
                        <div className="flex items-center space-x-2 border-b border-border px-6 py-4">
                            <div className="h-8 w-8 rounded-full bg-primary"></div>
                            <span className="font-semibold">WordDROP</span>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 space-y-1 px-3 py-4">
                            <div className="mb-4">
                                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Home
                                </p>
                                <div className="mt-2 space-y-1">
                                    {navigation.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                    item.current
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                )}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Documents
                                </p>
                                <div className="mt-2 space-y-1">
                                    {documents.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
