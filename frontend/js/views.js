/* ============================================================
   views.js — fills the page shells in index.html with backend data
   ------------------------------------------------------------
   Page STRUCTURE lives in index.html. These functions only:
     1. fetch data from the backend (api.js)
     2. drop data rows (cards) into existing containers
     3. wire up clicks
   Data-row HTML is built by components.js helpers.
   ============================================================ */

const Views = {

  /* catalogue cache — filled once per session */
  cache: { users: {}, products: [], variants: [], reviews: [] },

  /* ============================================================
     HOME — fully static (the hero lives in index.html). No-op.
     ============================================================ */
  home() { /* nothing to fetch — the hero is static HTML */ },

  /* ============================================================
     SKIN PROFILES — card grid + modal form
     ============================================================ */
  async profiles() {
    const grid = document.getElementById('profiles-grid');
    grid.className = '';
    grid.innerHTML = loadingBox('Loading profiles…');

    let profiles = [];
    try {
      profiles = await api.getProfiles(App.user.user_id);
    } catch (e) {
      grid.innerHTML = emptyBox('Could not load', e.message);
      return;
    }

    if (!profiles.length) {
      grid.innerHTML = emptyBox('No profiles yet',
        'Tap "+ New Profile" to create your first skin profile.');
    } else {
      grid.className = 'card-grid';
      grid.innerHTML = profiles.map(profileCard).join('');

      grid.querySelectorAll('[data-edit]').forEach(b =>
        b.addEventListener('click', () => {
          const p = profiles.find(x => x.profile_id === +b.dataset.edit);
          Views._openProfileForm(p, profiles);
        }));
      grid.querySelectorAll('[data-del]').forEach(b =>
        b.addEventListener('click', async () => {
          if (!confirm('Delete this skin profile?')) return;
          try {
            await api.deleteProfile(App.user.user_id, +b.dataset.del);
            toast('Profile deleted', 'success');
            Views.profiles();
          } catch (e) { toast(e.message, 'error'); }
        }));
    }

    document.getElementById('btn-add-profile').onclick =
      () => Views._openProfileForm(null, profiles);
  },

  /* open the create/edit profile modal */
  _openProfileForm(existing, profiles) {
    openModal(profileFormHTML(existing));

    document.getElementById('btn-save-profile').onclick = async () => {
      const err = document.getElementById('pf-error');
      err.textContent = '';

      const concerns = Array.from(
        document.querySelectorAll('#pf-concerns input:checked')).map(c => c.value);

      const data = {
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
        if (existing) {
          await api.updateProfile(App.user.user_id, existing.profile_id, data);
          toast('Profile updated', 'success');
        } else {
          // weak entity — compute the next profile_id for this user
          data.user_id    = App.user.user_id;
          data.profile_id = profiles.length
            ? Math.max(...profiles.map(p => p.profile_id)) + 1 : 1;
          await api.createProfile(data);
          toast('Profile created', 'success');
        }
        closeModal();
        Views.profiles();
      } catch (e) { err.textContent = e.message; }
    };
  },

  /* ============================================================
     PRODUCTS — category + brand filters + detail panel
     ============================================================ */
  async products() {
    const grid       = document.getElementById('products-grid');
    const panel      = document.getElementById('products-detail-panel');
    const brandChips = document.getElementById('product-brand-chips');
    grid.innerHTML = loadingBox('Loading products…');

    try {
      await Views._ensureCatalogue();
    } catch (e) {
      grid.innerHTML = emptyBox('Could not load', e.message);
      brandChips.innerHTML = '';
      return;
    }

    /* brand chips, built from the product data */
    const brands = [...new Set(Views.cache.products.map(p => p.brand_name))].sort();
    brandChips.innerHTML =
      '<button class="filter-chip active" data-brand="">All</button>' +
      brands.map(b => `<button class="filter-chip" data-brand="${esc(b)}">${esc(b)}</button>`).join('');

    let activeCat = '', activeBrand = '';

    const render = () => {
      let list = Views.cache.products;
      if (activeCat)   list = list.filter(p => p.category === activeCat);
      if (activeBrand) list = list.filter(p => p.brand_name === activeBrand);

      grid.innerHTML = list.length
        ? list.map(p => productCard(p, Views.cache.variants)).join('')
        : emptyBox('No products', 'Try a different category or brand.');
      Views._wireCardClicks(grid, panel);
    };
    render();

    document.querySelectorAll('#product-cat-chips .filter-chip').forEach(chip =>
      chip.addEventListener('click', () => {
        document.querySelectorAll('#product-cat-chips .filter-chip')
          .forEach(c => c.classList.toggle('active', c === chip));
        activeCat = chip.dataset.cat;
        render();
      }));

    brandChips.querySelectorAll('.filter-chip').forEach(chip =>
      chip.addEventListener('click', () => {
        brandChips.querySelectorAll('.filter-chip')
          .forEach(c => c.classList.toggle('active', c === chip));
        activeBrand = chip.dataset.brand;
        render();
      }));
  },

  /* ============================================================
     FIND MY SHADE — pickbar + ranked results
     ============================================================ */
  async recommend() {
    const select = document.getElementById('rec-profile-select');
    const out    = document.getElementById('rec-results');

    let profiles = [];
    try {
      profiles = await api.getProfiles(App.user.user_id);
    } catch (e) {
      select.innerHTML = '<option value="">Could not load profiles</option>';
      out.innerHTML = emptyBox('Could not load', e.message);
      return;
    }

    if (!profiles.length) {
      select.innerHTML = '<option value="">No profiles yet</option>';
      out.innerHTML = emptyBox('Create a profile first',
        'You need a skin profile before we can match shades.');
      return;
    }

    select.innerHTML = profiles.map(p =>
      `<option value="${p.profile_id}">${esc(p.profile_label)}</option>`).join('');
    out.innerHTML = emptyBox('Ready when you are',
      'Choose a profile above and tap Find My Shade.');

    document.getElementById('btn-get-recs').onclick = async () => {
      const profileId = select.value;
      if (!profileId) { toast('Choose a skin profile', 'error'); return; }

      out.innerHTML = loadingBox('Finding your shades…');
      try {
        const result = await api.generateRecommendations(App.user.user_id, profileId);
        const recs = result.recommendations || [];
        if (!recs.length) {
          out.innerHTML = emptyBox('No matches',
            'No shades matched this profile yet.');
          return;
        }
        out.innerHTML = `<div class="card-grid">${
          recs.map((r, i) => recommendationCard(r, i + 1)).join('')}</div>`;
      } catch (e) {
        out.innerHTML = emptyBox('Could not load', e.message);
      }
    };
  },

  /* ============================================================
     SHARED HELPERS
     ============================================================ */

  /* fetch products + variants + reviews + users once, then cache */
  async _ensureCatalogue() {
    if (Views.cache.products.length) return;
    const [products, variants, reviews, users] = await Promise.all([
      api.getProducts(), api.getVariants(), api.getReviews(), api.getUsers(),
    ]);
    Views.cache.products = products;
    Views.cache.variants = variants;
    Views.cache.reviews  = reviews;
    users.forEach(u => { Views.cache.users[u.user_id] = u.name; });
  },

  /* clicking a product card fills the side detail panel */
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
            product, Views.cache.variants, Views.cache.reviews, Views.cache.users);
        }
      }));
  },
};