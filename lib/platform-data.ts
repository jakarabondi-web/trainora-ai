export type PlatformAnalytics = ReturnType<typeof getPlatformAnalytics>;

export function getPlatformAnalytics() {
  const daily: [string, number, number][] = [
    ["Jul 18", 18120, 97.9], ["Jul 19", 19680, 98.1], ["Jul 20", 21440, 98.0],
    ["Jul 21", 23810, 98.3], ["Jul 22", 25190, 98.2], ["Jul 23", 27940, 98.5], ["Jul 24", 29370, 98.4],
  ];
  const active = daily.at(-1)!;
  const prior = daily.at(-2)!;
  return {
    generatedAt: "July 24, 2026 · 12:54 PM ET",
    metrics: {
      tasksToday: active[1],
      taskGrowth: Math.round(((active[1] - prior[1]) / prior[1]) * 1000) / 10,
      reviewAgreement: active[2],
      activeTrainers: 18462,
      trainerGrowth: 4.7,
      flaggedSubmissions: 284,
      acceptanceRate: 96.8,
      revisionRate: 2.1,
      medianReviewMinutes: 18.4,
    },
    daily: daily.map(([day, tasks, agreement]) => ({ day, tasks, agreement })),
    domains: [
      { name: "Software engineering", volume: 7820, quality: 98.8 },
      { name: "Mathematics", volume: 4910, quality: 98.5 },
      { name: "Finance", volume: 4160, quality: 97.9 },
      { name: "Medicine", volume: 3870, quality: 98.3 },
      { name: "Law", volume: 2940, quality: 97.6 },
      { name: "Linguistics", volume: 2360, quality: 98.7 },
    ],
    riskQueue: [
      { trainer: "Marcel D.", trigger: "Gold-task accuracy below threshold", score: 71, action: "Access paused", severity: "high" },
      { trainer: "Nadia K.", trigger: "Reviewer disagreement spike", score: 82, action: "Calibration required", severity: "medium" },
      { trainer: "Thomas R.", trigger: "Unusual completion velocity", score: 77, action: "Integrity review", severity: "high" },
      { trainer: "Elena V.", trigger: "Two rubric misses in 30 tasks", score: 88, action: "Coaching assigned", severity: "low" },
    ],
    projectHealth: [
      { name: "Financial Research Evaluation", client: "Northstar Systems", progress: 78, quality: 96.9, sla: "On track", tasks: 12400, trend: [42,48,51,56,61,67,73,78] },
      { name: "Multilingual Safety Benchmark", client: "Helix AI", progress: 62, quality: 98.2, sla: "On track", tasks: 8640, trend: [24,29,33,41,44,51,57,62] },
      { name: "Code Reasoning SFT", client: "Vector Labs", progress: 84, quality: 95.8, sla: "At risk", tasks: 19240, trend: [49,54,62,66,70,76,81,84] },
      { name: "Medical Factuality Review", client: "Luminova", progress: 47, quality: 98.7, sla: "On track", tasks: 5280, trend: [12,17,22,26,31,36,42,47] },
    ],
    qualityDistribution: { excellent: 72, accepted: 24.8, revision: 2.1, rejected: 1.1 },
    trainerFunnel: [
      { stage: "Applications", value: 12480, conversion: 100 },
      { stage: "Identity verified", value: 10234, conversion: 82 },
      { stage: "Skills qualified", value: 6530, conversion: 52.3 },
      { stage: "Calibration passed", value: 3840, conversion: 30.8 },
      { stage: "Project activated", value: 2960, conversion: 23.7 },
    ],
    capacity: { available: 6380, allocated: 10240, limited: 1420, paused: 422 },
    economics: {
      costPerAcceptedTask: 8.42,
      costChange: -6.8,
      budgetUtilization: 68.4,
      pendingPayouts: 421840,
      grossMargin: 34.7,
    },
    activity: [
      { time: "12:51", event: "Quality threshold automatically enforced", detail: "FIN-284 · 18 submissions routed to adjudication", type: "quality" },
      { time: "12:42", event: "Dataset version approved", detail: "Multilingual Safety v2.4 · 24,800 records", type: "dataset" },
      { time: "12:26", event: "Trainer cohort activated", detail: "42 verified Japanese linguists assigned", type: "workforce" },
      { time: "12:14", event: "SLA forecast changed", detail: "Code Reasoning SFT moved to at-risk", type: "risk" },
    ],
  };
}

export const capabilityGroups = [
  { group: "Workforce operations", tools: ["Applicant pipeline", "Identity & credential verification", "Skill taxonomy", "Availability and capacity", "Trainer segmentation", "Team assignment", "Access suspension", "Offboarding", "Performance history", "Document expiry"] },
  { group: "Quality management", tools: ["Qualification builder", "Gold-task library", "Calibration rounds", "Blind peer review", "Consensus scoring", "Senior adjudication", "Automated anomaly flags", "Quality thresholds", "Trainer risk scores", "Root-cause analysis"] },
  { group: "Project delivery", tools: ["Project intake", "Workforce matching", "Task templates", "Rubric builder", "Queue controls", "SLA monitoring", "Sampling plans", "Dataset versions", "Approval gates", "Secure exports"] },
  { group: "Analytics & intelligence", tools: ["Executive KPIs", "Live throughput", "Cost per accepted task", "Agreement trends", "Domain benchmarks", "Trainer cohorts", "Client reports", "Forecasting", "Regression alerts", "Custom exports"] },
  { group: "Security & governance", tools: ["Role-based access", "SSO & SCIM", "Project isolation", "Audit trail", "Retention policies", "Download controls", "Data residency", "Incident workflows", "Consent records", "Policy attestations"] },
  { group: "Commercial & finance", tools: ["Client organizations", "Contracts and rate cards", "Budgets", "Trainer rates", "Invoices", "Payout approvals", "Tax documents", "Disputes", "Credit controls", "Margin reporting"] },
  { group: "Platform administration", tools: ["Feature flags", "Notification templates", "Localization", "Taxonomies", "API keys", "Webhooks", "Integrations", "Support console", "System health", "Environment settings"] },
];
