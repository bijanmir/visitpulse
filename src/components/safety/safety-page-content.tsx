export function SafetyPageContent() {
  return (
    <article className="prose prose-slate mt-8 max-w-none prose-headings:font-display prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-800">
      <p className="text-sm text-slate-500">
        Version: demo / pre-pilot · Not legal advice
      </p>

      <h1>Safety &amp; crisis workflow</h1>
      <p>
        <strong>Audience:</strong> clinicians evaluating VisitPulse, and our
        engineering checklist before any real patient data.
      </p>

      <h2>What VisitPulse is</h2>
      <p>
        VisitPulse is a <strong>pre-visit decision-support workflow</strong>:
        symptom trends, medication timeline context, patient-reported check-ins,
        and a formatted brief for paste into your existing note system.
      </p>
      <p>
        It is <strong>not</strong> a crisis service, emergency line, or
        replacement for your clinical judgment.
      </p>

      <h2>What VisitPulse does not do</h2>
      <ul>
        <li>Does not provide 24/7 monitoring or real-time crisis response</li>
        <li>
          Does not guarantee that a clinician will see a submission immediately
        </li>
        <li>Does not diagnose, triage, or direct treatment</li>
        <li>
          Does not replace suicide risk assessment (e.g. C-SSRS) where your
          standard of care requires it
        </li>
        <li>
          Does not contact patients, family, or emergency services on your
          behalf (in the current product)
        </li>
      </ul>

      <h2>Patient-facing expectations</h2>
      <p>Patients completing a check-in see:</p>
      <ul>
        <li>
          A clear notice that the form is <strong>not for emergencies</strong>
        </li>
        <li>
          Direction to call <strong>988</strong> or <strong>911</strong> if they
          are in immediate danger
        </li>
      </ul>
      <p>
        Responses appear on the clinician dashboard; timing depends on when the
        clinician next opens the app.
      </p>

      <h2>Safety flags (demo behavior)</h2>
      <p>
        A check-in may be marked with a <strong>safety flag</strong> using a{" "}
        <strong>demo-only heuristic</strong> (not a clinical rule). Production
        flag logic must be defined with legal and clinical review.
      </p>

      <h3>Current demo limitations</h3>
      <div className="not-prose overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 pr-4 font-medium text-slate-800">Gap</th>
              <th className="py-2 pr-4 font-medium text-slate-800">Risk</th>
              <th className="py-2 font-medium text-slate-800">
                Target (pilot)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4">No push/SMS/email on flag</td>
              <td className="py-2 pr-4">Delayed awareness</td>
              <td className="py-2">Configurable alert + audit log</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4">No on-call routing</td>
              <td className="py-2 pr-4">Unclear responsibility</td>
              <td className="py-2">Practice escalation policy in onboarding</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">No SLA</td>
              <td className="py-2 pr-4">Liability ambiguity</td>
              <td className="py-2">Documented response expectations in BAA</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Clinician-facing expectations</h2>
      <ul>
        <li>
          <strong>Schedule</strong> and <strong>Patients</strong> lists surface
          patients whose <strong>latest check-in</strong> is safety-flagged
          (badge and highlight).
        </li>
        <li>
          Pre-visit brief and copy-to-note include{" "}
          <code className="text-xs">[SAFETY FLAG]</code> when applicable.
        </li>
        <li>
          Clinicians remain responsible for follow-up per license, practice
          policy, and standard of care.
        </li>
      </ul>

      <h2>Recommended practice policy (before pilot)</h2>
      <ol>
        <li>Define who receives alerts and within what window.</li>
        <li>
          Document that check-in is optional and not for acute crisis use.
        </li>
        <li>
          Do not represent VisitPulse as HIPAA-compliant until BAA, audit
          logging, and hosting are in place.
        </li>
        <li>Keep copy-to-note identifier-light by default.</li>
      </ol>

      <h2>Reporting &amp; audit (roadmap)</h2>
      <ul>
        <li>Immutable audit log of record access</li>
        <li>Export of safety-flag events for practice review</li>
        <li>No PHI in application logs or third-party analytics</li>
      </ul>
    </article>
  );
}
