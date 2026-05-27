/* ============================================================
   app.js — application controller
   ------------------------------------------------------------
   Handles login/signup, logout, navigation, and modal closing.
   Navigation shows one .view block and hides the rest, then
   calls the matching Views function to fill it with data.
   ============================================================ */

const App = {
  user: null,

  init() {
    this.user = JSON.parse(sessionStorage.getItem('pp_user') || 'null');
    if (this.user) this.showApp();
    else           this.showLanding();

    this.bindAuth();
    this.bindNav();
    this.bindModal();
  },

  /* ---------------- SCREEN SWITCHING ---------------- */
  showLanding() {
    document.getElementById('landingPage-screen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  },

  showApp() {
    document.getElementById('landingPage-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    const initial = (this.user.name || 'P').charAt(0).toUpperCase();
    document.getElementById('user-avatar').textContent = initial;
    document.getElementById('user-name').textContent = this.user.name;

    this.navigate('home');
  },

  /* ---------------- AUTH ---------------- */
  bindAuth() {
    document.getElementById('go-signup').addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('login-form').classList.add('hidden');
      document.getElementById('signup-form').classList.remove('hidden');
    });
    document.getElementById('go-login').addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('signup-form').classList.add('hidden');
      document.getElementById('login-form').classList.remove('hidden');
    });

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

    document.getElementById('btn-logout').addEventListener('click', () => {
      sessionStorage.removeItem('pp_user');
      App.user = null;
      Views.cache = { users: {}, products: [], variants: [], reviews: [] };
      App.showLanding();
    });

    document.getElementById('login-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-login').click();
    });
    document.getElementById('signup-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-signup').click();
    });
  },

  _signIn(user) {
    App.user = user;
    sessionStorage.setItem('pp_user', JSON.stringify(user));
    App.showApp();
  },

  /* ---------------- NAVIGATION ---------------- */
  bindNav() {
    document.body.addEventListener('click', e => {
      const link = e.target.closest('[data-nav]');
      if (!link) return;
      e.preventDefault();
      App.navigate(link.dataset.nav);
    });
    document.getElementById('nav-toggle').addEventListener('click', () => {
      document.getElementById('main-nav').classList.toggle('open');
    });
  },

  navigate(view) {
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === view);
    });
    document.getElementById('main-nav').classList.remove('open');

    const ids = {
      home:      'view-home',
      profiles:  'view-profiles',
      products:  'view-products',
      recommend: 'view-recommend',
    };
    const target = ids[view] || 'view-home';
    document.querySelectorAll('.main > .view').forEach(v => {
      v.classList.toggle('hidden', v.id !== target);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'profiles')       Views.profiles();
    else if (view === 'products')  Views.products();
    else if (view === 'recommend') Views.recommend();
    else                           Views.home();
  },

  /* ---------------- MODAL ---------------- */
  bindModal() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target.id === 'modal-overlay') closeModal();
    });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());