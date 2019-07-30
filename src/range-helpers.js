function positionInRange(position, [start, end]) {
  return position >= start && position <= end;
};

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

export {
  positionInRange,
  isLeftAdjacentRange,
  isRightAdjacentRange,
  isAdjacentRange,
  isEmptyRange
}
