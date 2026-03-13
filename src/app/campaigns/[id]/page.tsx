import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import CampaignDetailClient from "./CampaignDetailClient";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      advertiser: { select: { id: true, businessName: true, name: true, image: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!campaign) return notFound();

  let existingApplication = null;
  if (session?.user?.id) {
    existingApplication = await prisma.application.findUnique({
      where: {
        campaignId_reviewerId: {
          campaignId: id,
          reviewerId: session.user.id,
        },
      },
    });
  }

  // Serialize dates for client component
  const campaignData = {
    ...campaign,
    startDate: campaign.startDate.toISOString(),
    endDate: campaign.endDate.toISOString(),
    selectionDate: campaign.selectionDate?.toISOString() || null,
    reviewDeadline: campaign.reviewDeadline?.toISOString() || null,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  };

  return (
    <CampaignDetailClient
      campaign={campaignData}
      existingApplication={existingApplication ? {
        status: existingApplication.status,
      } : null}
      userRole={session?.user?.role || null}
      isLoggedIn={!!session?.user}
    />
  );
}
