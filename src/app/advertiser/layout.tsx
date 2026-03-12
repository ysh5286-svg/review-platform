"use client";

import OnboardingGuard from "@/components/OnboardingGuard";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function AdvertiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </OnboardingGuard>
  );
}
