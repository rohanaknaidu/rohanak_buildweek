import { getReleasedDrops } from "../content/registry";

export function getDefaultPlayableDrop(now = Date.now()) {
  const releasedDrops = getReleasedDrops(now);

  if (releasedDrops.length === 0) {
    return undefined;
  }

  return releasedDrops.reduce((selectedDrop, candidateDrop) =>
    candidateDrop.releaseOrder > selectedDrop.releaseOrder
      ? candidateDrop
      : selectedDrop,
  );
}
