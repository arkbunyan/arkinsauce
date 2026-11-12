const audio = document.querySelector('#radio-audio');
const toggle = document.querySelector('#radio-toggle');
const stream = audio.getAttribute('src');
let playing = false;
let attempt = 0;

function update() {
  const label = `${playing ? 'Pause' : 'Play'} Poolsuite FM`;
  toggle.dataset.state = playing ? 'playing' : 'paused';
  toggle.setAttribute('aria-pressed', String(playing));
  toggle.setAttribute('aria-label', label);
  toggle.title = label;
}

function stop() {
  playing = false;
  attempt += 1;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  update();
}

toggle.addEventListener('click', async () => {
  if (playing) return stop();
  playing = true;
  const currentAttempt = ++attempt;
  audio.src = `${stream}?_t=${Date.now()}`;
  update();
  try {
    await audio.play();
  } catch {
    if (currentAttempt === attempt) stop();
  }
});

audio.addEventListener('pause', () => {
  if (playing && audio.paused) stop();
});
audio.addEventListener('error', stop);
audio.addEventListener('ended', stop);
window.addEventListener('pagehide', stop);
toggle.hidden = false;
