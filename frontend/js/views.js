const Views = {
  // small shared cache, filled on login 
  cache: { users: {}, products: [], variants: [], reviews: [] },

  /* ============================================================
     HOME
     ============================================================ */
  async home() {
    const nameEl = document.getElementById('welcome-name');
    if (nameEl && App.user) nameEl.textContent = App.user.name.split(' ')[0];

    const grid  = document.getElementById('home-recs-grid');
    const panel = document.getElementById('home-detail-panel');

    try {
      await Views._ensureCatalogue();

      // get the user's first profile, then ask backend for matches
      const profiles = await api.getProfiles(App.user.user_id);
      if (!profiles.length) {
        grid.innerHTML = emptyBox('No skin profile yet',
          'Create a skin profile to see shades matched to you.');
        return;
      }
      const result = await api.generateRecommendations(
        App.user.user_id, profiles[0].profile_id);
      const recs = result.recommendations || [];

      if (!recs.length) {
        grid.innerHTML = emptyBox('No matches found',
          'We could not find shades for this profile yet.');
        return;
      }
      grid.innerHTML = recs.slice(0, 6)
        .map((r, i) => recommendationCard(r, i + 1)).join('');

      Views._wireCardClicks(grid, panel);

    } catch (err) {
      grid.innerHTML = emptyBox('Could not load', err.message);
    }
  },

  /* ============================================================
     SKIN PROFILES
     ============================================================ */
  async profiles() {
    const selector = document.getElementById('profile-selector');
    const detail   = document.getElementById('profile-detail-card');
    const formCard = document.getElementById('profile-form-card');

    formCard.classList.add('hidden');
    detail.classList.add('hidden');
    selector.innerHTML = loadingBox('Loading profiles…');

    let profiles = [];
    try {
      profiles = await api.getProfiles(App.user.user_id);
    } catch (err) {
      selector.innerHTML = emptyBox('Could not load', err.message);
      return;
    }

    if (!profiles.length) {
      selector.innerHTML = emptyBox('No profiles yet',
        'Tap "+ New Profile" to create your first skin profile.');
    } else {
      // render one chip per profile
      selector.innerHTML = profiles.map(p =>
        `<button class="profile-chip" data-profile="${p.profile_id}">
           ${esc(p.profile_label)}</button>`).join('');

      selector.querySelectorAll('[data-profile]').forEach(chip =>
        chip.addEventListener('click', () => {
          selector.querySelectorAll('.profile-chip')
            .forEach(c => c.classList.toggle('active', c === chip));
          const p = profiles.find(x => x.profile_id === +chip.dataset.profile);
          Views._showProfileDetail(p);
        }));

      // open the first profile by default
      selector.querySelector('.profile-chip').classList.add('active');
      Views._showProfileDetail(profiles[0]);
    }

    // "+ New Profile" button 
    document.getElementById('btn-add-profile').onclick = () => {
      detail.classList.add('hidden');
      formCard.classList.remove('hidden');
      Views._clearProfileForm();
    };
    document.getElementById('btn-cancel-profile').onclick = () => {
      formCard.classList.add('hidden');
      if (profiles.length) detail.classList.remove('hidden');
    };

    // Save new profile 
    document.getElementById('btn-save-profile').onclick = async () => {
      const err = document.getElementById('pf-error');
      err.textContent = '';

      const concerns = Array.from(
        document.querySelectorAll('#pf-concerns input:checked')).map(c => c.value);

      const data = {
        user_id:          App.user.user_id,
        // weak entity: compute the next profile_id for this user
        profile_id:       profiles.length
          ? Math.max(...profiles.map(p => p.profile_id)) + 1 : 1,
        profile_label:    document.getElementById('pf-label').value.trim(),
        skintone:         document.getElementById('pf-skintone').value,
        undertone:        document.getElementById('pf-undertone').value,
        skintype:         document.getElementById('pf-skintype').value,
        preferred_finish: document.getElementById('pf-finish').value || null,
        primary_concern:  concerns.join(','),
      };

      if (!data.profile_label || !data.skintone || !data.undertone || !data.skintype) {
        err.textContent = 'Label, skintone, undertone and skin type are required.';
        return;
      }
      try {
        await api.createProfile(data);
        toast('Profile created', 'success');
        Views.profiles();   // reload the view
      } catch (e) { err.textContent = e.message; }
    };
  },

  // fill the "active profile" detail card 
  _showProfileDetail(p) {
    if (!p) return;
    const card = document.getElementById('profile-detail-card');
    document.getElementById('profile-form-card').classList.add('hidden');
    card.classList.remove('hidden');

    document.getElementById('pd-title').textContent = p.profile_label;

    document.getElementById('pd-attrs').innerHTML = `
      <div class="attr">Skintone <b>${esc(p.skintone)}</b></div>
      <div class="attr">Undertone <b>${esc(p.undertone)}</b></div>
      <div class="attr">Skin type <b>${esc(p.skintype)}</b></div>
      <div class="attr">Finish <b>${esc(p.preferred_finish || '—')}</b></div>`;

    const concerns = (p.primary_concern || '').split(',').filter(Boolean);
    document.getElementById('pd-concerns').innerHTML = concerns.length
      ? concerns.map(c => `<span class="tag">${esc(c)}</span>`).join('')
      : '<span class="detail-empty">None noted</span>';

    // delete button 
    document.getElementById('btn-delete-profile').onclick = async () => {
      if (!confirm('Remove this skin profile?')) return;
      try {
        await api.deleteProfile(App.user.user_id, p.profile_id);
        toast('Profile removed', 'success');
        Views.profiles();
      } catch (e) { toast(e.message, 'error'); }
    };
  },

  _clearProfileForm() {
    document.getElementById('pf-label').value = '';
    document.getElementById('pf-skintone').value = '';
    document.getElementById('pf-undertone').value = '';
    document.getElementById('pf-skintype').value = '';
    document.getElementById('pf-finish').value = '';
    document.querySelectorAll('#pf-concerns input:checked')
      .forEach(c => { c.checked = false; });
    document.getElementById('pf-error').textContent = '';
  },

  /* ============================================================
     PRODUCTS
     ============================================================ */
  async products() {
    const grid  = document.getElementById('products-grid');
    const panel = document.getElementById('products-detail-panel');
    grid.innerHTML = loadingBox('Loading products…');

    try {
      await Views._ensureCatalogue();
    } catch (err) {
      grid.innerHTML = emptyBox('Could not load', err.message);
      return;
    }

    let activeCat = '';

    const renderGrid = () => {
      const list = activeCat
        ? Views.cache.products.filter(p => p.category === activeCat)
        : Views.cache.products;

      grid.innerHTML = list.length
        ? list.map(p => productCard(p, Views.cache.variants)).join('')
        : emptyBox('No products', 'Nothing in this category yet.');

      Views._wireCardClicks(grid, panel);
    };

    renderGrid();

    // category filter chips (already in index.html) 
    document.querySelectorAll('#product-filter-chips .filter-chip').forEach(chip =>
      chip.addEventListener('click', () => {
        document.querySelectorAll('#product-filter-chips .filter-chip')
          .forEach(c => c.classList.toggle('active', c === chip));
        activeCat = chip.dataset.cat;
        renderGrid();
      }));
  },

  /* ============================================================
     RECOMMEND  ("Find My Shade")
     ============================================================ */
  async recommend() {
    const select = document.getElementById('rec-profile-select');
    const grid   = document.getElementById('rec-grid');

    // fill the profile dropdown 
    let profiles = [];
    try {
      profiles = await api.getProfiles(App.user.user_id);
    } catch (err) {
      select.innerHTML = '<option value="">Could not load profiles</option>';
      return;
    }

    if (!profiles.length) {
      select.innerHTML = '<option value="">No profiles — create one first</option>';
    } else {
      select.innerHTML = profiles.map(p =>
        `<option value="${p.profile_id}">${esc(p.profile_label)}</option>`).join('');
    }

    // "Match Me" button 
    document.getElementById('btn-get-recs').onclick = async () => {
      const profileId = select.value;
      if (!profileId) { toast('Create a skin profile first', 'error'); return; }

      grid.innerHTML = loadingBox('Finding your shades…');
      try {
        const result = await api.generateRecommendations(App.user.user_id, profileId);
        let recs = result.recommendations || [];

        // optional category filter (dropdown is in index.html)
        const cat = document.getElementById('rec-category-select').value;
        if (cat) recs = recs.filter(r => r.category === cat);

        grid.innerHTML = recs.length
          ? recs.map((r, i) => recommendationCard(r, i + 1)).join('')
          : emptyBox('No matches', 'No shades matched this profile and category.');
      } catch (err) {
        grid.innerHTML = emptyBox('Could not load', err.message);
      }
    };
  },

  /* ============================================================
     SHARED HELPERS
     ============================================================ */

  // fetch products + variants + reviews + users once, then cache 
  async _ensureCatalogue() {
    if (Views.cache.products.length) return; // already loaded
    const [products, variants, reviews, users] = await Promise.all([
      api.getProducts(), api.getVariants(), api.getReviews(), api.getUsers(),
    ]);
    Views.cache.products = products;
    Views.cache.variants = variants;
    Views.cache.reviews  = reviews;
    users.forEach(u => { Views.cache.users[u.user_id] = u.name; });
  },

  // make product cards in `grid` fill the `panel` on click 
  _wireCardClicks(grid, panel) {
    grid.querySelectorAll('[data-product]').forEach(card =>
      card.addEventListener('click', () => {
        grid.querySelectorAll('.p-card')
          .forEach(c => c.classList.toggle('selected', c === card));
        const product = Views.cache.products
          .find(p => p.product_id === +card.dataset.product);
        if (product) {
          panel.innerHTML = detailPanel(
            product, Views.cache.variants, Views.cache.reviews, Views.cache.users);
        }
      }));
  },
};