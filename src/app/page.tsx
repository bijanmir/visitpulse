import { Logo } from "@/components/brand/logo";
import { MarketingNav } from "@/components/marketing/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  LineChart,
  Pill,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ambient bg-grid">
      <MarketingNav />

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 text-center md:pt-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-pulse-100/80 px-4 py-1.5 text-sm font-medium text-pulse-800 ring-1 ring-pulse-200/60">
            <Sparkles className="h-4 w-4" />
            Built for outpatient psychiatry
          </div>
          <h1 className="font-display mx-auto mt-8 max-w-4xl text-5xl font-semibold leading-[1.1] tracking-tight text-slate-800 md:text-6xl">
            Walk into every visit{" "}
            <span className="bg-gradient-to-r from-pulse-600 to-pulse-400 bg-clip-text text-transparent">
              already prepared
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            VisitPulse collects patient check-ins, symptom trends, and
            medication history — then delivers a calm, one-page brief before
            each appointment.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="min-w-[200px]">
                Try the demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/check-in/demo-jordan">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                Preview patient check-in
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Demo uses synthetic patients only · HIPAA module ready when you are
          </p>
        </section>

        <section
          id="features"
          className="mx-auto max-w-6xl px-6 py-20"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Calendar}
              title="Visit Prep"
              description="PHQ-9, GAD-7, sleep, adherence, and safety screens — summarized in under 30 seconds."
              tone="pulse"
            />
            <FeatureCard
              icon={Pill}
              title="Med Timeline"
              description="Trials, dose changes, response, and discontinuation reasons on one visual timeline."
              tone="lavender"
            />
            <FeatureCard
              icon={Shield}
              title="Compliance-ready"
              description="Modular HIPAA layer: flip compliance mode when BAAs and audit logging are live."
              tone="peach"
            />
          </div>
        </section>

        <section
          id="workflow"
          className="mx-auto max-w-6xl px-6 py-20"
        >
          <Card className="overflow-hidden p-0">
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-14">
                <h2 className="font-display text-3xl font-semibold text-slate-800">
                  From check-in to session brief
                </h2>
                <ol className="mt-8 space-y-6">
                  {[
                    "Patient completes a 90-second check-in before the visit",
                    "Symptom scales and med context update automatically",
                    "You review one brief — trends, risks, talking points",
                  ].map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pulse-100 text-sm font-semibold text-pulse-700">
                        {i + 1}
                      </span>
                      <span className="text-slate-600">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-gradient-to-br from-pulse-50 via-white to-lavender-100/40 p-10 md:p-14">
                <div className="rounded-2xl bg-white/90 p-6 shadow-lg shadow-pulse-200/30 ring-1 ring-pulse-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-pulse-600">
                    Today · 2:00 PM
                  </p>
                  <p className="mt-2 font-display text-xl font-semibold text-slate-800">
                    Jordan M. · MDD
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    Depression improving · Anxiety stable · Sleep 6.5h ·
                    Partial adherence
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-pulse-100 px-3 py-1 text-xs font-medium text-pulse-800">
                      PHQ-9 ↓ 4
                    </span>
                    <span className="rounded-full bg-lavender-100 px-3 py-1 text-xs font-medium text-lavender-800">
                      Venlafaxine ↑ 2w
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-center text-3xl font-semibold text-slate-800">
            Simple pricing for private practice
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <PricingCard
              name="Essential"
              price="$59"
              features={[
                "Visit Prep & patient check-ins",
                "PHQ-9 / GAD-7 trends",
                "Up to 40 active patients",
              ]}
            />
            <PricingCard
              name="Pro"
              price="$99"
              highlighted
              features={[
                "Everything in Essential",
                "Med Timeline & note export",
                "Unlimited patients",
                "Priority support",
              ]}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white/50 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <Logo showText />
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} VisitPulse · Synthetic demo data
            only
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tone: "pulse" | "lavender" | "peach";
}) {
  const bg = {
    pulse: "bg-pulse-100 text-pulse-700",
    lavender: "bg-lavender-100 text-lavender-800",
    peach: "bg-peach-100 text-peach-800",
  };
  return (
    <Card hover className="text-left">
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold text-slate-800">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </Card>
  );
}

function PricingCard({
  name,
  price,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <Card
      className={
        highlighted
          ? "ring-2 ring-pulse-300/80 bg-gradient-to-b from-white to-pulse-50/50"
          : ""
      }
    >
      <h3 className="font-display text-xl font-semibold text-slate-800">
        {name}
      </h3>
      <p className="mt-2">
        <span className="font-display text-4xl font-semibold text-slate-800">
          {price}
        </span>
        <span className="text-slate-500">/month per clinician</span>
      </p>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-pulse-500" />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/login" className="mt-8 block">
        <Button
          variant={highlighted ? "primary" : "secondary"}
          className="w-full"
        >
          Start with demo
        </Button>
      </Link>
    </Card>
  );
}
