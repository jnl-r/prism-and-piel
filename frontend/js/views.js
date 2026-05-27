const Views = {

  /* catalogue cache — filled once per session */
  cache: { users: {}, products: [], variants: [], reviews: [] },

  /* ============================================================
     HOME
     ============================================================ */
  async home() {
    // set the welcome name from the logged-in user
    const nameEl = document.getElementById('welcome-name');
    if (nameEl && App.user?.name) {
      nameEl.textContent = App.user.name.split(' ')[0];
    }

    const grid  = document.getElementById('home-recs-grid');
    const panel = document.getElementById('home-detail-panel');

    grid.innerHTML = loadingBox('Finding your shades…');

    try {
      // get the user's first profile, then ask backend for matches
      const profiles = await api.getProfiles(App.user.user_id);
      if (!profiles.length) {
        grid.innerHTML = emptyBox(
          'No skin profile yet',
          'Go to Skin Profiles and create one to see your matches.'
        );
        return;
      }

      const result = await api.generateRecommendations(
        App.user.user_id, profiles[0].profile_id
      );
      const recs = result.recommendations || [];

      if (!recs.length) {
        grid.innerHTML = emptyBox('No matches found',
          'We could not find shades for this profile yet.');
        return;
      }

      // show top 6 recommendations
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
      selector.innerHTML = emptyBox(
        'No profiles yet',
        'Tap "+ New Profile" to create your first skin profile.'
      );
    } else {
      // render one chip per profile + an add chip at the end
      selector.innerHTML = profiles.map(p => `
        <button class="profile-chip" data-profile="${p.profile_id}">
          <div class="profile-chip-label">${esc(p.profile_label)}</div>
          <div class="profile-attrs">
            <span class="attr"><b>${esc(p.skintone)}</b></span>
            <span class="attr"><b>${esc(p.undertone)}</b> undertone</span>
            <span class="attr">${esc(p.skintype)}</span>
          </div>
        </button>`).join('') + `
        <button class="profile-chip profile-chip-add" id="btn-chip-add">
          <span class="profile-chip-add-icon">+</span>
          New profile
        </button>`;

      // clicking a chip opens that profile's detail card
      selector.querySelectorAll('[data-profile]').forEach(chip => {
        chip.addEventListener('click', () => {
          selector.querySelectorAll('.profile-chip')
            .forEach(c => c.classList.toggle('active', c === chip));
          const p = profiles.find(x => x.profile_id === +chip.dataset.profile);
          Views._showProfileDetail(p, profiles);
        });
      });

      // open the first profile by default
      selector.querySelector('[data-profile]').classList.add('active');
      Views._showProfileDetail(profiles[0], profiles);

      // inline add chip also opens the form
      document.getElementById('btn-chip-add')?.addEventListener('click', () => {
        detail.classList.add('hidden');
        formCard.classList.remove('hidden');
        Views._clearProfileForm();
      });
    }

    // "+ New Profile" toolbar button
    document.getElementById('btn-add-profile').onclick = () => {
      detail.classList.add('hidden');
      formCard.classList.remove('hidden');
      Views._clearProfileForm();
    };

    // Cancel button hides the form, restores detail if profiles exist
    document.getElementById('btn-cancel-profile').onclick = () => {
      formCard.classList.add('hidden');
      if (profiles.length) detail.classList.remove('hidden');
    };

    // Save new profile
    document.getElementById('btn-save-profile').onclick = async () => {
      const errEl = document.getElementById('pf-error');
      errEl.textContent = '';

      const concerns = Array.from(
        document.querySelectorAll('#pf-concerns input:checked')
      ).map(c => c.value);

      const data = {
        user_id:          App.user.user_id,
        // weak entity — compute the next profile_id for this user
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
        errEl.textContent = 'Label, skintone, undertone and skin type are required.';
        return;
      }

      try {
        await api.createProfile(data);
        toast('Profile created!', 'success');
        Views.profiles();
      } catch (e) {
        errEl.textContent = e.message;
      }
    };
  },

  // fill the "active profile" detail card
  _showProfileDetail(p, profiles) {
    if (!p) return;
    const card     = document.getElementById('profile-detail-card');
    const formCard = document.getElementById('profile-form-card');
    formCard.classList.add('hidden');
    card.classList.remove('hidden');

    document.getElementById('pd-title').textContent = p.profile_label;

    document.getElementById('pd-attrs').innerHTML = `
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
      </div>`;

    const concerns = (p.primary_concern || '').split(',').filter(Boolean);
    document.getElementById('pd-concerns').innerHTML = concerns.length
      ? concerns.map(c => `<span class="tag">${esc(c)}</span>`).join('')
      : '<span class="detail-empty">None noted</span>';

    // delete button wired per profile
    document.getElementById('btn-delete-profile').onclick = async () => {
      if (!confirm('Remove this skin profile?')) return;
      try {
        await api.deleteProfile(App.user.user_id, p.profile_id);
        toast('Profile removed', 'success');
        Views.profiles();
      } catch (e) {
        toast(e.message, 'error');
      }
    };
  },

  // reset all fields in the new profile form
  _clearProfileForm() {
    document.getElementById('pf-label').value     = '';
    document.getElementById('pf-skintone').value  = '';
    document.getElementById('pf-undertone').value = '';
    document.getElementById('pf-skintype').value  = '';
    document.getElementById('pf-finish').value    = '';
    document.querySelectorAll('#pf-concerns input:checked')
      .forEach(c => { c.checked = false; });
    document.getElementById('pf-error').textContent = '';
  },

  /* ============================================================
    PRODUCTS — category + brand filters + detail panel
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

    let activeCat   = '';
    let activeBrand = '';

    // render the grid filtered by the active category AND brand
    const renderGrid = () => {
      const list = Views.cache.products.filter(p =>
        (!activeCat   || p.category  === activeCat) &&
        (!activeBrand || p.brand_name === activeBrand)
      );

      grid.innerHTML = list.length
        ? list.map(p => productCard(p, Views.cache.variants)).join('')
        : emptyBox('No products', 'Try a different filter.');

      Views._wireCardClicks(grid, panel);
    };

    renderGrid();

    // category filter chips (already in index.html)
    document.querySelectorAll('#product-cat-chips .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#product-cat-chips .filter-chip')
          .forEach(c => c.classList.toggle('active', c === chip));
        activeCat = chip.dataset.cat;
        renderGrid();
      });
    });

    // brand filter chips (populated dynamically from catalogue)
    const brandChips = document.getElementById('product-brand-chips');
    if (brandChips) {
      const brands = [...new Set(Views.cache.products.map(p => p.brand_name))].sort();
      brandChips.innerHTML =
        '<button class="filter-chip active" data-brand="">All brands</button>' +
        brands.map(b =>
          `<button class="filter-chip" data-brand="${esc(b)}">${esc(b)}</button>`
        ).join('');

      brandChips.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          brandChips.querySelectorAll('.filter-chip')
            .forEach(c => c.classList.toggle('active', c === chip));
          activeBrand = chip.dataset.brand;
          renderGrid();
        });
      });
    }
  },

  /* ============================================================
     FIND MY SHADE
     ============================================================ */
  async recommend() {
    const select = document.getElementById('rec-profile-select');
    const grid   = document.getElementById('rec-grid');

    // fill the profile dropdown
    let profiles = [];
    try {
      profiles = await api.getProfiles(App.user.user_id);
      select.innerHTML = profiles.length
        ? profiles.map(p =>
            `<option value="${p.profile_id}">${esc(p.profile_label)}</option>`
          ).join('')
        : '<option value="">No profiles — create one first</option>';
    } catch (err) {
      select.innerHTML = '<option value="">Could not load profiles</option>';
    }

    // "Match Me" button
    document.getElementById('btn-get-recs').onclick = async () => {
      const profileId = select.value;
      const category  = document.getElementById('rec-category-select').value;

      if (!profileId) {
        toast('Select a skin profile first', 'error');
        return;
      }

      grid.innerHTML = loadingBox('Finding your shades…');

      try {
        const result = await api.generateRecommendations(App.user.user_id, profileId);
        let recs = result.recommendations || [];

        // optional category filter
        if (category) recs = recs.filter(r => r.category === category);

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
      api.getProducts(),
      api.getVariants(),
      api.getReviews(),
      api.getUsers(),
    ]);
    Views.cache.products = products;
    Views.cache.variants = variants;
    Views.cache.reviews  = reviews;
    users.forEach(u => { Views.cache.users[u.user_id] = u.name; });
  },

  // clicking a product card fills the side detail panel
  _wireCardClicks(grid, panel) {
    if (!panel) return;
    grid.querySelectorAll('[data-product]').forEach(card =>
      card.addEventListener('click', () => {
        grid.querySelectorAll('.p-card')
          .forEach(c => c.classList.toggle('selected', c === card));
        const product = Views.cache.products
          .find(p => p.product_id === +card.dataset.product);
        if (product) {
          panel.innerHTML = detailPanel(
            product,
            Views.cache.variants,
            Views.cache.reviews,
            Views.cache.users
          );
        }
      }));
  },

};