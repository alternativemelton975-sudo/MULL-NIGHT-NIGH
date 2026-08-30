const storyText = document.getElementById('storyText');
const objectiveEl = document.getElementById('objective');
const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const gate = document.getElementById('gate');
const messageOverlay = document.getElementById('messageOverlay');
const shardEls = Array.from(document.querySelectorAll('.moon-shard'));

const keys = { w: false, a: false, s: false, d: false };
const storyStages = [
  'Mull wakes beneath a broken moon and hears the old gate hum in the distance.',
  'Three moon shards are scattered through the ruins. Recover them before the sky goes dark.',
  'The gate opens only when the night remembers its light. Reach it once all shards are gathered.'
];

const playerState = {
  x: 54,
  y: 300,
  size: 28,
  speed: 190,
};

const gameState = {
  collected: 0,
  won: false,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateStory() {
  let storyLine = storyStages[0];
  if (gameState.won) {
    storyLine = 'Mull steps through the gate as the moon wakes. The night is no longer empty.';
  } else if (gameState.collected === shardEls.length) {
    storyLine = 'The shards glow in Mull\'s hands. The gate is opening. Run for the dawn door.';
  } else if (gameState.collected > 0) {
    storyLine = `Mull has recovered ${gameState.collected} of ${shardEls.length} moon shards. The valley is still waiting.`;
  }

  storyText.textContent = storyLine;
}

function updateObjective() {
  if (gameState.won) {
    objectiveEl.textContent = 'Objective complete: the moon has been restored.';
    return;
  }

  objectiveEl.textContent = `Objective: Collect moon shards (${gameState.collected}/${shardEls.length}) and reach the gate.`;
}

function showMessage(text) {
  messageOverlay.textContent = text;
  messageOverlay.classList.remove('hidden');
  clearTimeout(showMessage.timeoutId);
  showMessage.timeoutId = setTimeout(() => {
    messageOverlay.classList.add('hidden');
  }, 1400);
}

function overlaps(a, b) {
  const aLeft = a.left ?? a.x;
  const aTop = a.top ?? a.y;
  const aRight = a.right ?? aLeft + (a.width ?? a.size ?? 0);
  const aBottom = a.bottom ?? aTop + (a.height ?? a.size ?? 0);

  const bLeft = b.left ?? b.x;
  const bTop = b.top ?? b.y;
  const bRight = b.right ?? bLeft + (b.width ?? b.size ?? 0);
  const bBottom = b.bottom ?? bTop + (b.height ?? b.size ?? 0);

  return (
    aLeft < bRight &&
    aRight > bLeft &&
    aTop < bBottom &&
    aBottom > bTop
  );
}

function getBox(el) {
  const rect = el.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();
  return {
    left: rect.left - areaRect.left,
    top: rect.top - areaRect.top,
    right: rect.right - areaRect.left,
    bottom: rect.bottom - areaRect.top,
  };
}

function updatePlayer() {
  let moveX = 0;
  let moveY = 0;

  if (keys.d) moveX += 1;
  if (keys.a) moveX -= 1;
  if (keys.s) moveY += 1;
  if (keys.w) moveY -= 1;

  if (moveX !== 0 || moveY !== 0) {
    const length = Math.hypot(moveX, moveY) || 1;
    const stepX = (moveX / length) * playerState.speed * (1 / 60);
    const stepY = (moveY / length) * playerState.speed * (1 / 60);

    playerState.x = clamp(playerState.x + stepX, 0, gameArea.clientWidth - playerState.size);
    playerState.y = clamp(playerState.y + stepY, 0, gameArea.clientHeight - playerState.size);
  }

  player.style.left = `${playerState.x}px`;
  player.style.top = `${playerState.y}px`;
}

function collectShards() {
  shardEls.forEach((shard) => {
    if (shard.classList.contains('collected')) {
      return;
    }

    const shardBox = getBox(shard);
    const playerBox = {
      left: playerState.x,
      top: playerState.y,
      right: playerState.x + playerState.size,
      bottom: playerState.y + playerState.size,
    };

    if (overlaps(playerBox, shardBox)) {
      shard.classList.add('collected');
      gameState.collected += 1;
      updateStory();
      updateObjective();
      showMessage('Moon shard recovered');
    }
  });
}

function checkGate() {
  if (gameState.won) {
    return;
  }

  const gateBox = getBox(gate);
  const playerBox = {
    left: playerState.x,
    top: playerState.y,
    right: playerState.x + playerState.size,
    bottom: playerState.y + playerState.size,
  };

  if (gameState.collected === shardEls.length && overlaps(playerBox, gateBox)) {
    gameState.won = true;
    gate.classList.add('open');
    updateStory();
    updateObjective();
    showMessage('The moon wakes!');
  }

  if (gameState.collected === shardEls.length) {
    gate.classList.add('open');
  }
}

function handleKeyChange(event, isPressed) {
  const key = event.key.toLowerCase();
  if (key === 'w' || key === 'arrowup') keys.w = isPressed;
  if (key === 'a' || key === 'arrowleft') keys.a = isPressed;
  if (key === 's' || key === 'arrowdown') keys.s = isPressed;
  if (key === 'd' || key === 'arrowright') keys.d = isPressed;

  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    event.preventDefault();
  }
}

window.addEventListener('keydown', (event) => handleKeyChange(event, true));
window.addEventListener('keyup', (event) => handleKeyChange(event, false));

function animate() {
  updatePlayer();
  collectShards();
  checkGate();
  requestAnimationFrame(animate);
}

updateStory();
updateObjective();
requestAnimationFrame(animate);
