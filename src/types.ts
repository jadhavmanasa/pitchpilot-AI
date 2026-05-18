export type SlideType = 'cover' | 'problem' | 'solution' | 'market' | 'model' | 'competition' | 'strategy' | 'financials' | 'team' | 'ask';
export type SlideTemplateId = 'aurora' | 'minimal' | 'venture' | 'editorial' | 'midnight' | 'summit';

export interface VisualData {
  chartType: 'pie' | 'bar' | 'line' | 'area';
  data: { name: string; value: number }[];
}

export interface Slide {
  type: SlideType;
  title: string;
  subtitle: string;
  content: string[];
  visualData?: VisualData;
  imagePrompt: string;
  imageUrl?: string;
  speakerScript: string;
}

export interface InvestorScore {
  clarity: number;
  scalability: number;
  market: number;
  innovation: number;
  revenue: number;
}

export interface Competitor {
  name: string;
  differentiator: string;
  strength: string;
  weakness: string;
}

export interface PitchDeck {
  id: string;
  createdAt: string;
  startupName: string;
  industry: string;
  templateId?: SlideTemplateId;
  slides: Slide[];
  investorScore: InvestorScore;
  competitors: Competitor[];
  targetInvestors: string[];
}

export interface GenerateDeckRequest {
  idea: string;
  industry: string;
  audience: string;
  model: string;
  stage: string;
  templateId?: SlideTemplateId;
}
