function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

/* ---------- category → gradient + emoji thumb (until real photos) ---------- */
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

/* ---------- ONE PRODUCT CARD ---------- */
function productCard(product, variants) {
  const vs = variants.filter(v => v.product_id === product.product_id);
  const swatches = vs.slice(0, 6).map(v =>
    `<span class="swatch" style="background:${esc(v.shade_hex || '#eee')}"
           title="${esc(v.shade_name)}"></span>`).join('');
  return `
    <div class="p-card" data-product="${product.product_id}">
      ${product.image_url
        ? `<img class="p-thumb" style="object-fit:cover" src="${esc(product.image_url)}" alt="">`
        : thumbBox(product.category)}
      <div class="p-body">
        <div class="p-brand">${esc(product.brand_name)}</div>
        <div class="p-name">${esc(product.product_name)}</div>
        <div class="p-meta">${esc(product.category)} &middot; ${esc(product.formula_type || '—')}</div>
        <div class="p-tags">
          <span class="tag tag-accent">${esc(product.finish || 'Finish n/a')}</span>
          <span class="tag">${vs.length} shade${vs.length === 1 ? '' : 's'}</span>
        </div>
        <div class="swatch-row">${swatches}</div>
      </div>
    </div>`;
}

/* ---------- ONE RECOMMENDATION CARD ---------- */
function recommendationCard(rec, rank) {
  const t = thumbStyle(rec.category);
  return `
    <div class="p-card" data-product="${rec.product_id}">
      <span class="rank-badge">${rank}</span>
      <div class="p-thumb" style="background:${t.bg};">
        <span style="font-size:2rem;">${t.emoji}</span>
      </div>
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
      </div>
    </div>`;
}

/* ---------- DRAWER CONTENT for one product ---------- */
function drawerContent(product, variants, reviews, userNames) {
  const vs  = variants.filter(v => v.product_id === product.product_id);
  const rs  = reviews.filter(r => r.product_id === product.product_id);
  const avg = rs.length
    ? (rs.reduce((s, r) => s + Number(r.rating), 0) / rs.length).toFixed(1)
    : null;
  const t = thumbStyle(product.category);

  return `
    ${product.image_url
      ? `<img class="drawer-thumb" src="${esc(product.image_url)}" alt="">`
      : `<div class="drawer-thumb" style="background:${t.bg};">
           <span style="font-size:4rem;">${t.emoji}</span>
         </div>`}
    <div class="drawer-body">
      <div class="detail-brand">${esc(product.brand_name)}</div>
      <div class="detail-name">${esc(product.product_name)}</div>
      <div class="p-tags" style="margin-bottom:16px">
        <span class="tag tag-accent">${esc(product.category)}</span>
        <span class="tag">${esc(product.formula_type || 'Formula n/a')}</span>
        <span class="tag">${esc(product.finish || 'Finish n/a')}</span>
      </div>
      <p class="detail-desc">${esc(product.description || 'No description provided.')}</p>

      <p class="detail-section-label">Shades (${vs.length})</p>
      <div class="detail-shades">
        ${vs.length ? vs.map(v => `
          <div class="detail-shade-row">
            <span class="swatch" style="background:${esc(v.shade_hex || '#eee')}"></span>
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
    </div>`;
}