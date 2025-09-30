import { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata.reports;

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
