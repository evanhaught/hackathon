export enum Department {
  EDUCATION_ABROAD = 'Education Abroad',
  INTL_ADMISSIONS = 'International Admissions',
  GLOBAL_LEARNING = 'Global Learning',
  INTL_STUDENT_SUPPORT = 'International Student Support',
}

export interface Student {
  id: string;
  name: string;
  universityId: string;
  department: Department;
  problem: string;
  checkInTime: Date;
  status: 'waiting' | 'helping' | 'completed';
  tags?: string[]; // AI Generated
  priority?: 'High' | 'Medium' | 'Low'; // AI Generated
  aiSummary?: string; // AI Generated
  helpedBy?: string; // Name of advisor
  helpedAt?: Date; // Time helped
}

export interface Advisor {
  name: string;
  department: Department;
}

export interface AIAnalysisResult {
  tags: string[];
  priority: 'High' | 'Medium' | 'Low';
  summary: string;
}