import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    Naver({
      clientId: process.env.NAVER_LOGIN_CLIENT_ID!,
      clientSecret: process.env.NAVER_LOGIN_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async session({ session, user }) {
      // user 객체에 이미 DB에서 가져온 데이터가 있으므로 추가 쿼리 최소화
      session.user.id = user.id;

      // role, grade, onboarded는 User 모델 확장 필드라 별도 조회 필요
      // 하지만 캐싱으로 DB 부하 줄임
      const cacheKey = `user_session_${user.id}`;
      const cached = (globalThis as Record<string, unknown>)[cacheKey] as { data: { role: string; grade: string; onboarded: boolean }; ts: number } | undefined;
      const now = Date.now();

      if (cached && now - cached.ts < 60000) {
        // 1분 캐시
        session.user.role = cached.data.role;
        session.user.grade = cached.data.grade;
        session.user.onboarded = cached.data.onboarded;
      } else {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, grade: true, onboarded: true },
        });
        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.grade = dbUser.grade;
          session.user.onboarded = dbUser.onboarded;
          (globalThis as Record<string, unknown>)[cacheKey] = { data: dbUser, ts: now };
        }
      }

      return session;
    },
  },
});
