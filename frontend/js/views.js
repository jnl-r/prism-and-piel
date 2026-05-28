const Views = {

  cache: { users: {}, products: [], variants: [], reviews: [], links: []},

  /* ============================================================
     HOME 
     ============================================================ */
  async home() {
    const isUser = !!App.user;
    document.getElementById('home-kicker').textContent =
      isUser ? 'Good to see you' : 'Welcome';
    document.getElementById('home-sub').textContent =
      isUser ? "Here's a quick look at what's waiting for you."
             : "You're browsing as a guest. Sign in to save profiles and get matches.";
    document.getElementById('welcome-name').textContent =
      isUser ? App.user.name.split(' ')[0] : 'there';
    document.getElementById('home-comma').style.display = isUser ? '' : 'none';

    const block = document.getElementById('home-top-picks');
    if (!isUser) { block.classList.add('hidden'); return; }
    block.classList.remove('hidden');

    const grid = document.getElementById('home-recs-grid');
    grid.innerHTML = loadingBox('Finding your shades…');

    try {
      const profiles = await api.getProfiles(App.user.user_id);
      if (!profiles.length) {
        grid.innerHTML = emptyBox('No skin profile yet',
          'Create a skin profile to see shades matched to your skin.');
        return;
      }
      await Views._ensureCatalogue();
      const result = await api.generateRecommendations(
        App.user.user_id, profiles[0].profile_id);
      const recs = result.recommendations || [];
      if (!recs.length) {
        grid.innerHTML = emptyBox('No matches found',
          'We could not find shades for this profile yet.');
        return;
      }
      grid.innerHTML = recs.slice(0, 6)
        .map((r, i) => recommendationCard(r, i + 1, Views.cache.links)).join('');
      Views._wireProductCardClicks(grid);
    } catch (err) {
      grid.innerHTML = emptyBox('Could not load', err.message);
    }
  },

  /* ============================================================
     SKIN PROFILES
     ============================================================ */
  async profiles() {
    const signedIn = document.getElementById('profiles-signedin');
    const guestBox = document.getElementById('profiles-guest');

    if (!App.user) {
      signedIn.classList.add('hidden');
      guestBox.classList.remove('hidden');
      return;
    }
    signedIn.classList.remove('hidden');
    guestBox.classList.add('hidden');

    const strip = document.getElementById('profile-strip');
    const host  = document.getElementById('profile-detail-host');
    const count = document.getElementById('profiles-count');

    strip.innerHTML = loadingBox('Loading profiles…');
    host.innerHTML  = '';
    count.textContent = '';

    let profiles = [];
    try {
      profiles = await api.getProfiles(App.user.user_id);
    } catch (err) {
      strip.innerHTML = emptyBox('Could not load', err.message);
      return;
    }

    count.textContent = profiles.length
      ? `${profiles.length} profile${profiles.length === 1 ? '' : 's'}`
      : '';

    if (!profiles.length) {
      strip.innerHTML = '';
      host.innerHTML = emptyBox(
        'No profiles yet',
        'Tap "+ New Profile" above to create your first skin profile.');
    } else {
      /* simple chips, just the name */
      strip.innerHTML = profiles.map((p, i) => profileChip(p, i === 0)).join('');
      Views._renderProfileDetail(profiles[0], profiles);

      strip.querySelectorAll('[data-profile]').forEach(chip =>
        chip.addEventListener('click', () => {
          strip.querySelectorAll('.profile-chip')
            .forEach(c => c.classList.toggle('active', c === chip));
          const p = profiles.find(x => x.profile_id === +chip.dataset.profile);
          Views._renderProfileDetail(p, profiles);
        }));
    }

    document.getElementById('btn-add-profile').onclick =
      () => Views._openProfileForm(null, profiles);
  },

  _renderProfileDetail(p, profiles) {
    const host = document.getElementById('profile-detail-host');
    host.innerHTML = profileDetailCard(p);

    document.getElementById('btn-edit-profile').onclick =
      () => Views._openProfileForm(p, profiles);

    document.getElementById('btn-delete-profile').onclick = async () => {
      if (!confirm('Delete this skin profile?')) return;
      try {
        await api.deleteProfile(App.user.user_id, p.profile_id);
        toast('Profile deleted', 'success');
        Views.profiles();
      } catch (e) { toast(e.message, 'error'); }
    };
  },

  _openProfileForm(existing, profiles) {
    openModal(profileFormHTML(existing));

    document.getElementById('btn-save-profile').onclick = async () => {
      const errEl = document.getElementById('pf-error');
      errEl.textContent = '';

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
        errEl.textContent = 'Label, skintone, undertone and skin type are required.';
        return;
      }
      try {
        if (existing) {
          await api.updateProfile(App.user.user_id, existing.profile_id, data);
          toast('Profile updated', 'success');
        } else {
          data.user_id    = App.user.user_id;
          data.profile_id = profiles.length
            ? Math.max(...profiles.map(p => p.profile_id)) + 1 : 1;
          await api.createProfile(data);
          toast('Profile created', 'success');
        }
        closeModal();
        Views.profiles();
      } catch (e) { errEl.textContent = e.message; }
    };
  },

  /* ============================================================
     PRODUCTS 
     ============================================================ */
  async products() {
    const grid       = document.getElementById('products-grid');
    const brandChips = document.getElementById('product-brand-chips');
    grid.innerHTML = loadingBox('Loading products…');

    try {
      await Views._ensureCatalogue();
    } catch (err) {
      grid.innerHTML = emptyBox('Could not load', err.message);
      brandChips.innerHTML = '';
      return;
    }

    const brands = [...new Set(Views.cache.products.map(p => p.brand_name))].sort();
    brandChips.innerHTML =
      '<button class="filter-chip active" data-brand="">All brands</button>' +
      brands.map(b => `<button class="filter-chip" data-brand="${esc(b)}">${esc(b)}</button>`).join('');

    let activeCat = '', activeBrand = '';

    const render = () => {
      const list = Views.cache.products.filter(p =>
        (!activeCat   || p.category   === activeCat) &&
        (!activeBrand || p.brand_name === activeBrand));
      grid.innerHTML = list.length
        ? list.map(p => productCard(p, Views.cache.variants, Views.cache.links)).join('')
        : emptyBox('No products', 'Try a different filter.');
      Views._wireProductCardClicks(grid);
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
     FIND MY SHADE 
     ============================================================ */
  async recommend() {
    const signedIn = document.getElementById('recommend-signedin');
    const guestBox = document.getElementById('recommend-guest');

    if (!App.user) {
      signedIn.classList.add('hidden');
      guestBox.classList.remove('hidden');
      return;
    }
    signedIn.classList.remove('hidden');
    guestBox.classList.add('hidden');

    const select = document.getElementById('rec-profile-select');
    const grid   = document.getElementById('rec-grid');
    grid.innerHTML = '';

    let profiles = [];
    try {
      profiles = await api.getProfiles(App.user.user_id);
      select.innerHTML = profiles.length
        ? profiles.map(p => `<option value="${p.profile_id}">${esc(p.profile_label)}</option>`).join('')
        : '<option value="">No profiles — create one first</option>';
    } catch (err) {
      select.innerHTML = '<option value="">Could not load profiles</option>';
    }

    document.getElementById('btn-get-recs').onclick = async () => {
      const profileId = select.value;
      const category  = document.getElementById('rec-category-select').value;
      if (!profileId) { toast('Select a skin profile first', 'error'); return; }

      grid.innerHTML = loadingBox('Finding your shades…');
      try {
        await Views._ensureCatalogue();
        const result = await api.generateRecommendations(App.user.user_id, profileId);
        let recs = result.recommendations || [];
        if (category) recs = recs.filter(r => r.category === category);

        grid.innerHTML = recs.length
          ? recs.map((r, i) => recommendationCard(r, i + 1, Views.cache.links)).join('')
          : emptyBox('No matches', 'No shades matched this profile and category.');
        Views._wireProductCardClicks(grid);
      } catch (err) {
        grid.innerHTML = emptyBox('Could not load', err.message);
      }
    };
  },

  /* ============================================================
     SHARED 
     ============================================================ */

  async _ensureCatalogue() {
    if (Views.cache.products.length) return;
    const [products, variants, reviews, links, users] = await Promise.all([
      api.getProducts(),
      api.getVariants(),
      api.getReviews(),
      api.getLinks(),
      App.user ? api.getUsers() : Promise.resolve([]),
    ]);
    Views.cache.products = products;
    Views.cache.variants = variants;
    Views.cache.reviews  = reviews;
    Views.cache.links    = links;
    users.forEach(u => { Views.cache.users[u.user_id] = u.name; });
  },

  _wireProductCardClicks(grid) {
    grid.querySelectorAll('[data-product]').forEach(card =>
      card.addEventListener('click', async () => {
        const id = +card.dataset.product;
        let product = Views.cache.products.find(p => p.product_id === id);
        if (!product) {
          try { await Views._ensureCatalogue(); } catch (e) {}
          product = Views.cache.products.find(p => p.product_id === id);
        }
        if (!product) { toast('Could not load that product', 'error'); return; }
         openDrawer(drawerContent(product, Views.cache.variants,
            Views.cache.reviews, Views.cache.users, Views.cache.links));

          Views._wireDrawerReview(product);
      }));
  },

  _wireDrawerReview(product) {
    const toggle = document.getElementById('drawer-add-review');
    if (!toggle) return;                 // guest — no form rendered

    const form = document.getElementById('drawer-review-form');
    toggle.addEventListener('click', () => form.classList.toggle('hidden'));

    // star rating: clicking a star fills up to it
    let rating = 0;
    const stars = document.getElementById('dr-stars');
    stars.querySelectorAll('span').forEach(s =>
        s.addEventListener('click', () => {
        rating = +s.dataset.v;
        stars.querySelectorAll('span').forEach(x =>
            x.classList.toggle('on', +x.dataset.v <= rating));
        }));

    document.getElementById('dr-submit-review').addEventListener('click', async () => {
        const err = document.getElementById('dr-error');
        err.textContent = '';
        if (!rating) { err.textContent = 'Please pick a star rating.'; return; }

        const data = {
        user_id:    App.user.user_id,
        product_id: product.product_id,
        variant_id: +document.getElementById('dr-variant').value,
        rating:     rating,
        comment:    document.getElementById('dr-comment').value.trim(),
        skin_profile_match: document.getElementById('dr-match').checked,
        };
        try {
        await api.createReview(data);
        toast('Review posted', 'success');
        // refresh the cache + redraw the drawer so the new review shows
        Views.cache.reviews = await api.getReviews();
        openDrawer(drawerContent(product, Views.cache.variants,
            Views.cache.reviews, Views.cache.users, Views.cache.links));
        Views._wireDrawerReview(product);
        } catch (e) { err.textContent = e.message; }
    });
    },
};