import { Logo } from "@/components/brand/logo";
import { SafetyPageContent } from "@/components/safety/safety-page-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Safety",
};

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-ambient">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Logo />
        <SafetyPageContent />
        <Link href="/" className="mt-8 inline-block">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
