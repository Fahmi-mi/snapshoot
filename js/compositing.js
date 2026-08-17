const supportsCanvasFilter = (function () {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.filter = 'grayscale(1)';
  return ctx.filter === 'grayscale(1)';
})();

const frameImageCache = {};

function loadFrameImage(src) {
  if (frameImageCache[src]) return frameImageCache[src];
  frameImageCache[src] = new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload = function () { resolve(image); };
    image.onerror = function () { reject(new Error('Gagal memuat frame: ' + src)); };
    image.src = src;
  });
  return frameImageCache[src];
}

function parseFilter(cssFilter) {
  const ops = [];
  if (!cssFilter || cssFilter === 'none') return ops;
  const pattern = /([a-z-]+)\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(cssFilter)) !== null) {
    ops.push({ name: match[1], value: parseFloat(match[2]) });
  }
  return ops;
}

function applyFilterFallback(ctx, width, height, cssFilter) {
  const ops = parseFilter(cssFilter);
  if (!ops.length) return;
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];

    for (let o = 0; o < ops.length; o++) {
      const op = ops[o];
      const v = op.value;
      let nr = r, ng = g, nb = b;

      if (op.name === 'grayscale') {
        const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        nr = r + (l - r) * v; ng = g + (l - g) * v; nb = b + (l - b) * v;
      } else if (op.name === 'sepia') {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb = 0.272 * r + 0.534 * g + 0.131 * b;
        nr = r + (sr - r) * v; ng = g + (sg - g) * v; nb = b + (sb - b) * v;
      } else if (op.name === 'saturate') {
        const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        nr = l + (r - l) * v; ng = l + (g - l) * v; nb = l + (b - l) * v;
      } else if (op.name === 'hue-rotate') {
        const a = v * Math.PI / 180;
        const c = Math.cos(a), s = Math.sin(a);
        nr = (0.213 + c * 0.787 - s * 0.213) * r + (0.715 - c * 0.715 - s * 0.715) * g + (0.072 - c * 0.072 + s * 0.928) * b;
        ng = (0.213 - c * 0.213 + s * 0.143) * r + (0.715 + c * 0.285 + s * 0.140) * g + (0.072 - c * 0.072 - s * 0.283) * b;
        nb = (0.213 - c * 0.213 - s * 0.787) * r + (0.715 - c * 0.715 + s * 0.715) * g + (0.072 + c * 0.928 + s * 0.072) * b;
      } else if (op.name === 'contrast') {
        nr = (r - 128) * v + 128; ng = (g - 128) * v + 128; nb = (b - 128) * v + 128;
      } else if (op.name === 'brightness') {
        nr = r * v; ng = g * v; nb = b * v;
      }

      r = nr; g = ng; b = nb;
    }

    data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }

  ctx.putImageData(image, 0, 0);
}

function drawFiltered(ctx, source, x, y, width, height, cssFilter) {
  const hasFilter = cssFilter && cssFilter !== 'none';

  if (!hasFilter || supportsCanvasFilter) {
    ctx.save();
    if (hasFilter) ctx.filter = cssFilter;
    ctx.drawImage(source, x, y, width, height);
    ctx.restore();
    return;
  }

  const buffer = document.createElement('canvas');
  buffer.width = width;
  buffer.height = height;
  const bufferCtx = buffer.getContext('2d');
  bufferCtx.drawImage(source, 0, 0, width, height);
  applyFilterFallback(bufferCtx, width, height, cssFilter);
  ctx.drawImage(buffer, x, y);
}

function drawCaption(ctx, caption) {
  if (!caption || !caption.text) return;
  const text = caption.text.replace('{date}', formatStripDate());

  ctx.save();
  ctx.font = caption.font;
  ctx.fillStyle = caption.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (caption.letterSpacing && 'letterSpacing' in ctx) {
    ctx.letterSpacing = caption.letterSpacing + 'px';
  }
  ctx.fillText(text, CANVAS_SIZE.width / 2, caption.y);
  ctx.restore();
}

function formatStripDate(date) {
  const now = date || new Date();
  const pad = function (value) { return String(value).padStart(2, '0'); };
  return pad(now.getDate()) + '.' + pad(now.getMonth() + 1) + '.' + String(now.getFullYear()).slice(-2);
}

function composeStrip(target, photos, frame, cssFilter) {
  const ctx = target.getContext('2d');
  target.width = CANVAS_SIZE.width;
  target.height = CANVAS_SIZE.height;
  ctx.clearRect(0, 0, target.width, target.height);

  PHOTO_SLOTS.forEach(function (slot, index) {
    const photo = photos[index];
    if (!photo) return;
    drawFiltered(ctx, photo, slot.x, slot.y, slot.width, slot.height, cssFilter);
  });

  return loadFrameImage(frame.src).then(function (image) {
    ctx.drawImage(image, 0, 0, target.width, target.height);
    drawCaption(ctx, frame.caption);
    return target;
  });
}

function cropToSlot(source, sourceWidth, sourceHeight, mirrored) {
  const slot = PHOTO_SLOTS[0];
  const canvas = document.createElement('canvas');
  canvas.width = slot.width;
  canvas.height = slot.height;
  const ctx = canvas.getContext('2d');

  const targetRatio = slot.width / slot.height;
  const sourceRatio = sourceWidth / sourceHeight;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio;
  } else {
    cropHeight = sourceWidth / targetRatio;
  }

  const cropX = (sourceWidth - cropWidth) / 2;
  const cropY = (sourceHeight - cropHeight) / 2;

  if (mirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
  return canvas;
}
