function positionInRange(position, [start, end]) {
  return position >= start && position <= end;
};

/**
 * this methods checks if rangeA fully or partially contained in B
 */
function rangeAStartsOrEndsinB(rangeA, rangeB) {
  const [start, end] = rangeA;
  return positionInRange(start, rangeB) || positionInRange(end, rangeB);
}

function isLeftAdjacentRange([neighbourStart, neighbourEnd], [start, end]) {
  return neighbourEnd == start;
}

function isRightAdjacentRange([neighbourStart, neighbourEnd], [start, end]) {
  return neighbourStart == end;
}

function isAdjacentRange(neighbour, region) {
  return isLeftAdjacentRange(neighbour, region) || isRightAdjacentRange(neighbour, region);
};

function isEmptyRange([start, end]) {
  return end - start <= 0;
}

function isEqualRange([startA, endA], [startB, endB]) {
  return startA == startB && endA == endB;
}

export {
  positionInRange,
  isLeftAdjacentRange,
  isRightAdjacentRange,
  isAdjacentRange,
  isEmptyRange,
  isEqualRange,
  rangeAStartsOrEndsinB
}
