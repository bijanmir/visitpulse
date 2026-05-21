import { Logo } from "@/components/brand/logo";
import { MarketingNav } from "@/components/marketing/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCopy,
  GitBranch,
  LineChart,
  MessageSquare,
  Pill,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ambient bg-grid">
      <MarketingNav />

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 text-center md:pt-28">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-pulse-100/80 px-4 py-1.5 text-sm font-medium text-pulse-800 ring-1 ring-pulse-200/60">
            For cash-pay & private-practice psychiatrists
          </p>
          <h1 className="font-display mx-auto mt-8 max-w-4xl text-5xl font-semibold leading-[1.1] tracking-tight text-slate-800 md:text-6xl">
            Complex patients.{" "}
            <span className="bg-gradient-to-r from-pulse-600 to-pulse-400 bg-clip-text text-transparent">
              One timeline.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            VisitPulse keeps a living medication and symptom story — then gives
            you a one-page brief to paste into whatever note system you already
            use. Patient check-ins are just how the timeline stays current.
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
                See patient check-in
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Interactive demo · synthetic patients only
          </p>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={GitBranch}
              title="Med timeline"
              description="Every trial, dose change, response, and stop reason — the story your EHR med list doesn't tell."
              tone="pulse"
            />
            <FeatureCard
              icon={LineChart}
              title="Symptom trends"
              description="PHQ-9 and GAD-7 direction before you walk in — improving, stable, or worsening at a glance."
              tone="lavender"
            />
            <FeatureCard
              icon={ClipboardCopy}
              title="Copy to note"
              description="One click copies a formatted pre-visit paragraph. Paste into SimplePractice, Osmind, or a Word template — no integration required."
              tone="peach"
            />
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-6xl px-6 py-20">
          <Card className="overflow-hidden p-0">
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-14">
                <h2 className="font-display text-3xl font-semibold text-slate-800">
                  Sensor → brief → your note
                </h2>
                <ol className="mt-8 space-y-6">
                  {[
                    {
                      title: "Timeline stays current",
                      body: "Optional pre-visit check-in (sleep, adherence, patient message) feeds the record.",
                    },
                    {
                      title: "You get the output",
                      body: "Med timeline + trends + talking points on one calm screen.",
                    },
                    {
                      title: "Paste and go",
                      body: "Copy a structured paragraph into your existing charting workflow.",
                    },
                  ].map((step, i) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pulse-100 text-sm font-semibold text-pulse-700">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">
                          {step.title}
                        </p>
                        <p className="text-sm text-slate-600">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-gradient-to-br from-pulse-50 via-white to-lavender-100/40 p-10 md:p-14">
                <div className="rounded-2xl bg-white/90 p-6 font-mono text-xs leading-relaxed text-slate-600 shadow-lg shadow-pulse-200/30 ring-1 ring-pulse-100">
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider text-pulse-600">
                    Clipboard · ready to paste
                  </p>
                  <pre className="mt-3 whitespace-pre-wrap">
                    {`VISITPULSE — PRE-VISIT BRIEF
Patient: Jordan M. | MDD
PHQ-9: Improving (-4 pts)
Active: Venlafaxine XR 150mg
Patient message: "Foggy mornings…"
• Explore adherence barriers`}
                  </pre>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-pulse-500" />
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Check-ins are the{" "}
            <span className="font-medium text-slate-800">sensor</span>, not the
            product. Solo prescribers already chart elsewhere — we make the
            pre-visit thinking fast, then get out of your way.
          </p>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-center text-3xl font-semibold text-slate-800">
            Priced for a 45-minute follow-up
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-slate-600">
            One saved miss on a complex patient pays for the month.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <PricingCard
              name="Essential"
              price="$59"
              features={[
                "Med timeline & symptom trends",
                "Pre-visit brief",
                "Patient check-in links",
                "Up to 40 patients",
              ]}
            />
            <PricingCard
              name="Pro"
              price="$99"
              highlighted
              features={[
                "Everything in Essential",
                "Copy-to-note formatting",
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
            © {new Date().getFullYear()} VisitPulse · Clinical workflow demo
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
