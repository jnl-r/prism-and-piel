// api.js
// Base URL — change this to your backend
const API_BASE = 'http://localhost:3000/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

// ── Auth ──────────────────────────────────────────────
const Auth = {
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  signup: (name, email, password) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  logout: () => {
    sessionStorage.removeItem('pp_user');
  },

  current: () => JSON.parse(sessionStorage.getItem('pp_user') || 'null'),

  save: (user) => sessionStorage.setItem('pp_user', JSON.stringify(user)),
};

// ── Skin Profiles ──────────────────────────────────────
const Profiles = {
  list: (userId) => apiFetch(`/users/${userId}/profiles`),

  create: (userId, data) =>
    apiFetch(`/users/${userId}/profiles`, { method: 'POST', body: JSON.stringify(data) }),

  update: (userId, profileId, data) =>
    apiFetch(`/users/${userId}/profiles/${profileId}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (userId, profileId) =>
    apiFetch(`/users/${userId}/profiles/${profileId}`, { method: 'DELETE' }),
};

// ── Products ───────────────────────────────────────────
const Products = {
  list: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiFetch(`/products${params ? '?' + params : ''}`);
  },

  get: (productId) => apiFetch(`/products/${productId}`),

  // includes ProductVariants
  variants: (productId) => apiFetch(`/products/${productId}/variants`),
};

// ── Reviews ────────────────────────────────────────────
const Reviews = {
  forProduct: (productId) => apiFetch(`/products/${productId}/reviews`),

  create: (data) =>
    apiFetch('/reviews', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Recommendations ────────────────────────────────────
const Recommendations = {
  get: (userId, profileId) =>
    apiFetch(`/users/${userId}/recommendations?profileId=${profileId}`),
};

// ── Affiliate Links ────────────────────────────────────
const Affiliates = {
  click: (linkId) =>
    apiFetch(`/affiliates/${linkId}/click`, { method: 'POST' }),
};