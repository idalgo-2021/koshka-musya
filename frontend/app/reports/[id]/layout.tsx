import { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import React from "react";

export const metadata: Metadata = pageMetadata.reports;

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
