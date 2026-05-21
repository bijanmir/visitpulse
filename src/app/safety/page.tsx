import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { readFileSync } from "fs";
import { join } from "path";

export const metadata = {
  title: "Safety",
};

export default function SafetyPage() {
  let body = "";
  try {
    body = readFileSync(join(process.cwd(), "SAFETY.md"), "utf8");
  } catch {
    body = "Safety documentation is not available.";
  }

  return (
    <div className="min-h-screen bg-ambient">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Logo />
        <article className="prose prose-slate mt-8 max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
            {body}
          </pre>
        </article>
        <Link href="/" className="mt-8 inline-block">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
