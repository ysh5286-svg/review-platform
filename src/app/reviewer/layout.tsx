import OnboardingGuard from "@/components/OnboardingGuard";

export default function ReviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}
