import { getReleasedDrops } from "../content/registry";

export function getDefaultPlayableDrop(now = Date.now()) {
  const liveDrops = getReleasedDrops(now);

  if (liveDrops.length === 0) {
    return undefined;
  }

  // M3.0 temporary policy: direct Home uses the highest releaseOrder LIVE Drop.
  // This is not the long-term returning-player or Journey 3 selection rule.
  return liveDrops.reduce((selectedDrop, candidateDrop) =>
    candidateDrop.releaseOrder > selectedDrop.releaseOrder
      ? candidateDrop
      : selectedDrop,
  );
}
