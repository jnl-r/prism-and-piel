const App = {
  user: null,

  init() {
    this.user = Auth.current();

    if (this.user) {
      this.showApp();
    } else {
      this.showLanding();
    }

    this.bindLanding();
    this.bindNav();
  },

  // ── Landing / Auth ──────────────────────────────────
  showLanding() {
    document.getElementById('landingPage-screen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  },

  showApp() {
    document.getElementById('landingPage-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    // Update topbar user chip
    const initial = this.user.name?.[0]?.toUpperCase() || 'P';
    document.getElementById('user-avatar').textContent = initial;
    document.getElementById('user-name').textContent = this.user.name;

    this.navigate('home');
  },

  bindLanding() {
    // Toggle login ↔ signup
    document.getElementById('go-signup').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-form').classList.add('hidden');
      document.getElementById('signup-form').classList.remove('hidden');
    });

    document.getElementById('go-login').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('signup-form').classList.add('hidden');
      document.getElementById('login-form').classList.remove('hidden');
    });

    // Login
    document.getElementById('btn-login').addEventListener('click', async () => {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errorEl = document.getElementById('login-error');
      errorEl.textContent = '';

      try {
        const user = await Auth.login(email, password);
        Auth.save(user);
        App.user = user;
        App.showApp();
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });

    // Signup
    document.getElementById('btn-signup').addEventListener('click', async () => {
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const errorEl = document.getElementById('signup-error');
      errorEl.textContent = '';

      try {
        const user = await Auth.signup(name, email, password);
        Auth.save(user);
        App.user = user;
        App.showApp();
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
      Auth.logout();
      App.user = null;
      App.showLanding();
    });
  },

  // ── Navigation ──────────────────────────────────────
  bindNav() {
    document.getElementById('main-nav').addEventListener('click', (e) => {
      const link = e.target.closest('[data-nav]');
      if (!link) return;
      e.preventDefault();
      this.navigate(link.dataset.nav);
    });

    // Brand mark in topbar also navigates home
    document.querySelector('.topbar .brand-mark').addEventListener('click', () => {
      this.navigate('home');
    });

    // Mobile nav toggle
    document.getElementById('nav-toggle').addEventListener('click', () => {
      document.getElementById('main-nav').classList.toggle('open');
    });
  },

  navigate(view) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach((el) => {
      el.classList.toggle('active', el.dataset.nav === view);
    });

    // Close mobile nav
    document.getElementById('main-nav').classList.remove('open');

    // Render view
    const root = document.getElementById('view-root');
    switch (view) {
      case 'home':      Views.home(root);     break;
      case 'profiles':  Views.profiles(root); break;
      case 'products':  Views.products(root); break;
      case 'recommend': Views.recommend(root); break;
      default:          Views.home(root);
    }
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());