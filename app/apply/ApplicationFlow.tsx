"use client";

import { FormEvent, useEffect, useState } from "react";

type PublicQuestion = {
  id: string;
  section: "Core quality" | "Domain expertise";
  competency: string;
  prompt: string;
  options: string[];
  weight: number;
};

type FlowStage = "profile" | "email" | "identity" | "assessment" | "status";

const journey = [
  ["01", "Create application", "Contact details and professional profile"],
  ["02", "Verify email", "Time-limited code sent to your inbox"],
  ["03", "Verify identity", "Government ID, selfie match, and liveness"],
  ["04", "Validate expertise", "Credentials, licenses, and experience evidence"],
  ["05", "Pass pre-screening", "Quality judgment, integrity, and domain tests"],
  ["06", "Human review", "Final evidence review and approval decision"],
];

export function ApplicationFlow() {
  const [stage, setStage] = useState<FlowStage>("profile");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [applicantId, setApplicantId] = useState("");
  const [email, setEmail] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [code, setCode] = useState("");
  const [previewCode, setPreviewCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [attemptId, setAttemptId] = useState("");
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; domainScore: number; integrityScore: number; percentile: number; rankBand: string; passed: boolean } | null>(null);

  const stageIndex = { profile: 0, email: 1, identity: 2, assessment: 4, status: 5 }[stage];

  useEffect(() => {
    const saved = window.localStorage.getItem("trainora-application-context");
    if (!saved) return;
    try {
      const value = JSON.parse(saved) as { applicantId?: string; email?: string; stage?: FlowStage };
      if (value.applicantId) setApplicantId(value.applicantId);
      if (value.email) setEmail(value.email);
      if (value.stage && ["email", "identity", "status"].includes(value.stage)) setStage(value.stage);
    } catch {}
  }, []);

  function remember(nextStage: FlowStage, idValue = applicantId, emailValue = email) {
    window.localStorage.setItem("trainora-application-context", JSON.stringify({ applicantId: idValue, email: emailValue, stage: nextStage }));
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const application = await callApi("/api/applications", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setApplicantId(application.applicantId);
      setEmail(String(payload.email));
      const verification = await callApi("/api/verifications/email/request", {
        method: "POST",
        body: JSON.stringify({ applicantId: application.applicantId, email: payload.email }),
      });
      setVerificationId(verification.verificationId);
      setPreviewCode(verification.previewCode ?? "");
      setMessage(verification.delivery === "sent"
        ? "A six-digit verification code has been sent to your email."
        : "Your application was saved. Email delivery requires the production email key listed in the launch checklist.");
      setStage("email");
      remember("email", application.applicantId, String(payload.email));
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmail() {
    setBusy(true);
    setMessage("");
    try {
      await callApi("/api/verifications/email/confirm", {
        method: "POST",
        body: JSON.stringify({ applicantId, verificationId, code }),
      });
      setStage("identity");
      remember("identity");
      setMessage("Email verified. Complete the protected identity check next.");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function uploadEvidence(kind: "id_front" | "selfie", file: File) {
    const form = new FormData();
    form.set("applicantId", applicantId);
    form.set("kind", kind);
    form.set("consent", String(consent));
    form.set("file", file);
    return callApi("/api/verifications/documents", { method: "POST", body: form });
  }

  async function startAutomatedIdentity() {
    setBusy(true);
    setMessage("");
    try {
      const session = await callApi("/api/verifications/identity/session", {
        method: "POST",
        body: JSON.stringify({ applicantId, consent, returnUrl: `${window.location.origin}/apply` }),
      });
      if (session.redirectUrl) {
        remember("identity");
        window.location.assign(session.redirectUrl);
      }
    } catch (error) {
      setMessage(`${errorMessage(error)} You may use the restricted manual evidence route below while the provider is being connected.`);
    } finally {
      setBusy(false);
    }
  }

  async function completeIdentityStep() {
    if (!consent || !idFile || !selfieFile) {
      setMessage("Consent, a government ID image, and a current selfie are required.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await Promise.all([uploadEvidence("id_front", idFile), uploadEvidence("selfie", selfieFile)]);
      await assignAssessment();
      setMessage("Evidence uploaded securely. It is not approved yet; an authorized reviewer must validate it before final approval.");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function assignAssessment() {
      await callApi(`/api/applications/${applicantId}`, {
        method: "PATCH",
        body: JSON.stringify({ submit: true }),
      });
      const assignment = await callApi("/api/assessments/assign", {
        method: "POST",
        body: JSON.stringify({ applicantId }),
      });
      setAttemptId(assignment.attemptId);
      const assessment = await callApi(`/api/assessments/attempts/${assignment.attemptId}`);
      setQuestions(assessment.attempt.questions);
      setStage("assessment");
  }

  async function continueAfterAutomatedIdentity() {
    setBusy(true);
    setMessage("");
    try {
      const status = await callApi(`/api/applications/${applicantId}`);
      const checks = status.checks as Array<{ type: string; status: string }>;
      const identityPassed = checks.some(check => check.type === "identity_bundle" && check.status === "passed");
      const selfiePassed = checks.some(check => check.type === "selfie_liveness" && check.status === "passed");
      if (!identityPassed || !selfiePassed) {
        throw new Error("The automated identity result is not complete yet. Wait briefly and recheck, or use the manual-review fallback.");
      }
      await assignAssessment();
      setMessage("Identity verification passed. Your pre-screening assessment is ready.");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function submitAssessment() {
    setBusy(true);
    setMessage("");
    try {
      const assessmentResult = await callApi(`/api/assessments/attempts/${attemptId}`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setResult(assessmentResult);
      setStage("status");
      remember("status");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return <main className="applyPage">
    <header>
      <a className="portalBrand darkLogo" href="/"><i>t</i><span>trainora<b>ai</b></span></a>
      <div><span>Already approved?</span><a href="/trainer">Open trainer account →</a></div>
    </header>
    <section className="applyHero">
      <p>EXPERT APPLICATION</p>
      <h1>Quality is earned.<br/><em>Approval is evidence-based.</em></h1>
      <span>Every applicant follows the same documented path. Submitting an application does not provide project access.</span>
      <div className="approvalPromise"><b>Strict approval process</b><span>Email → identity → credentials → assessment → human decision</span></div>
    </section>

    <div className="applicationLayout">
      <aside>
        <p>YOUR APPROVAL JOURNEY</p>
        {journey.map(([n, title, description], index) => <div className={index === stageIndex ? "current" : index < stageIndex ? "complete" : ""} key={n}>
          <i>{index < stageIndex ? "✓" : n}</i>
          <p><b>{title}</b><span>{description}</span></p>
        </div>)}
        <div className="approvalRule"><b>No automatic listing</b><p>Only applicants who pass all mandatory gates and a final human review appear in the expert network.</p></div>
      </aside>

      <section className="assessment liveApplication">
        {message && <div className="applicationMessage" role="status">{message}</div>}

        {stage === "profile" && <form className="applicationForm" onSubmit={submitProfile}>
          <div className="assessmentHead">
            <span>STEP 1 OF 6</span><em>Saved securely</em>
            <h2>Create your expert application</h2>
            <p>Use your legal name exactly as it appears on your government ID. Your profile will not be listed until final approval.</p>
          </div>
          <div className="formGrid">
            <label><span>Legal full name</span><input name="fullName" required autoComplete="name" placeholder="Olivia Bennett"/></label>
            <label><span>Email address</span><input name="email" type="email" required autoComplete="email" placeholder="olivia@example.com"/></label>
            <label><span>Primary discipline</span><select name="discipline" required defaultValue=""><option value="" disabled>Select discipline</option><option>Software Engineering</option><option>Medicine</option><option>Law</option><option>Mathematics</option><option>Finance</option><option>Linguistics</option><option>Research</option></select></label>
            <label><span>Country of residence</span><input name="country" required placeholder="Country"/></label>
            <label><span>Years of relevant experience</span><input name="yearsExperience" type="number" min="0" max="60" required/></label>
            <label><span>Portfolio or professional profile</span><input name="portfolioUrl" type="url" placeholder="https://"/></label>
            <label className="wide"><span>Highest relevant education</span><textarea name="education" required placeholder="Degree, institution, field, and graduation year"/></label>
            <label className="wide"><span>Licenses and professional credentials</span><textarea name="credentials" placeholder="Credential name, issuing organization, number, and expiry date"/></label>
          </div>
          <div className="privacyCallout"><b>Before you continue</b><p>Trainora will verify the email, identity, and professional evidence you provide. Sensitive identity files are restricted to authorized reviewers and retained only for the documented verification period.</p></div>
          <button className="primaryApplicationAction" disabled={busy}>{busy ? "Saving application…" : "Create application and verify email →"}</button>
        </form>}

        {stage === "email" && <div className="verificationStep">
          <div className="assessmentHead"><span>STEP 2 OF 6</span><em>Code expires in 10 minutes</em><h2>Verify your email</h2><p>Enter the code sent to <b>{email}</b>. Verified email is a mandatory gate and will also be used for application updates.</p></div>
          <label className="codeInput"><span>Six-digit code</span><input inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000"/></label>
          {previewCode && <p className="devCode">Development preview code: <b>{previewCode}</b></p>}
          <button className="primaryApplicationAction" disabled={busy || code.length !== 6} onClick={verifyEmail}>{busy ? "Verifying…" : "Verify email →"}</button>
          <button className="secondaryApplicationAction" onClick={() => setStage("profile")}>Correct my application details</button>
        </div>}

        {stage === "identity" && <div className="verificationStep">
          <div className="assessmentHead"><span>STEPS 3–4 OF 6</span><em>Restricted evidence</em><h2>Verify identity and credentials</h2><p>Your legal name and date of birth must match your ID. A current selfie is used for face comparison and liveness review. A mismatch never creates an automatic rejection; it creates a human-review case.</p></div>
          <div className="identityChecklist">
            <article><i>1</i><div><b>Government-issued photo ID</b><span>Passport, national ID, or driver’s license. Must be unexpired and fully visible.</span><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setIdFile(event.target.files?.[0] ?? null)}/></div></article>
            <article><i>2</i><div><b>Current selfie</b><span>Clear, well-lit, unobstructed face image used for authorized ID comparison.</span><input type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={(event) => setSelfieFile(event.target.files?.[0] ?? null)}/></div></article>
            <article><i>3</i><div><b>Professional evidence</b><span>Licenses, degrees, employment, and portfolio evidence are reviewed separately after submission.</span><em>Captured from your application; documents may be requested during review.</em></div></article>
          </div>
          <label className="identityConsent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)}/><span><b>I consent to identity verification.</b> I understand that my ID and selfie may be processed to check document authenticity, face similarity, and liveness; that a human can review uncertain results; and that I can request the documented privacy and retention information.</span></label>
          <button className="primaryApplicationAction identityProviderAction" disabled={busy || !consent} onClick={startAutomatedIdentity}>{busy ? "Opening secure verification…" : "Verify with government ID and matching selfie →"}</button>
          <button className="secondaryApplicationAction" disabled={busy || !consent} onClick={continueAfterAutomatedIdentity}>I completed verification — check result</button>
          <div className="manualEvidenceDivider"><span>Restricted manual-review fallback</span></div>
          <button className="primaryApplicationAction" disabled={busy || !consent || !idFile || !selfieFile} onClick={completeIdentityStep}>{busy ? "Encrypting and uploading…" : "Submit evidence and begin assessment →"}</button>
        </div>}

        {stage === "assessment" && <div>
          <div className="assessmentHead"><span>STEP 5 OF 6 · CONTROLLED PRE-SCREEN</span><em>Core + {questions.find(question=>question.section==="Domain expertise")?.competency?"subject expertise":"domain"} · one sitting</em><h2>Quality and subject assessment</h2><p>The test combines universal quality, confidentiality, safety, and rubric judgment with questions specific to the discipline you selected. Overall score, domain score, response pattern, and timing are recorded.</p></div>
          {questions.map((question, index) => <fieldset key={question.id}>
            <legend><span>{index + 1}</span><div>{question.prompt}<small>{question.section} · {question.competency}</small></div></legend>
            {question.options.map((option, optionIndex) => <label className={answers[question.id] === optionIndex ? "chosen" : ""} key={option}>
              <input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}/>
              <i>{String.fromCharCode(65 + optionIndex)}</i>{option}
            </label>)}
          </fieldset>)}
          <div className="assessmentActions"><p>Answered {Object.keys(answers).length} of {questions.length}</p><button disabled={busy || Object.keys(answers).length !== questions.length} onClick={submitAssessment}>{busy ? "Scoring securely…" : "Submit assessment →"}</button></div>
        </div>}

        {stage === "status" && <div className={`sampleResult ${result?.passed ? "pass" : "review"}`}>
          <i>{result?.passed ? "✓" : "!"}</i>
          <h2>{result?.passed ? "Assessment passed" : "Human review required"}</h2>
          <strong>{result?.score}%</strong>
          <div className="resultScoreGrid"><span><b>{result?.domainScore}%</b>Domain score</span><span><b>{result?.integrityScore}%</b>Integrity</span><span><b>{result?.rankBand}</b>{result?.percentile}th percentile</span></div>
          <p>{result?.passed
            ? "You passed the automated quality threshold. Your identity, credentials, evidence, and risk signals still require a final human decision before you can be listed or apply for projects."
            : "You have not been approved or rejected automatically. A reviewer will inspect your answers, integrity signals, credentials, and identity evidence before deciding whether a retake or further evidence is appropriate."}</p>
          <div className="statusTimeline">
            <span className="done">Application received</span><span className="done">Email verified</span><span className="active">Evidence review</span><span>Human decision</span><span>Trainer listing</span>
          </div>
          <a href="/trainer#application-status">View application status →</a>
        </div>}
      </section>
    </div>

    <section className="screeningSystem">
      <div><small>STRICT QUALITY GATES</small><h2>How substandard and fraudulent applicants are screened.</h2><p>No single score is sufficient. Signals are combined, reviewed, documented, and continuously monitored after approval.</p></div>
      <div className="gateGrid">{[
        ["Email & account integrity", "Verified email, disposable-domain controls, duplicate accounts, device and velocity signals."],
        ["Identity & liveness", "Document authenticity, selfie comparison, liveness, age checks, duplicate identity, and human review."],
        ["Credential evidence", "Institution, license, employment, portfolio, and domain-reference validation."],
        ["Knowledge examination", "Versioned question bank, randomized order, time analysis, attempt limits, and domain thresholds."],
        ["Judgment assessment", "Evidence use, instruction following, uncertainty, escalation, safety, and confidentiality."],
        ["Paid calibration", "Blind scoring against gold answers, reviewer agreement, error severity, and written rationale."],
        ["Probation period", "Restricted access, higher review sampling, hidden gold tasks, and quality-decay alerts."],
        ["Fair intervention", "Evidence packet, human adjudication, coaching, recalibration, appeal, suspension, and audit trail."],
      ].map(([title, description], index) => <article key={title}><i>{String(index + 1).padStart(2, "0")}</i><h3>{title}</h3><p>{description}</p></article>)}</div>
    </section>
  </main>;
}

async function callApi(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: init.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init.headers },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
  return payload;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}
