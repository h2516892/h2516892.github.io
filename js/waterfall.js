/**
 * WaterfallGallery - Solitude Theme
 * 写真相册瀑布流控制器
 * 依赖：纯 CSS columns 瀑布流，无需第三方库
 */

const WaterfallGallery = (() => {
  let _albums = [];
  let _currentAlbum = 'all';
  let _lightboxItems = [];
  let _lightboxIndex = 0;

  // ── 初始化 ──────────────────────────────────────
  function init(albums) {
    _albums = albums || [];
    _buildTabs();
    _renderGrid('all');
    _bindLightbox();
  }

  // ── Tab 导航 ──────────────────────────────────────
  function _buildTabs() {
    const container = document.getElementById('albumTabs');
    if (!container) return;

    // 清空，只保留"全部"按钮
    container.innerHTML = '<button class="album-tab active" data-album="all">全部</button>';

    _albums.forEach((album, i) => {
      const btn = document.createElement('button');
      btn.className = 'album-tab';
      btn.dataset.album = String(i);
      btn.textContent = album.name;
      container.appendChild(btn);
    });

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.album-tab');
      if (!btn) return;
      container.querySelectorAll('.album-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _currentAlbum = btn.dataset.album;
      _renderGrid(_currentAlbum);
    });
  }

  // ── 渲染瀑布流 ──────────────────────────────────────
  function _renderGrid(albumKey) {
    const grid = document.getElementById('waterfallGrid');
    if (!grid) return;

    // 收集要展示的图片
    let items = [];
    if (albumKey === 'all') {
      _albums.forEach((album, ai) => {
        album.photos.forEach((photo, pi) => {
          items.push({ ...photo, albumIndex: ai, photoIndex: pi, albumName: album.name });
        });
      });
    } else {
      const album = _albums[parseInt(albumKey)];
      if (album) {
        album.photos.forEach((photo, pi) => {
          items.push({ ...photo, albumIndex: parseInt(albumKey), photoIndex: pi, albumName: album.name });
        });
      }
    }

    _lightboxItems = items;

    // 淡出 → 更新 → 淡入
    grid.style.opacity = '0';
    grid.style.transition = 'opacity 0.25s ease';

    setTimeout(() => {
      if (items.length === 0) {
        grid.innerHTML = '<div class="wf-empty">暂无图片</div>';
      } else {
        grid.innerHTML = items.map((item, idx) => `
          <div class="wf-item loading" data-index="${idx}">
            <img
              src="${item.url}"
              alt="${item.alt || ''}"
              loading="lazy"
              onload="this.parentElement.classList.remove('loading');this.parentElement.classList.add('loaded');"
              onerror="this.parentElement.classList.remove('loading');"
            />
            <div class="wf-item-overlay">
              <span class="wf-item-caption">${item.alt || item.albumName || ''}</span>
            </div>
          </div>
        `).join('');

        // 绑定点击灯箱
        grid.querySelectorAll('.wf-item').forEach(el => {
          el.addEventListener('click', () => {
            _openLightbox(parseInt(el.dataset.index));
          });
        });
      }

      grid.style.opacity = '1';
    }, 250);
  }

  // ── 灯箱 ──────────────────────────────────────
  function _bindLightbox() {
    const lightbox = document.getElementById('wfLightbox');
    const mask = lightbox?.querySelector('.wf-lightbox-mask');
    const closeBtn = document.getElementById('wfLightboxClose');
    const prevBtn = document.getElementById('wfLightboxPrev');
    const nextBtn = document.getElementById('wfLightboxNext');

    if (!lightbox) return;

    mask?.addEventListener('click', _closeLightbox);
    closeBtn?.addEventListener('click', _closeLightbox);
    prevBtn?.addEventListener('click', () => _moveLightbox(-1));
    nextBtn?.addEventListener('click', () => _moveLightbox(1));

    // 键盘控制
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') _closeLightbox();
      if (e.key === 'ArrowLeft') _moveLightbox(-1);
      if (e.key === 'ArrowRight') _moveLightbox(1);
    });

    // 触摸滑动
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) _moveLightbox(dx < 0 ? 1 : -1);
    });
  }

  function _openLightbox(index) {
    _lightboxIndex = index;
    _updateLightboxImage();
    document.getElementById('wfLightbox')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function _closeLightbox() {
    document.getElementById('wfLightbox')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function _moveLightbox(dir) {
    const total = _lightboxItems.length;
    _lightboxIndex = (_lightboxIndex + dir + total) % total;
    _updateLightboxImage();
  }

  function _updateLightboxImage() {
    const img = document.getElementById('wfLightboxImg');
    const caption = document.getElementById('wfLightboxCaption');
    const item = _lightboxItems[_lightboxIndex];
    if (!item || !img) return;

    img.style.opacity = '0';
    img.src = item.url;
    img.alt = item.alt || '';
    img.onload = () => { img.style.opacity = '1'; };

    if (caption) {
      caption.textContent = item.alt
        ? `${item.alt}（${_lightboxIndex + 1} / ${_lightboxItems.length}）`
        : `${_lightboxIndex + 1} / ${_lightboxItems.length}`;
    }
  }

  return { init };
})();
