type coords = {
  x: number,
  y: number
}

function getDirectionTo(entityA: coords, entityB: coords) {
  if (entityA.x === entityB.x) {
    return entityA.y > entityB.y ? 'up-right' : 'down-left';
  }

  if (entityA.y === entityB.y) {
    return entityA.x > entityB.x ? 'up-left' : 'down-right';
  }
}

function _isAttackPossible(entityA: coords, entityB: coords) {
  if (entityA.x !== entityB.x && entityA.y !== entityB.y) {
    return false;
  }
  return true;
}

function getDistance(entityA: coords, entityB: coords) {
  return Math.abs(entityA.x - entityB.x) + Math.abs(entityA.y - entityB.y)
}

function isAttackInRange(entityA: coords, entityB: coords, attackRange: number) {
  if (_isAttackPossible(entityA, entityB)) {
    return getDistance(entityA, entityB) <= attackRange;
  }
  return false;
}

export function isAbleToAnimateAttack(entityA: coords, entityB: coords, range: number) {
  if (isAttackInRange(entityA, entityB, range)) {
    return getDirectionTo(entityA, entityB);
  } else {
    return '';
  }
}

export function manhattanDist(x1: number, y1: number, x2: number, y2: number) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

export function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}