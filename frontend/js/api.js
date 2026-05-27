const API_BASE = 'http://localhost:3000/api';

/* used by every function below */
async function request(path, method = 'GET', body) {
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  if (!res.ok) {
    let msg = 'Request failed (' + res.status + ').';
    try { const d = await res.json(); if (d.error) msg = d.error; } catch (e) {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch (e) { return {}; }
}

/* ============================================================
   API - each function maps to one real backend route.
   ============================================================ */
const api = {

  // AUTH
  // POST /api/auth/login
  login(email, password) {
    return request('/auth/login', 'POST', { email, password });
  },
  // POST /api/auth/signup
  signup(name, email, password) {
    return request('/auth/signup', 'POST', { name, email, password });
  },

  // USERS
  // GET /api/users
  getUsers() { return request('/users'); },

  // SKIN PROFILES 
  // GET /api/skinprofiles/user/:userId
  getProfiles(userId) { return request('/skinprofiles/user/' + userId); },

  // POST /api/skinprofiles
  // Backend requires profile_id in the body (weak entity). We compute
  // "next profile_id for this user" in views.js before calling this.
  createProfile(data) { return request('/skinprofiles', 'POST', data); },

  // PUT /api/skinprofiles/:userId/:profileId
  updateProfile(userId, profileId, data) {
    return request('/skinprofiles/' + userId + '/' + profileId, 'PUT', data);
  },

  // DELETE /api/skinprofiles/:userId/:profileId
  deleteProfile(userId, profileId) {
    return request('/skinprofiles/' + userId + '/' + profileId, 'DELETE');
  },

  // ---------------- PRODUCTS ----------------
  // GET /api/products
  getProducts() { return request('/products'); },
  // GET /api/products/category/:category
  getProductsByCategory(cat) {
    return request('/products/category/' + encodeURIComponent(cat));
  },

  // ------------- PRODUCT VARIANTS ------------- 
  // GET /api/variants
  getVariants() { return request('/variants'); },
  // GET /api/variants/product/:productId
  getVariantsForProduct(productId) {
    return request('/variants/product/' + productId);
  },

  // ------------- AFFILIATE LINKS ------------- 
  // GET /api/affiliatelinks
  getLinks() { return request('/affiliatelinks'); },
  // PUT /api/affiliatelinks/click/:linkId
  clickLink(linkId) { return request('/affiliatelinks/click/' + linkId, 'PUT'); },

  // ------------- RECOMMENDATIONS ------------- 
  // POST /api/recommendations/generate/:userId   body: { profile_id }
  // Backend matches variants to the profile and logs them.
  generateRecommendations(userId, profileId) {
    return request('/recommendations/generate/' + userId, 'POST', { profile_id: profileId });
  },
  // PUT /api/recommendations/click/:logId
  markRecommendationClicked(logId) {
    return request('/recommendations/click/' + logId, 'PUT');
  },

  // ---------------- REVIEWS ----------------
  // GET /api/reviews
  getReviews() { return request('/reviews'); },
  // GET /api/reviews/variant/:productId/:variantId
  getReviewsForVariant(productId, variantId) {
    return request('/reviews/variant/' + productId + '/' + variantId);
  },
  // POST /api/reviews
  createReview(data) { return request('/reviews', 'POST', data); },
};

/* ============================================================
   ENUMS — mirror the ENUM/SET values in schema.sql.
   ============================================================ */
const ENUMS = {
  skintone:        ['Fair', 'Light', 'Medium', 'Tan', 'Deep'],
  undertone:       ['Warm', 'Cool', 'Neutral', 'Olive'],
  skintype:        ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'],
  primary_concern: ['Acne', 'Dark Spots', 'Dullness', 'Oiliness', 'Dryness', 'Aging'],
  finish:          ['Matte', 'Dewy', 'Satin', 'Natural', 'Shimmer'],
  category:        ['Base', 'Contour', 'Blush', 'Eye Palette', 'Lipstick', 'Highlighter', 'Concealer'],
};