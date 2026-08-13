const state = {
  view: 'landing',
  filterId: null,
  frameId: null,
  photos: [],
  timerSeconds: 3,
  captureMode: 'camera',
  busy: false
};

const el = {};

function $(id) {
  return document.getElementById(id);
}

function copy(key) {
  return copyByTheme[getTheme()][key];
}

function currentFilters() {
  return filtersByTheme[getTheme()];
}

function currentFrames() {
  return framesByTheme[getTheme()];
}

function activeFilter() {
  const list = currentFilters();
  return list.find(function (item) { return item.id === state.filterId; }) || list[0];
}

function activeFrame() {
  const list = currentFrames();
  return list.find(function (item) { return item.id === state.frameId; }) || list[0];
}

// teks per tema
function applyCopy() {
  document.querySelectorAll('[data-copy]').forEach(function (node) {
    node.textContent = copy(node.getAttribute('data-copy'));
  });
  document.querySelectorAll('[data-copy-html]').forEach(function (node) {
    node.innerHTML = copy(node.getAttribute('data-copy-html'));
  });
  el.heroTitle.innerHTML = copy('hero.title');
  el.heroTitleGhost.innerHTML = copy('hero.title');
}

// navigasi antar halaman
function go(view) {
  if (view === 'capture' && state.view !== 'capture') {
    state.view = view;
    showView(view);
    enterCapture();
    return;
  }
  if (state.view === 'capture' && view !== 'capture') {
    Camera.stop();
    stopCountdown();
  }
  state.view = view;
  showView(view);
  if (view === 'filter') renderFilters();
  if (view === 'result') renderResult();
  window.scrollTo(0, 0);
}

function showView(view) {
  document.querySelectorAll('.view').forEach(function (section) {
    section.classList.toggle('is-active', section.id === 'view-' + view);
  });
  document.body.setAttribute('data-view', view);
}

// contoh foto untuk kartu filter
function filterSample() {
  const photo = state.photos[0];
  if (!photo) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 260;
  canvas.height = Math.round(260 * photo.height / photo.width);
  canvas.getContext('2d').drawImage(photo, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

// grid filter
function renderFilters() {
  const list = currentFilters();
  if (!list.some(function (item) { return item.id === state.filterId; })) {
    state.filterId = list[0].id;
  }

  const sample = filterSample();

  el.filterGrid.innerHTML = '';
  list.forEach(function (filter) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card filter-card';
    card.classList.toggle('is-selected', filter.id === state.filterId);
    card.setAttribute('aria-pressed', String(filter.id === state.filterId));

    const preview = document.createElement('span');
    preview.className = 'filter-preview';

    const media = document.createElement('span');
    media.className = 'filter-preview-media';
    if (sample) media.style.backgroundImage = 'url(' + sample + ')';
    if (filter.cssFilter !== 'none') media.style.filter = filter.cssFilter;

    const check = document.createElement('span');
    check.className = 'card-check';
    check.textContent = '✓';

    const label = document.createElement('span');
    label.className = 'card-label';
    label.textContent = filter.name;

    preview.appendChild(media);
    preview.appendChild(check);
    card.appendChild(preview);
    card.appendChild(label);
    card.addEventListener('click', function () {
      state.filterId = filter.id;
      renderFilters();
    });

    el.filterGrid.appendChild(card);
  });

  el.filterNote.textContent = activeFilter().name + ' dipilih';
}

// grid frame
function renderFrames() {
  const list = currentFrames();
  if (!list.some(function (item) { return item.id === state.frameId; })) {
    state.frameId = list[0].id;
  }

  el.frameGrid.innerHTML = '';
  list.forEach(function (frame) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card frame-card';
    card.classList.toggle('is-selected', frame.id === state.frameId);
    card.setAttribute('aria-pressed', String(frame.id === state.frameId));

    const thumb = document.createElement('span');
    thumb.className = 'frame-thumb';

    const fill = document.createElement('span');
    fill.className = 'frame-thumb-fill';

    const image = document.createElement('img');
    image.src = frame.src;
    image.alt = '';
    image.loading = 'lazy';

    const check = document.createElement('span');
    check.className = 'card-check';
    check.textContent = '✓';

    const label = document.createElement('span');
    label.className = 'card-label';
    label.textContent = frame.name;

    thumb.appendChild(fill);
    thumb.appendChild(image);
    thumb.appendChild(check);
    card.appendChild(thumb);
    card.appendChild(label);
    card.addEventListener('click', function () {
      state.frameId = frame.id;
      renderFrames();
    });

    el.frameGrid.appendChild(card);
  });

  el.frameNote.textContent = activeFrame().name;
}

// halaman cara pakai, galeri frame, contoh, tentang
function renderHowto() {
  el.howtoSteps.innerHTML = '';
  howtoByTheme[getTheme()].forEach(function (step, index) {
    const item = document.createElement('li');
    item.className = 'step-card';

    const num = document.createElement('span');
    num.className = 'step-card-num';
    num.textContent = String(index + 1);

    const body = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = step.title;
    const text = document.createElement('p');
    text.textContent = step.text;

    body.appendChild(title);
    body.appendChild(text);
    item.appendChild(num);
    item.appendChild(body);
    el.howtoSteps.appendChild(item);
  });
}

function renderFrameGallery() {
  el.frameGallery.innerHTML = '';
  currentFrames().forEach(function (frame) {
    const card = document.createElement('figure');
    card.className = 'card frame-card';

    const thumb = document.createElement('span');
    thumb.className = 'frame-thumb';

    const fill = document.createElement('span');
    fill.className = 'frame-thumb-fill';

    const image = document.createElement('img');
    image.src = frame.src;
    image.alt = '';
    image.loading = 'lazy';

    const label = document.createElement('figcaption');
    label.className = 'card-label';
    label.textContent = frame.name;

    thumb.appendChild(fill);
    thumb.appendChild(image);
    card.appendChild(thumb);
    card.appendChild(label);
    el.frameGallery.appendChild(card);
  });
}

function renderExamples() {
  const list = examplesByTheme[getTheme()];

  el.exampleGallery.innerHTML = '';
  el.exampleGallery.hidden = !list.length;
  el.exampleEmpty.hidden = list.length > 0;

  list.forEach(function (example) {
    const card = document.createElement('figure');
    card.className = 'example-card';

    const shot = document.createElement('img');
    shot.src = example.src;
    shot.alt = 'Contoh strip ' + example.name;
    shot.loading = 'lazy';

    const caption = document.createElement('figcaption');
    const name = document.createElement('span');
    name.className = 'example-name';
    name.textContent = example.name;
    caption.appendChild(name);

    const detail = [example.frame, example.filter].filter(Boolean);
    if (detail.length) {
      const note = document.createElement('span');
      note.className = 'example-note';
      note.textContent = detail.join(' · ');
      caption.appendChild(note);
    }

    card.appendChild(shot);
    card.appendChild(caption);
    el.exampleGallery.appendChild(card);
  });
}

function renderAbout() {
  const about = aboutByTheme[getTheme()];

  el.aboutText.innerHTML = '';
  about.text.forEach(function (paragraph) {
    const node = document.createElement('p');
    node.textContent = paragraph;
    el.aboutText.appendChild(node);
  });

  el.aboutHighlights.innerHTML = '';
  about.cards.forEach(function (card) {
    const box = document.createElement('div');
    box.className = 'info-card';

    const title = document.createElement('h3');
    title.textContent = card.title;
    const text = document.createElement('p');
    text.textContent = card.text;

    box.appendChild(title);
    box.appendChild(text);
    el.aboutHighlights.appendChild(box);
  });
}

function renderHero() {
  const frames = currentFrames();
  el.heroFrame1.src = frames[0].src;
  el.heroFrame2.src = frames[1].src;
}

// halaman capture
function enterCapture() {
  setCaptureMode('camera');
  requestCamera();
}

function requestCamera() {
  el.stageHint.textContent = copy('capture.hint');
  Camera.start(el.camera)
    .then(function () {
      setCaptureMode('camera');
      el.stageHint.textContent = '';
    })
    .catch(function (error) {
      el.deniedSteps.textContent = describePermissionSteps();
      el.deniedText.textContent = error && error.message === 'unsupported'
        ? copy('denied.unsupported')
        : copy('denied.text');
      setCaptureMode('denied');
    });
}

function setCaptureMode(mode) {
  state.captureMode = mode;
  el.stage.hidden = mode !== 'camera';
  el.panelDenied.hidden = mode !== 'denied';
  el.panelUpload.hidden = mode !== 'upload';
  el.captureControls.hidden = mode !== 'camera';
  el.stripPanel.hidden = mode !== 'camera';
  el.captureBack.classList.toggle('is-close', mode === 'camera');
  el.deniedActions.hidden = mode !== 'denied';
  el.uploadActions.hidden = mode !== 'upload';
  updateCaptureUI();
}

function updateCaptureUI() {
  const taken = state.photos.length;
  const index = Math.min(taken + 1, PHOTO_COUNT);
  const full = taken >= PHOTO_COUNT;
  el.captureCount.textContent = state.captureMode === 'denied'
    ? copy('denied.head')
    : 'Foto ' + index + ' dari ' + PHOTO_COUNT;
  el.progress.hidden = state.captureMode === 'denied';

  el.progress.innerHTML = '';
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const bar = document.createElement('span');
    bar.className = 'progress-bar' + (i < taken ? ' is-filled' : '');
    el.progress.appendChild(bar);
  }

  renderThumbs(el.stageThumbs, 'stage-thumb');
  renderThumbs(el.stripPanelSlots, 'panel-slot');
  renderThumbs(el.uploadSlots, 'upload-slot');

  el.stripPanelNote.textContent = 'frame ' + activeFrame().name;
  el.timerBtn.textContent = state.timerSeconds ? state.timerSeconds + 's' : 'off';
  el.shutter.disabled = full;
  el.captureNext.hidden = !full || state.captureMode !== 'camera';
  syncRetakeBtn();
  el.uploadStatus.textContent = taken === 0
    ? 'Belum ada foto dipilih. Butuh ' + PHOTO_COUNT + ' foto.'
    : taken + ' dari ' + PHOTO_COUNT + ' foto siap.';
}

function renderThumbs(container, className) {
  container.innerHTML = '';
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const box = document.createElement('span');
    box.className = className;
    const photo = state.photos[i];
    if (photo) {
      const thumb = document.createElement('canvas');
      thumb.width = 130;
      thumb.height = 96;
      thumb.getContext('2d').drawImage(photo, 0, 0, thumb.width, thumb.height);
      box.classList.add('is-filled');
      box.appendChild(thumb);
    } else {
      box.textContent = String(i + 1);
    }
    container.appendChild(box);
  }
}

let countdownTimer = null;

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  el.countdown.hidden = true;
  state.busy = false;
  syncRetakeBtn();
}

function triggerShutter() {
  if (state.busy || state.photos.length >= PHOTO_COUNT) return;
  if (!state.timerSeconds) {
    takePhoto();
    return;
  }

  state.busy = true;
  syncRetakeBtn();
  let remaining = state.timerSeconds;
  el.countdown.hidden = false;
  el.countdownValue.textContent = String(remaining);

  countdownTimer = setInterval(function () {
    remaining -= 1;
    if (remaining <= 0) {
      stopCountdown();
      takePhoto();
      return;
    }
    el.countdownValue.textContent = String(remaining);
  }, 1000);
}

function takePhoto() {
  const photo = Camera.capture();
  if (!photo) {
    state.busy = false;
    return;
  }
  flash();
  addPhoto(photo);
}

function flash() {
  el.stageFlash.classList.remove('is-on');
  void el.stageFlash.offsetWidth;
  el.stageFlash.classList.add('is-on');
}

function addPhoto(canvas) {
  if (state.photos.length >= PHOTO_COUNT) return;
  state.photos.push(canvas);
  updateCaptureUI();
  state.busy = false;
}

function resetSession() {
  stopCountdown();
  state.photos = [];
  updateCaptureUI();
}

function syncRetakeBtn() {
  el.resetBtn.disabled = !state.photos.length && !state.busy;
}

function retakeLast() {
  if (state.busy) {
    stopCountdown();
    return;
  }
  if (!state.photos.length) return;
  state.photos.pop();
  updateCaptureUI();
}

// unggah foto dari galeri
function handleUpload(files) {
  const remaining = PHOTO_COUNT - state.photos.length;
  const list = Array.prototype.slice.call(files);

  if (!list.length) return;
  if (list.length > remaining) {
    el.uploadStatus.textContent = 'Kebanyakan. Sisa ' + remaining + ' foto lagi, kamu pilih ' + list.length + '.';
    return;
  }

  Promise.all(list.map(readImageFile))
    .then(function (canvases) {
      canvases.forEach(function (canvas) {
        if (state.photos.length < PHOTO_COUNT) state.photos.push(canvas);
      });
      updateCaptureUI();
      if (state.photos.length >= PHOTO_COUNT) {
        Camera.stop();
        go('filter');
      }
    })
    .catch(function () {
      el.uploadStatus.textContent = 'Ada file yang tidak bisa dibaca. Coba pilih foto lain.';
    });
}

// halaman hasil
function renderResult() {
  const frame = activeFrame();
  const filter = activeFilter();

  el.resultStatus.textContent = '';
  el.resultDetailText.textContent = PHOTO_COUNT + ' foto, filter ' + filter.name + ', frame ' + frame.name +
    '. Berkas PNG ' + CANVAS_SIZE.width + '×' + CANVAS_SIZE.height + ' langsung tersimpan di perangkat kamu.';

  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready
    .then(function () {
      return composeStrip(el.resultCanvas, state.photos, frame, filter.cssFilter);
    })
    .catch(function () {
      el.resultStatus.textContent = 'Frame gagal dimuat. Coba muat ulang halaman.';
    });
}

function downloadStrip() {
  const link = document.createElement('a');
  link.download = 'snapshoot-strip.png';
  link.href = el.resultCanvas.toDataURL('image/png');
  link.click();
  el.resultStatus.textContent = 'Strip tersimpan di perangkat kamu.';
}

function shareStrip() {
  el.resultCanvas.toBlob(function (blob) {
    if (!blob) return;

    try {
      const file = new File([blob], 'snapshoot-strip.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'Snapshoot', text: 'Strip foto dari Snapshoot' })
          .catch(function () {});
        return;
      }
    } catch (e) {}

    downloadStrip();
    el.resultStatus.textContent = 'Browser ini belum mendukung share langsung — strip sudah diunduh, tinggal bagikan manual.';
  }, 'image/png');
}

function cacheElements() {
  el.filterGrid = $('filter-grid');
  el.frameGrid = $('frame-grid');
  el.filterNote = $('filter-note');
  el.frameNote = $('frame-note');
  el.howtoSteps = $('howto-steps');
  el.frameGallery = $('frame-gallery');
  el.exampleGallery = $('example-gallery');
  el.exampleEmpty = $('example-empty');
  el.aboutText = $('about-text');
  el.aboutHighlights = $('about-highlights');
  el.heroFrame1 = $('hero-frame-1');
  el.heroFrame2 = $('hero-frame-2');
  el.heroTitle = document.querySelector('.hero-title-main');
  el.heroTitleGhost = document.querySelector('.hero-title-ghost');
  el.camera = $('camera');
  el.stage = $('capture-stage');
  el.stageHint = $('stage-hint');
  el.stageThumbs = $('stage-thumbs');
  el.stageFlash = $('stage-flash');
  el.countdown = $('countdown');
  el.countdownValue = el.countdown.querySelector('span');
  el.captureBack = $('capture-back');
  el.captureCount = $('capture-count');
  el.captureControls = $('capture-controls');
  el.progress = $('capture-progress');
  el.panelDenied = $('panel-denied');
  el.panelUpload = $('panel-upload');
  el.deniedText = $('denied-text');
  el.deniedSteps = $('denied-steps');
  el.deniedActions = $('denied-actions');
  el.uploadActions = $('upload-actions');
  el.uploadSlots = $('upload-slots');
  el.uploadStatus = $('upload-status');
  el.uploadInput = $('upload-input');
  el.stripPanel = $('strip-panel');
  el.stripPanelSlots = $('strip-panel-slots');
  el.stripPanelNote = $('strip-panel-note');
  el.timerBtn = $('timer-btn');
  el.resetBtn = $('reset-btn');
  el.shutter = $('shutter');
  el.captureNext = $('capture-next');
  el.resultCanvas = $('result-canvas');
  el.resultDetailText = $('result-detail-text');
  el.resultStatus = $('result-status');
}

function bindEvents() {
  document.querySelectorAll('[data-nav]').forEach(function (button) {
    button.addEventListener('click', function () {
      go(button.getAttribute('data-nav'));
    });
  });

  el.shutter.addEventListener('click', triggerShutter);
  el.resetBtn.addEventListener('click', retakeLast);
  $('retry-camera').addEventListener('click', requestCamera);
  $('open-upload').addEventListener('click', function () { setCaptureMode('upload'); });
  $('upload-back').addEventListener('click', requestCamera);
  $('download-btn').addEventListener('click', downloadStrip);
  $('share-btn').addEventListener('click', shareStrip);
  $('again-btn').addEventListener('click', function () {
    resetSession();
    go('landing');
  });

  el.timerBtn.addEventListener('click', function () {
    state.timerSeconds = state.timerSeconds === 3 ? 5 : state.timerSeconds === 5 ? 0 : 3;
    updateCaptureUI();
  });

  el.uploadInput.addEventListener('change', function () {
    handleUpload(el.uploadInput.files);
    el.uploadInput.value = '';
  });

  document.addEventListener('themechange', function () {
    state.filterId = null;
    state.frameId = null;
    state.photos = [];
    applyCopy();
    renderFilters();
    renderFrames();
    renderHero();
    renderHowto();
    renderFrameGallery();
    renderExamples();
    renderAbout();
    updateCaptureUI();
  });

  window.addEventListener('pagehide', function () { Camera.stop(); });
}

function init() {
  cacheElements();
  initTheme();
  bindEvents();
  applyCopy();
  renderFilters();
  renderFrames();
  renderHero();
  renderHowto();
  renderFrameGallery();
  renderExamples();
  renderAbout();
  updateCaptureUI();
  showView('landing');
}

init();
