const Camera = {
  stream: null,
  video: null,

  isSupported: function () {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  start: function (videoElement) {
    this.video = videoElement;
    if (!this.isSupported()) {
      return Promise.reject(new Error('unsupported'));
    }
    if (this.stream) {
      videoElement.srcObject = this.stream;
      return Promise.resolve(this.stream);
    }

    const self = this;
    return navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then(function (stream) {
        self.stream = stream;
        videoElement.srcObject = stream;
        return videoElement.play().catch(function () {}).then(function () { return stream; });
      });
  },

  stop: function () {
    if (this.stream) {
      this.stream.getTracks().forEach(function (track) { track.stop(); });
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  },

  isActive: function () {
    return !!this.stream;
  },

  capture: function () {
    if (!this.video || !this.video.videoWidth) return null;
    return cropToSlot(this.video, this.video.videoWidth, this.video.videoHeight, true);
  }
};

function readImageFile(file) {
  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = function () {
      const canvas = cropToSlot(image, image.naturalWidth, image.naturalHeight, false);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    image.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal membaca file gambar'));
    };
    image.src = url;
  });
}

function describePermissionSteps() {
  const ua = navigator.userAgent;
  if (/Firefox/i.test(ua)) {
    return 'Klik ikon kamera yang dicoret di address bar → hapus blokir kamera untuk situs ini, lalu muat ulang halaman.';
  }
  if (/Safari/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)) {
    return 'Buka Pengaturan Safari untuk situs ini (menu aA atau Safari → Setelan Situs Web) → Kamera → Izinkan, lalu muat ulang halaman.';
  }
  return 'Ketuk ikon gembok di address bar → Izin situs → Kamera → Izinkan, lalu muat ulang halaman.';
}
