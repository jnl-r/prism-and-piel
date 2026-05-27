/* escape text so user/database content can't break the HTML */
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- toast notification ---------- 
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

// ---------- star rating (display only) ---------- 
function starsDisplay(rating) {
  let html = '<span class="stars">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${rating >= i - 0.25 ? '' : 'dim'}">&#10022;</span>`;
  }
  return html + '</span>';
}

// ---------- placeholder image box (gray, until real photos) ---------- 
function thumbBox(label = 'Product Photo') {
  return `<div class="p-thumb">${esc(label)}</div>`;
}

// ---------- one product card (used in Products + Home) ---------- 
function productCard(product, variants) {
  const vs = variants.filter(v => v.product_id === product.product_id);
  const swatches = vs.slice(0, 6).map(v =>
    `<span class="swatch" style="background:${esc(v.shade_hex || '#eee')}"
           title="${esc(v.shade_name)}"></span>`).join('');
  return `
    <div class="p-card" data-product="${product.product_id}">
      ${product.image_url
        ? `<img class="p-thumb" style="object-fit:cover" src="${esc(product.image_url)}" alt="">`
        : thumbBox('Product Photo')}
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

// ---------- one recommendation card (Recommend + Home) ---------- 
function recommendationCard(rec, rank) {
  return `
    <div class="p-card" data-product="${rec.product_id}">
      <span class="rank-badge">${rank}</span>
      ${thumbBox('Shade Photo')}
      <div class="p-body">
        <div class="p-brand">${esc(rec.brand_name)}</div>
        <div class="p-name">${esc(rec.product_name)}</div>
        <div class="swatch-row" style="margin:6px 0 10px">
          <span class="swatch swatch-lg" style="background:${esc(rec.shade_hex || '#eee')}"></span>
          <div>
            <div style="color:var(--charcoal)">${esc(rec.shade_name)}</div>
            <div style="font-size:.85rem;color:var(--charcoal-soft)">
              Best for ${esc(rec.recommended_undertone || 'any')} undertone</div>
          </div>
        </div>
        <div class="match-label">
          ${Number(rec.avg_rating) > 0
            ? starsDisplay(Number(rec.avg_rating)) + ' &nbsp;' +
              Number(rec.avg_rating).toFixed(1) + ' (' + rec.review_count + ')'
            : 'No reviews yet'}
        </div>
      </div>
    </div>`;
}

// ---------- side detail panel content for one product ---------- 
function detailPanel(product, variants, reviews, userNames) {
  const vs = variants.filter(v => v.product_id === product.product_id);
  const rs = reviews.filter(r => r.product_id === product.product_id);
  const avg = rs.length
    ? (rs.reduce((s, r) => s + Number(r.rating), 0) / rs.length).toFixed(1)
    : null;

  return `
    ${product.image_url
      ? `<img class="detail-thumb" style="object-fit:cover" src="${esc(product.image_url)}" alt="">`
      : `<div class="detail-thumb">Product Photo</div>`}
    <div class="detail-body">
      <div class="detail-brand">${esc(product.brand_name)}</div>
      <div class="detail-name">${esc(product.product_name)}</div>
      <div class="p-tags" style="margin-bottom:14px">
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
            <span style="margin-left:auto;font-size:.85rem;color:var(--charcoal-soft)">
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

// ---------- empty / loading helpers ---------- 
function emptyBox(title, text) {
  return `<div class="empty">
    <div class="empty-mark">&#10022;</div>
    <h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
}
function loadingBox(text = 'Loading…') {
  return `<div class="loading">${esc(text)}</div>`;
}