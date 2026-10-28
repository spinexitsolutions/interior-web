import type { Metadata } from 'next';
import { ToastProvider } from '@/components/admin/Toasts';
import './admin.css';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap" />
      <div className="adm">
        <ToastProvider>{children}</ToastProvider>
      </div>
    </>
  );
}
