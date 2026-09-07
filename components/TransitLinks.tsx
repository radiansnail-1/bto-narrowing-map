'use client';

import { useId, useState } from 'react';
import { workHubs } from '@/data/work-hubs';
import { googleTransitUrl, sceneToTransitCoordinates } from '@/lib/transit';
import type { BtoProject, ExplorerAnswers } from '@/lib/types';

export function TransitLinks({ project, answers }: { project: BtoProject; answers: ExplorerAnswers }) {
  const selectId = useId();
  const [fallbackHubId, setFallbackHubId] = useState(workHubs[0]?.id ?? '');
  const origin = sceneToTransitCoordinates(project.position);
  const selectedHubs = workHubs.filter((hub) => answers.workHubIds.includes(hub.id));
  const needsPicker = !answers.customWorkplace && selectedHubs.length === 0;
  const destinations = answers.customWorkplace
    ? [{ id: 'custom', name: 'Custom workplace (approximate pin)', position: answers.customWorkplace }]
    : needsPicker ? workHubs.filter((hub) => hub.id === fallbackHubId) : selectedHubs;

  return <section className="transit-links" aria-label="Check transit routes">
    <h3>Check transit routes</h3>
    {!origin ? <p className="inline-note">A project location has not been published, so a transit route cannot be opened yet.</p> : <>
      {needsPicker && <div className="transit-destination-picker">
        <label htmlFor={selectId}>Destination</label>
        <select id={selectId} value={fallbackHubId} onChange={(event) => setFallbackHubId(event.target.value)}>
          {workHubs.map((hub) => <option key={hub.id} value={hub.id}>{hub.name}</option>)}
        </select>
      </div>}
      <div className="transit-route-links">{destinations.map((destination) => {
        const href = googleTransitUrl(origin, sceneToTransitCoordinates(destination.position));
        return href ? <a key={destination.id} href={href} target="_blank" rel="noopener noreferrer">Transit to {destination.name} ↗<span className="sr-only"> — opens Google Maps in a new tab</span></a>
          : <p key={destination.id} className="inline-note">This destination has no valid location for routing.</p>;
      })}</div>
      <p className="inline-note">Google Maps opens with transit directions. Choose your departure time there; journey estimates depend on the time and current services. Project and hub pins are approximate anchors, not confirmed entrances or your exact workplace.</p>
    </>}
    <p className="inline-note">The 5 km filter remains a straight-line screen, not a travel-time ranking. Today’s routes may change before your BTO is ready.</p>
  </section>;
}
