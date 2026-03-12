import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 네이버 블로그 검색 API로 상위노출 체크
async function checkNaverRank(keyword: string, blogUrl: string): Promise<{ rank: number | null; isTop: boolean }> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("네이버 API 키가 설정되지 않았습니다.");
  }

  const res = await fetch(
    `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(keyword)}&display=10&sort=sim`,
    {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`네이버 API 오류: ${res.status}`);
  }

  const data = await res.json();
  const items = data.items || [];

  // blogUrl에서 블로그 식별자 추출
  const blogIdentifier = extractBlogIdentifier(blogUrl);

  for (let i = 0; i < items.length; i++) {
    const itemLink = items[i].link || "";
    if (itemLink.includes(blogIdentifier)) {
      const rank = i + 1;
      return { rank, isTop: rank <= 5 };
    }
  }

  return { rank: null, isTop: false };
}

function extractBlogIdentifier(url: string): string {
  // blog.naver.com/username 또는 blog.naver.com/PostView.naver?blogId=...
  const match = url.match(/blog\.naver\.com\/([^/?]+)/);
  if (match) return match[1];
  return url;
}

// POST: 특정 리뷰의 상위노출 체크
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { keyword } = body as { keyword: string };

    if (!keyword?.trim()) {
      return NextResponse.json({ error: "검색 키워드를 입력해주세요." }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        application: { include: { campaign: true } },
        reviewer: true,
      },
    });

    if (!review) {
      return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 });
    }

    // 광고주 또는 리뷰어 본인만 체크 가능
    const isOwner = review.reviewerId === session.user.id;
    const isAdvertiser = review.application.campaign.advertiserId === session.user.id;
    if (!isOwner && !isAdvertiser && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const result = await checkNaverRank(keyword, review.reviewUrl);

    const rankCheck = await prisma.searchRankCheck.create({
      data: {
        reviewId: id,
        keyword: keyword.trim(),
        rank: result.rank,
        isTop: result.isTop,
      },
    });

    return NextResponse.json(rankCheck);
  } catch (error) {
    console.error("Failed to check rank:", error);
    const message = error instanceof Error ? error.message : "상위노출 체크에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: 리뷰의 상위노출 체크 이력 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;

    const rankChecks = await prisma.searchRankCheck.findMany({
      where: { reviewId: id },
      orderBy: { checkedAt: "desc" },
      take: 20,
    });

    return NextResponse.json(rankChecks);
  } catch (error) {
    console.error("Failed to get rank checks:", error);
    return NextResponse.json({ error: "상위노출 이력 조회에 실패했습니다." }, { status: 500 });
  }
}
