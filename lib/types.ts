export type FlatType =
  | '2-room Flexi'
  | '2-room Flexi (Type 1)'
  | '2-room Flexi (Type 2)'
  | '3-room'
  | '3Gen'
  | '4-room'
  | '5-room'
  | 'Community Care Apartment (CCA)';
export type WaitingBand = 'soon' | 'mid' | 'later';
export type AmenityCategory =
  | 'mrt'
  | 'hawker'
  | 'shopping'
  | 'healthcare'
  | 'schools'
  | 'parks'
  | 'sports';

export type MatchStatus = 'pass' | 'miss' | 'unknown' | 'unanswered';

export interface FlatPrice {
  type: FlatType;
  minPrice: number | null;
  maxPrice: number | null;
  units: number | null;
  unitsAreApproximate?: boolean;
  estimatedFloorAreaSqm?: number | null;
  estimatedInternalFloorAreaSqm?: number | null;
}

export interface BtoProject {
  id: string;
  name: string;
  canonicalName: string | null;
  town: string | null;
  region: string;
  launchStatus: 'launched' | 'announced_upcoming' | 'planned';
  launchExercise: string | null;
  launchDate: string | null;
  launchWindow: string | null;
  launchLabel: string;
  position: [number, number] | null;
  coordinateAccuracy: string | null;
  flatTypes: FlatPrice[];
  approxUnitsTotal: number | null;
  approxBtoUnits: number | null;
  publicRentalUnitsApprox: number | null;
  estimatedWaitingTimeMonths: number | { min: number; max: number; note: string } | null;
  estimatedCompletionDate: string | null;
  classification: 'Standard' | 'Plus' | 'Prime' | null;
  mrtAnchor: string | null;
  amenityIds: string[];
  summary: string;
  sourceUrls: string[];
  checkedDate: string;
  dataNote: string;
}

export interface Amenity {
  id: string;
  name: string;
  type: AmenityCategory;
  position: [number, number] | null;
  sourceId: string;
  screeningNote: string;
}

export interface WorkHub {
  id: string;
  name: string;
  shortName: string;
  position: [number, number];
  source: string;
  travelTime: null;
}

export interface ExplorerAnswers {
  workHubIds: string[];
  maxBudget: number | null;
  flatType: FlatType | null;
  amenityCategories: AmenityCategory[];
  waitingBand: WaitingBand | null;
  customWorkplace: [number, number] | null;
}

export interface ProjectMatch {
  commute: MatchStatus;
  budget: MatchStatus;
  amenities: MatchStatus;
  waiting: MatchStatus;
  missCount: number;
}

export const FLAT_TYPES: FlatType[] = ['2-room Flexi', '2-room Flexi (Type 1)', '2-room Flexi (Type 2)', '3-room', '3Gen', '4-room', '5-room', 'Community Care Apartment (CCA)'];

export const MAX_AMENITY_PREFERENCES = 3;

export const WAITING_BANDS: Array<{ value: WaitingBand; label: string; description: string }> = [
  { value: 'soon', label: 'Sooner', description: 'Up to 36 months published wait' },
  { value: 'mid', label: 'Middle', description: '37–48 months published wait' },
  { value: 'later', label: 'Later is okay', description: '49 months or more' },
];

export const AMENITY_LABELS: Record<AmenityCategory, string> = {
  mrt: 'MRT stations',
  hawker: 'Hawker centres',
  shopping: 'Shopping',
  healthcare: 'Healthcare',
  schools: 'Schools',
  parks: 'Parks',
  sports: 'Sports',
};
