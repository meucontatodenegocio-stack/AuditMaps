export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AudienceLossMetric {
  category: string;
  percentage: number;
  reason: string;
}

export interface StructuredAuditData {
  businessName: string;
  healthScore: number; // 0 to 100
  summary: string;
  audienceLossAnalysis: AudienceLossMetric[];
  positivePoints: string[];
  negativePoints: string[];
  improvements: string[];
  immediateActionPlan: string[];
}

export interface AuditResult {
  data: StructuredAuditData;
  sources: GroundingSource[];
}
