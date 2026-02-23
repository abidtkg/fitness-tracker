'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { FiHome, FiActivity, FiTarget, FiBarChart2, FiLogOut } from 'react-icons/fi';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="loading-spinner" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!session) return null;

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
        { href: '/dashboard/tracking', label: 'Tracking', icon: <FiActivity /> },
        { href: '/dashboard/goals', label: 'Goals', icon: <FiTarget /> },
        { href: '/dashboard/reports', label: 'Reports', icon: <FiBarChart2 /> },
    ];

    const userName = session.user?.name || 'User';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="dashboard-layout" style={{ position: 'relative', zIndex: 1 }}>
            {/* Mobile Top Bar */}
            <div className="mobile-topbar">
                <Link href="/dashboard" className="brand">
                    <span>⚡ FitPulse</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        aria-label="Sign out"
                    >
                        <FiLogOut />
                    </button>
                    <div className="user-avatar-small">{userInitials}</div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <Link href="/dashboard">
                        <span>⚡ FitPulse</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={pathname === item.href ? 'active' : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{userInitials}</div>
                        <div>
                            <div className="user-name">{userName}</div>
                            <div className="user-email">{session.user?.email}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', marginTop: 8 }}
                    >
                        <FiLogOut /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={pathname === item.href ? 'active' : ''}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
