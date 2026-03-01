import { AdminGuard } from '@/components/admin-guard'

/**
 * Admin layout — wraps all /admin routes with the auth guard.
 * This ensures every admin sub-route is protected automatically.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AdminGuard>{children}</AdminGuard>
}
