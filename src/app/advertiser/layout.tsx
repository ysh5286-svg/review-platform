import OnboardingGuard from "@/components/OnboardingGuard";

export default function AdvertiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}
