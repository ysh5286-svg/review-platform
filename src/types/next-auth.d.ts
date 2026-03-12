import { Role, ReviewerGrade } from "@/generated/prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role | null;
      grade: ReviewerGrade;
      onboarded: boolean;
    } & DefaultSession["user"];
  }
}
