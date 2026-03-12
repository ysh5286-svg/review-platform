import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminCharts from "@/components/AdminCharts";

export default async function AdminDashboardPage() {
  const [totalUsers, totalCampaigns, activeCampaigns, pendingWithdrawals] =
    await Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: { in: ["RECRUITING", "IN_PROGRESS"] } } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } }),
    ]);

  const stats = [
    {
      label: "전체 사용자",
      value: totalUsers,
      href: "/admin/users",
      color: "bg-red-50 text-red-600",
    },
    {
      label: "전체 캠페인",
      value: totalCampaigns,
      href: "/admin/campaigns",
      color: "bg-green-50 text-green-700",
    },
    {
      label: "진행중 캠페인",
      value: activeCampaigns,
      href: "/admin/campaigns",
      color: "bg-yellow-50 text-yellow-700",
    },
    {
      label: "대기중 출금",
      value: pendingWithdrawals,
      href: "/admin/withdrawals",
      color: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`${stat.color} rounded-xl p-6 hover:opacity-80 transition-opacity`}
          >
            <p className="text-sm font-medium opacity-75 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/users"
          className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-1">사용자 관리</h3>
          <p className="text-sm text-gray-500">전체 사용자 목록 및 역할 확인</p>
        </Link>
        <Link
          href="/admin/campaigns"
          className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-1">캠페인 관리</h3>
          <p className="text-sm text-gray-500">모든 캠페인 현황 확인</p>
        </Link>
        <Link
          href="/admin/withdrawals"
          className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-1">출금 관리</h3>
          <p className="text-sm text-gray-500">출금 요청 승인 및 관리</p>
        </Link>
        <Link
          href="/admin/points"
          className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-1">포인트 내역</h3>
          <p className="text-sm text-gray-500">전체 포인트 적립/출금 이력</p>
        </Link>
      </div>

      {/* Charts */}
      <div className="mt-8">
        <AdminCharts />
      </div>
    </div>
  );
}
