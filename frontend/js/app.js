const App = {
  user: null,          
  guest: false,      

  init() {
    this.user = JSON.parse(sessionStorage.getItem('pp_user') || 'null');
    this._refreshTopbar();
    this.navigate('home');
    this.bindLanding();
    this.bindAuth();
    this.bindNav();
    this.bindModal();
    this.bindDrawer();
  },

  /* ---------------- SCREEN SWITCHING ---------------- */
  _refreshTopbar() {
    const chip     = document.getElementById('user-chip');
    const logout   = document.getElementById('btn-logout');
    const guestBtn = document.getElementById('btn-guest-signin');
    if (this.user) {
      const initial = (this.user.name || 'P').charAt(0).toUpperCase();
      document.getElementById('user-avatar').textContent = initial;
      document.getElementById('user-name').textContent = this.user.name;
      chip.classList.remove('hidden');
      logout.classList.remove('hidden');
      guestBtn.classList.add('hidden');
    } else {
      chip.classList.add('hidden');
      logout.classList.add('hidden');
      guestBtn.classList.remove('hidden');
    }
  },

  /* ---------------- LANDING BUTTONS ---------------- */
  bindLanding() {
    /* "Browse Products" — scroll down to the products section, stay on landing */
    document.getElementById('btn-browse-guest').addEventListener('click', () => {
      App._scrollTo('landing-products');
    });
  },

  /* ---------------- AUTH ---------------- */
  bindAuth() {
    /* any element with data-open-auth opens the auth modal */
    document.body.addEventListener('click', e => {
      const trigger = e.target.closest('[data-open-auth]');
      if (!trigger) return;
      e.preventDefault();
      App.openAuth(trigger.dataset.openAuth);
    });

    /* close auth modal */
    document.getElementById('auth-modal-close').addEventListener('click', App.closeAuth);
    document.getElementById('auth-modal').addEventListener('click', e => {
      if (e.target.id === 'auth-modal') App.closeAuth();
    });

    /* switch login or signup inside the modal */
    document.getElementById('go-signup').addEventListener('click', e => {
      e.preventDefault();
      App._showAuthForm('signup');
    });
    document.getElementById('go-login').addEventListener('click', e => {
      e.preventDefault();
      App._showAuthForm('login');
    });

    /* LOGIN */
    document.getElementById('btn-login').addEventListener('click', async () => {
      const email = document.getElementById('login-email').value.trim();
      const pass  = document.getElementById('login-password').value;
      const err   = document.getElementById('login-error');
      err.textContent = '';
      if (!email || !pass) { err.textContent = 'Please fill in both fields.'; return; }
      try {
        const user = await api.login(email, pass);
        App._signIn(user);
      } catch (e) { err.textContent = e.message; }
    });

    /* SIGNUP */
    document.getElementById('btn-signup').addEventListener('click', async () => {
      const name  = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const pass  = document.getElementById('signup-password').value;
      const err   = document.getElementById('signup-error');
      err.textContent = '';
      if (!name || !email || !pass) { err.textContent = 'Please fill in all fields.'; return; }
      try {
        const user = await api.signup(name, email, pass);
        App._signIn(user);
      } catch (e) { err.textContent = e.message; }
    });

    /* LOGOUT */
    document.getElementById('btn-logout').addEventListener('click', () => {
      sessionStorage.removeItem('pp_user');
      App.user = null;
      App.guest = false;
      Views.cache = { users: {}, products: [], variants: [], reviews: [], links: [] };
      this._refreshTopbar();
      this.navigate('home');
    });

    /* enter key */
    document.getElementById('login-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-login').click();
    });
    document.getElementById('signup-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-signup').click();
    });

    /* Password show/hide */
    document.querySelectorAll('.toggle-pw').forEach(btn => {
      btn.addEventListener('click', () => {
        const input   = document.getElementById(btn.dataset.target);
        const eyeShow = btn.querySelector('.eye-show');
        const eyeHide = btn.querySelector('.eye-hide');
        const isHidden = input.type === 'password';
        input.type            = isHidden ? 'text' : 'password';
        eyeShow.style.display = isHidden ? 'none' : '';
        eyeHide.style.display = isHidden ? ''    : 'none';
        btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      });
    });
  },

  openAuth(mode = 'login') {
    this._showAuthForm(mode);
    document.getElementById('auth-modal').classList.remove('hidden');
    /* clear any errors / passwords */
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
  },

  closeAuth() {
    document.getElementById('auth-modal').classList.add('hidden');
  },

  _showAuthForm(mode) {
    document.getElementById('login-form')
      .classList.toggle('hidden', mode !== 'login');
    document.getElementById('signup-form')
      .classList.toggle('hidden', mode !== 'signup');
  },

  _signIn(user) {
    App.user = user;
    App.guest = false;
    sessionStorage.setItem('pp_user', JSON.stringify(user));
    App.closeAuth();
    App._refreshTopbar();
    App.navigate('home');
  },

  /* ---------------- NAVIGATION ---------------- */
  bindNav() {
    document.body.addEventListener('click', e => {
      const link = e.target.closest('[data-nav]');
      if (!link) return;
      e.preventDefault();
      App.navigate(link.dataset.nav);
    });
  
    document.body.addEventListener('click', e => {
      const s = e.target.closest('[data-scroll]');
      if (!s) return;
      e.preventDefault();
      App._scrollTo(s.dataset.scroll);
    });
    document.getElementById('nav-toggle').addEventListener('click', () => {
      document.getElementById('main-nav').classList.toggle('open');
    });
  },

  /* smooth-scroll to a section in the current view */
  _scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  navigate(view) {
    // routes to landing when not signed in
    const realView = (view === 'home' && !this.user) ? 'landing' : view;

    document.querySelectorAll('.nav-link').forEach(el => {
      const linkActive = el.dataset.nav === view ||
                        (el.dataset.nav === 'home' && realView === 'landing');
      el.classList.toggle('active', linkActive);
    });
    document.getElementById('main-nav').classList.remove('open');

    const ids = {
      landing:   'view-landing',
      home:      'view-home',
      profiles:  'view-profiles',
      recommend: 'view-recommend',
    };
    const target = ids[realView] || 'view-home';
    document.querySelectorAll('.main > .view').forEach(v => {
      v.classList.toggle('hidden', v.id !== target);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (realView === 'profiles')       Views.profiles();
    else if (realView === 'recommend') Views.recommend();
    else if (realView === 'home')      Views.home();
    else if (realView === 'landing')   Views.landing();
  },

  /* ---------------- MODAL ---------------- */
  bindModal() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target.id === 'modal-overlay') closeModal();
    });
  },

  /* ---------------- PRODUCT DRAWER ---------------- */
  bindDrawer() {
    document.getElementById('drawer-close').addEventListener('click', closeDrawer);
    document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeDrawer();
        App.closeAuth();
        closeModal();
      }
    });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());