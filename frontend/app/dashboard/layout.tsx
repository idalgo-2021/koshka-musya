import { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata.dashboard;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
