type coords  = {
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

function isAttackPossible(entityA: coords, entityB: coords) {
  if (entityA.x !== entityB.x && entityA.y !== entityB.y) {
  return false;
  }
  return true;
}

function getDistance(entityA: coords, entityB: coords) {
  return Math.abs(entityA.x - entityB.x) + Math.abs(entityA.y - entityB.y)
}

function isAttackInRange(entityA: coords, entityB: coords, attackRange: number) {
  if (isAttackPossible(entityA, entityB)) {
    return getDistance(entityA, entityB) <= attackRange;
  }
  return false;  
}

function attack(entityA: coords, entityB: coords, range: number) {
  if (isAttackInRange(entityA, entityB, range)) {
  return getDirectionTo(entityA, entityB);
  } else {
  return '';
  }
}

export default attack;