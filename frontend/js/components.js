function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function linkForProduct(productId, links) {
  return (links || []).find(l => l.product_id === productId) || null;
}

/* ---------- toast ---------- */
function toast(message, type = '') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = 'toast show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'toast ' + type; }, 2600);
}

/* ---------- modal ---------- */
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-content').innerHTML = '';
}

/* ---------- product drawer (slides in from the right) ---------- */
function openDrawer(html) {
  document.getElementById('drawer-content').innerHTML = html;
  document.getElementById('product-drawer').classList.add('open');
  document.getElementById('product-drawer').setAttribute('aria-hidden', 'false');
  document.getElementById('drawer-overlay').classList.add('open');
}
function closeDrawer() {
  document.getElementById('product-drawer').classList.remove('open');
  document.getElementById('product-drawer').setAttribute('aria-hidden', 'true');
  document.getElementById('drawer-overlay').classList.remove('open');
}

/* ---------- star rating  ---------- */
function starsDisplay(rating) {
  let html = '<span class="stars">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${rating >= i - 0.25 ? '' : 'dim'}">&#10022;</span>`;
  }
  return html + '</span>';
}

/* ---------- empty / loading ---------- */
function emptyBox(title, text) {
  return `<div class="empty">
    <div class="empty-mark">&#10022;</div>
    <h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
}
function loadingBox(text = 'Loading…') {
  return `<div class="loading">${esc(text)}</div>`;
}

/* ---------- category -> gradient + emoji thumb (fallback when a photo fails) ---------- */
function thumbStyle(category) {
  const map = {
    'Base':        { bg: 'linear-gradient(160deg,#f9e8ef,#f4d3c4)', emoji: '💄' },
    'Concealer':   { bg: 'linear-gradient(160deg,#ffe9ef,#ffd4e2)', emoji: '✨' },
    'Blush':       { bg: 'linear-gradient(160deg,#ffeaf1,#fcc9d7)', emoji: '🍑' },
    'Contour':     { bg: 'linear-gradient(160deg,#f5e0e5,#ecc4cc)', emoji: '🌂' },
    'Highlighter': { bg: 'linear-gradient(160deg,#fff8e1,#fde9c4)', emoji: '⭐' },
    'Lipstick':    { bg: 'linear-gradient(160deg,#fce8f0,#f2cdb8)', emoji: '💋' },
    'Eye Palette': { bg: 'linear-gradient(160deg,#f5e8f5,#e8c4e8)', emoji: '👁️' },
  };
  return map[category] || { bg: 'linear-gradient(160deg,var(--pink-100),var(--cream))', emoji: '✦' };
}
function thumbBox(category) {
  const t = thumbStyle(category);
  return `<div class="p-thumb" style="background:${t.bg};">
    <span style="font-size:2rem;">${t.emoji}</span>
  </div>`;
}

function buildMedia(product, vs) {
  const t = thumbStyle(product.category);
  const slides = [{
    src:      product.product_img || '',
    bg:       t.bg,
    fallback: t.emoji,
    label:    'Product',
  }];
  vs.forEach(v => slides.push({
    src:      v.product_variant_img || product.product_img || '',
    bg:       v.shade_hex || t.bg,
    fallback: t.emoji,
    label:    v.shade_name,
  }));
  return slides;
}

function carouselHTML(slides) {
  const slideEls = slides.map(s => `
    <div class="pp-slide" style="background:${esc(s.bg)};">
      <span class="pp-slide-fallback">${s.fallback || ''}</span>
      ${s.src
        ? `<img src="${esc(s.src)}" alt="${esc(s.label)}" loading="lazy"
                onerror="this.style.display='none';this.previousElementSibling.style.display='flex';">`
        : ''}
      <span class="pp-slide-cap">${esc(s.label)}</span>
    </div>`).join('');

  const dots = slides.map((_, i) =>
    `<span class="pp-cz-dot ${i === 0 ? 'active' : ''}" data-i="${i}"></span>`).join('');

  return `
    <div class="pp-carousel" data-count="${slides.length}">
      <div class="pp-carousel-viewport">
        <div class="pp-carousel-track">${slideEls}</div>
      </div>
      ${slides.length > 1 ? `
        <button class="pp-cz-arrow pp-cz-prev" type="button" aria-label="Previous photo">&#8249;</button>
        <button class="pp-cz-arrow pp-cz-next" type="button" aria-label="Next photo">&#8250;</button>
        <div class="pp-cz-bar" role="group" aria-label="Browse photos">${dots}</div>
      ` : ''}
    </div>`;
}

/* wire one carousel element, and exposes el._goTo(index) for hex swatches */
function mountCarousel(root) {
  const track  = root.querySelector('.pp-carousel-track');
  const slides = root.querySelectorAll('.pp-slide');
  const dots   = root.querySelectorAll('.pp-cz-dot');
  const vp     = root.querySelector('.pp-carousel-viewport');
  const count  = slides.length;
  let idx = 0;

  function go(i) {
    idx = Math.max(0, Math.min(count - 1, i));
    track.style.transform = `translateX(${-idx * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('active', k === idx));
  }
  root._goTo = go;

  const stop = e => e.stopPropagation();
  root.querySelector('.pp-cz-prev')?.addEventListener('click', e => { stop(e); go(idx - 1); });
  root.querySelector('.pp-cz-next')?.addEventListener('click', e => { stop(e); go(idx + 1); });
  dots.forEach(d => d.addEventListener('click', e => { stop(e); go(+d.dataset.i); }));

  /* swipe on the picture itself */
  let startX = null;
  vp.addEventListener('pointerdown', e => { startX = e.clientX; });
  vp.addEventListener('pointerup', e => {
    if (startX == null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 30) { stop(e); go(idx + (dx < 0 ? 1 : -1)); } // real swipe thus a tap still opens the drawer
  });

  /* press/drag across the dot bar picks the nearest slide */
  const bar = root.querySelector('.pp-cz-bar');
  if (bar && count > 1) {
    let dragging = false;
    const pickFrom = clientX => {
      const r = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      go(Math.round(ratio * (count - 1)));
    };
    bar.addEventListener('pointerdown', e => {
      dragging = true;
      try { bar.setPointerCapture(e.pointerId); } catch (_) {}
      stop(e); pickFrom(e.clientX);
    });
    bar.addEventListener('pointermove', e => { if (dragging) { stop(e); pickFrom(e.clientX); } });
    bar.addEventListener('pointerup',   e => { dragging = false; stop(e); });
    bar.addEventListener('pointercancel', () => { dragging = false; });
  }

  go(0);
}

function mountCarousels(scope) {
  if (!scope) return;
  scope.querySelectorAll('.pp-carousel').forEach(mountCarousel);
  scope.querySelectorAll('.swatch[data-idx]').forEach(sw => {
    sw.addEventListener('click', e => {
      e.stopPropagation();
      const host = sw.closest('[data-cz-host]');
      const cz = host && host.querySelector('.pp-carousel');
      if (cz && cz._goTo) cz._goTo(+sw.dataset.idx);
    });
  });
}

/* ---------- ONE PROFILE CHIP ---------- */
function profileChip(p, active) {
  return `<button class="profile-chip ${active ? 'active' : ''}"
                  data-profile="${p.profile_id}">${esc(p.profile_label)}</button>`;
}

/* ---------- BIG PROFILE DETAIL CARD ---------- */
function profileDetailCard(p) {
  const concerns = (p.primary_concern || '').split(',').filter(Boolean);
  return `
    <div class="profile-detail-card">
      <div class="profile-detail-header">
        <div>
          <p class="section-kicker">Active profile</p>
          <h3 class="profile-detail-title">${esc(p.profile_label)}</h3>
        </div>
        <div class="profile-detail-actions">
          <button class="btn btn-soft btn-sm" id="btn-edit-profile">Edit</button>
          <button class="btn btn-danger btn-sm" id="btn-delete-profile">Delete</button>
        </div>
      </div>
      <div class="profile-attrs-grid">
        <div class="profile-attr-box">
          <div class="profile-attr-label">Skintone</div>
          <div class="profile-attr-value">${esc(p.skintone)}</div>
        </div>
        <div class="profile-attr-box">
          <div class="profile-attr-label">Undertone</div>
          <div class="profile-attr-value">${esc(p.undertone)}</div>
        </div>
        <div class="profile-attr-box">
          <div class="profile-attr-label">Skin Type</div>
          <div class="profile-attr-value">${esc(p.skintype)}</div>
        </div>
        <div class="profile-attr-box">
          <div class="profile-attr-label">Preferred Finish</div>
          <div class="profile-attr-value">${esc(p.preferred_finish || '—')}</div>
        </div>
      </div>
      <div class="profile-detail-concerns">
        <p class="detail-section-label">Primary Concerns</p>
        ${concerns.length
          ? `<div class="p-tags">${concerns.map(c => `<span class="tag">${esc(c)}</span>`).join('')}</div>`
          : `<p class="detail-empty">None noted</p>`}
      </div>
    </div>`;
}

/* ---------- PROFILE FORM ---------- */
function profileFormHTML(existing) {
  const p = existing || {};
  const concerns = (p.primary_concern || '').split(',');
  const sel = (id, label, opts, val) => `
    <label class="field">
      <span class="field-label">${label}</span>
      <select id="${id}">
        <option value="">Select&hellip;</option>
        ${opts.map(o => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('')}
      </select>
    </label>`;
  return `
    <h3 class="modal-title">${p.profile_id ? 'Edit' : 'New'} Skin Profile</h3>
    <label class="field">
      <span class="field-label">Profile Label</span>
      <input type="text" id="pf-label" value="${esc(p.profile_label || '')}"
             placeholder="e.g. Everyday Look, Glam Night" />
    </label>
    <div class="field-row">
      ${sel('pf-skintone',  'Skintone',  ENUMS.skintone,  p.skintone)}
      ${sel('pf-undertone', 'Undertone', ENUMS.undertone, p.undertone)}
    </div>
    <div class="field-row">
      ${sel('pf-skintype', 'Skin Type',        ENUMS.skintype, p.skintype)}
      ${sel('pf-finish',   'Preferred Finish', ENUMS.finish,   p.preferred_finish)}
    </div>
    <label class="field">
      <span class="field-label">Primary Concerns</span>
      <div class="check-group" id="pf-concerns">
        ${ENUMS.primary_concern.map(c => `
          <label class="check-pill">
            <input type="checkbox" value="${c}" ${concerns.includes(c) ? 'checked' : ''} />
            <span>${c}</span>
          </label>`).join('')}
      </div>
    </label>
    <p id="pf-error" class="form-error"></p>
    <button class="btn btn-primary btn-block" id="btn-save-profile">
      ${p.profile_id ? 'Save Changes' : 'Create Profile'}
    </button>`;
}

/* ---------- BROWSE PRODUCTS SECTION SHELL ----------*/
function productsSectionHTML() {
  const cats = ['Base', 'Concealer', 'Blush', 'Contour', 'Highlighter', 'Lipstick', 'Eye Palette'];
  return `
    <div class="pp-search-row">
      <div class="pp-search">
        <svg class="pp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" class="pp-search-input"
               placeholder="Search by product or brand&hellip;" aria-label="Search products" />
      </div>
      <button class="btn btn-primary pp-browse-btn">Browse Products</button>
    </div>
    <div class="filter-block">
      <p class="filter-block-label">Shop by category</p>
      <div class="filter-chips pp-cat-chips">
        <button class="filter-chip active" data-cat="">All</button>
        ${cats.map(c => `<button class="filter-chip" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
    </div>
    <div class="filter-block">
      <p class="filter-block-label">Shop by brand</p>
      <div class="filter-chips pp-brand-chips">
        <div class="loading">Loading brands&hellip;</div>
      </div>
    </div>
    <div class="card-grid pp-grid">
      <div class="loading">Loading products&hellip;</div>
    </div>
    <div class="products-more pp-more"></div>`;
}

/* small reusable shop-button block */
function shopButton(product, links, opts = {}) {
  const link = linkForProduct(product.product_id, links);
  if (opts.block) {
    return link
      ? `<a class="btn btn-primary btn-block" href="${esc(link.affiliate_url)}"
            target="_blank" rel="noopener"
            data-link="${esc(link.link_id)}" style="margin-bottom:18px">Shop on TikTok &nearr;</a>`
      : `<p class="link-unavailable" style="margin-bottom:18px">Link is not available.</p>`;
  }
  return link
    ? `<a class="btn btn-soft btn-sm p-shop" href="${esc(link.affiliate_url)}"
          target="_blank" rel="noopener" onclick="event.stopPropagation()"
          data-link="${esc(link.link_id)}">Shop</a>`
    : `<p class="link-unavailable p-shop">Link is not available.</p>`;
}

/* ---------- ONE PRODUCT CARD ---------- */
function productCard(product, variants, links) {
  const vs = variants.filter(v => v.product_id === product.product_id);
  // swatches carry data-idx -> slide index (slide 0 is the product photo)
  const swatches = vs.slice(0, 6).map((v, i) =>
    `<span class="swatch" style="background:${esc(v.shade_hex || '#eee')}"
           title="View ${esc(v.shade_name)}" data-idx="${i + 1}"></span>`).join('');

  return `
    <div class="p-card" data-product="${esc(product.product_id)}" data-cz-host>
      ${carouselHTML(buildMedia(product, vs))}
      <div class="p-body">
        <div class="p-brand">${esc(product.brand_name)}</div>
        <div class="p-name">${esc(product.product_name)}</div>
        <div class="p-meta">${esc(product.category)} &middot; ${esc(product.formula_type || '—')}</div>
        <div class="p-tags">
          <span class="tag tag-accent">${esc(product.finish || 'Finish n/a')}</span>
          <span class="tag">${vs.length} shade${vs.length === 1 ? '' : 's'}</span>
        </div>
        <div class="swatch-row">${swatches}</div>
        ${shopButton(product, links)}
      </div>
    </div>`;
}

/* ---------- ONE RECOMMENDATION CARD ---------- */
function recommendationCard(rec, rank, links) {
  const t = thumbStyle(rec.category);
  const src = rec.product_variant_img || rec.product_img || '';
  const bg  = rec.shade_hex || t.bg;
  const media = `
    <div class="p-thumb pp-rec-thumb" style="background:${esc(bg)};">
      <span class="pp-slide-fallback" ${src ? 'style="display:none"' : ''}>${t.emoji}</span>
      ${src ? `<img src="${esc(src)}" alt="${esc(rec.shade_name || '')}" loading="lazy"
                    onerror="this.style.display='none';this.previousElementSibling.style.display='flex';">` : ''}
    </div>`;
  return `
    <div class="p-card" data-product="${esc(rec.product_id)}">
      <span class="rank-badge">${rank}</span>
      ${media}
      <div class="p-body">
        <div class="p-brand">${esc(rec.brand_name)}</div>
        <div class="p-name">${esc(rec.product_name)}</div>
        <div class="swatch-row" style="margin:6px 0 10px">
          <span class="swatch swatch-lg" style="background:${esc(rec.shade_hex || '#eee')}"></span>
          <div>
            <div style="color:var(--charcoal);font-size:.95rem;">${esc(rec.shade_name)}</div>
            <div style="font-size:.82rem;color:var(--charcoal-soft);">
              Best for ${esc(rec.recommended_undertone || 'any')} undertone</div>
          </div>
        </div>
        <div class="match-label">
          ${Number(rec.avg_rating) > 0
            ? starsDisplay(Number(rec.avg_rating)) + ' &nbsp;' +
              Number(rec.avg_rating).toFixed(1) + ' (' + rec.review_count + ')'
            : '<span style="color:var(--charcoal-faint);font-size:.85rem;">No reviews yet</span>'}
        </div>
        ${shopButton(rec, links)}
      </div>
    </div>`;
}

/* ---------- DRAWER CONTENT for one product ---------- */
function drawerContent(product, variants, reviews, userNames, links) {
  const vs  = variants.filter(v => v.product_id === product.product_id);
  const vIds = new Set(vs.map(v => v.variant_id));
  const rs  = reviews.filter(r => vIds.has(r.variant_id));
  const avg = rs.length
    ? (rs.reduce((s, r) => s + Number(r.rating), 0) / rs.length).toFixed(1)
    : null;

  return `
    <div data-cz-host>
      <div class="drawer-media">${carouselHTML(buildMedia(product, vs))}</div>
      <div class="drawer-body">
        <div class="detail-brand">${esc(product.brand_name)}</div>
        <div class="detail-name">${esc(product.product_name)}</div>
        <div class="p-tags" style="margin-bottom:16px">
          <span class="tag tag-accent">${esc(product.category)}</span>
          <span class="tag">${esc(product.formula_type || 'Formula n/a')}</span>
          <span class="tag">${esc(product.finish || 'Finish n/a')}</span>
        </div>

        ${shopButton(product, links, { block: true })}

        <p class="detail-desc">${esc(product.description || 'No description provided.')}</p>

        <p class="detail-section-label">Shades (${vs.length}) &middot; tap a swatch to preview</p>
        <div class="detail-shades">
          ${vs.length ? vs.map((v, i) => `
            <div class="detail-shade-row">
              <span class="swatch" style="background:${esc(v.shade_hex || '#eee')}"
                    title="View ${esc(v.shade_name)}" data-idx="${i + 1}"></span>
              <span style="color:var(--charcoal)">${esc(v.shade_name)}</span>
              <span style="margin-left:auto;font-size:.82rem;color:var(--charcoal-soft)">
                ${esc(v.recommended_undertone || '')}</span>
            </div>`).join('')
            : `<div class="detail-empty">No shades listed.</div>`}
        </div>

        <p class="detail-section-label">
          Reviews ${avg ? '&middot; ' + avg + ' avg' : ''}
        </p>
        ${rs.length ? rs.map(r => `
          <div class="mini-review">
            <div class="mini-review-top">
              <span class="mini-review-author">${esc(userNames[r.user_id] || 'A Prism user')}</span>
              ${starsDisplay(r.rating)}
            </div>
            <div class="mini-review-text">${esc(r.comment || '—')}</div>
            <div class="mini-review-date">${esc((r.created_at || '').slice(0, 10))}</div>
          </div>`).join('')
          : `<div class="detail-empty">No reviews yet.</div>`}
      ${App.user ? `
          <button class="btn btn-soft btn-sm" id="drawer-add-review" style="margin-top:14px">
              + Add a Review
          </button>
          <div id="drawer-review-form" class="hidden" style="margin-top:16px">
              <label class="field">
              <span class="field-label">Your rating</span>
              <div class="star-input" id="dr-stars">
                  <span data-v="1">&#10022;</span><span data-v="2">&#10022;</span>
                  <span data-v="3">&#10022;</span><span data-v="4">&#10022;</span>
                  <span data-v="5">&#10022;</span>
              </div>
              </label>
              <label class="field">
              <span class="field-label">Shade</span>
              <select id="dr-variant">
                  ${vs.map(v => `<option value="${v.variant_id}">${esc(v.shade_name)}</option>`).join('')}
              </select>
              </label>
              <label class="field">
              <span class="field-label">Comment</span>
              <textarea id="dr-comment" placeholder="How did it wear?"></textarea>
              </label>
              <label class="check-pill" style="margin-bottom:12px">
              <input type="checkbox" id="dr-match" /><span>It matched my skin</span>
              </label>
              <p id="dr-error" class="form-error"></p>
              <button class="btn btn-primary btn-sm" id="dr-submit-review">Post Review</button>
          </div>` : ''}
      </div>
    </div>`;
}