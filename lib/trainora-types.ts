export type ApplicationStage =
  | "email_verification"
  | "identity_verification"
  | "credential_review"
  | "pre_screening"
  | "human_review"
  | "approved";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "action_required"
  | "waitlisted"
  | "approved"
  | "rejected";

export type ApplicantSummary = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  discipline: string;
  country: string;
  yearsExperience: number;
  applicationStatus: ApplicationStatus;
  currentStage: ApplicationStage;
  qualityScore: number;
  riskScore: number;
  submittedAt: string | null;
  adminNotes: string | null;
  checks: Array<{
    id: string;
    type: string;
    status: string;
    score: number | null;
    reason: string | null;
  }>;
  documents: Array<{
    id: string;
    kind: string;
    filename: string;
    status: string;
    createdAt: string;
  }>;
  assessment: {
    attemptId: string;
    title: string;
    status: string;
    score: number | null;
    integrityScore: number | null;
    passed: boolean | null;
  } | null;
};

export type JobSummary = {
  id: string;
  title: string;
  clientName: string;
  discipline: string;
  description: string;
  requirements: string[];
  rateMin: number;
  rateMax: number;
  rateUnit: string;
  hoursPerWeek: string | null;
  location: string;
  requiredQualityScore: number;
  openings: number;
  status: string;
  publishedAt: string | null;
  closesAt: string | null;
  applicationStatus?: string | null;
  matchScore?: number;
};
