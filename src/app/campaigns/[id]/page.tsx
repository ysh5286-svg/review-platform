import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import CampaignDetailClient from "./CampaignDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { title: true, description: true, imageUrl: true, businessName: true },
  });

  if (!campaign) {
    return { title: "캠페인을 찾을 수 없습니다 | 핫플여기체험단" };
  }

  const desc = (campaign.description || campaign.title).slice(0, 160);

  return {
    title: `${campaign.businessName || campaign.title} | 핫플여기체험단`,
    description: desc,
    openGraph: {
      title: `${campaign.businessName || campaign.title} | 핫플여기체험단`,
      description: desc,
      ...(campaign.imageUrl ? { images: [campaign.imageUrl] } : {}),
    },
  };
}

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
