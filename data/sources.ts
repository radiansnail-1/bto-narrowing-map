import snapshot from '@/data/official-data-snapshot.json';

export interface OfficialSource { id: string; agency: string; title: string; url: string; checkedDate: string; usage?: string }

export const officialSources: OfficialSource[] = snapshot.sources as OfficialSource[];
export const officialSourceById = new Map(officialSources.map((source) => [source.id, source]));
export const SNAPSHOT_DATE: string = snapshot.snapshotDate;
/** Date the snapshot was last audited against HDB/OneMap sources; individual records carry their own checkedDate. */
export const DATA_CHECKED_DATE: string = (snapshot as { lastAuditDate?: string }).lastAuditDate ?? snapshot.snapshotDate;
