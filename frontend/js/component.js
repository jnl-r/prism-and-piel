const Components = {
  // ── Product thumbnail || Emoji for temporary placeholders
  _thumbStyle(category) {
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
  },
 
  // ── Product Card 
  productCard(product, rank = null) {
    const thumb = Components._thumbStyle(product.category);
    return `
      <div class="p-card" data-product-id="${product.product_id}">
        ${rank ? `<div class="rank-badge">${rank}</div>` : ''}
        <div class="p-thumb" style="background:${thumb.bg};">
          <span style="font-size:1.8rem;">${thumb.emoji}</span>
        </div>
        <div class="p-body">
          <p class="p-brand">${product.brand_name}</p>
          <h3 class="p-name">${product.product_name}</h3>
          <p class="p-meta">${product.formula_type || ''}</p>
          <div class="p-tags">
            ${product.finish ? `<span class="tag">${product.finish}</span>` : ''}
            <span class="tag tag-accent">${product.category}</span>
          </div>
          ${product.match_score != null ? `
            <div class="match-bar">
              <div class="match-fill" style="width:${product.match_score}%"></div>
            </div>
            <p class="match-label">${product.match_score}% match</p>` : ''}
        </div>
      </div>`;
  },
 
  // ── Profile Card 
  profileCard(profile) {
    const concerns = profile.primary_concern ? profile.primary_concern.split(',') : [];
    return `
      <div class="profile-card">
        <div class="profile-top">
          <span class="profile-label">${profile.profile_label}</span>
          <button class="btn btn-danger btn-sm" data-delete="${profile.profile_id}">Remove</button>
        </div>
        <div class="profile-attrs">
          <span class="attr"><b>${profile.skintone}</b></span>
          <span class="attr"><b>${profile.undertone}</b> undertone</span>
          <span class="attr">${profile.skintype}</span>
          ${profile.preferred_finish ? `<span class="attr">${profile.preferred_finish} finish</span>` : ''}
          ${concerns.map(c => `<span class="attr">${c.trim()}</span>`).join('')}
        </div>
      </div>`;
  },
 
  // ── Detail Panel 
  detailPanel(product, reviews = []) {
    const thumb = Components._thumbStyle(product.category);
    return `
      <div class="detail-thumb" style="background:${thumb.bg};">
        <span style="font-size:3rem;">${thumb.emoji}</span>
      </div>
      <div class="detail-body">
        <p class="detail-brand">${product.brand_name}</p>
        <h2 class="detail-name">${product.product_name}</h2>
        <p class="detail-desc">${product.description}</p>
 
        <p class="detail-section-label">Shades</p>
        <div class="detail-shades">
          ${product.variants?.length
            ? product.variants.map(v => `
                <div class="detail-shade-row">
                  <div class="swatch" style="background:${v.shade_hex || '#ccc'}"></div>
                  <span>${v.shade_name}</span>
                  ${v.recommended_undertone ? `<span class="tag">${v.recommended_undertone}</span>` : ''}
                </div>`).join('')
            : `<p class="detail-empty">No shades listed yet.</p>`}
        </div>
 
        <p class="detail-section-label">Reviews</p>
        ${reviews.length
          ? reviews.map(r => Components.miniReview(r)).join('')
          : `<p class="detail-empty">No reviews yet — be the first!</p>`}
      </div>`;
  },
 
  // ── Mini Review 
  miniReview(review) {
    const stars = Components.stars(review.rating);
    return `
      <div class="mini-review">
        <div class="mini-review-top">
          <span class="mini-review-author">${review.user_name || 'Anonymous'}</span>
          <span class="stars">${stars}</span>
        </div>
        <p class="mini-review-text">${review.comment || ''}</p>
        <p class="mini-review-date">${new Date(review.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
      </div>`;
  },
 
  // ── Stars 
  stars(rating) {
    const full = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) =>
      `<span class="${i < full ? '' : 'dim'}">★</span>`
    ).join('');
  },
 
  // ── Detail Placeholder 
  detailPlaceholder() {
    return `
      <div class="detail-placeholder">
        <div class="empty-mark">✦</div>
        <h3>Select a product</h3>
        <p>Tap any card to see shades and reviews.</p>
      </div>`;
  },
 
  // ── Empty State 
  empty(title, subtitle) {
    return `
      <div class="empty">
        <div class="empty-mark">✦</div>
        <h3>${title}</h3>
        <p>${subtitle}</p>
      </div>`;
  },
};