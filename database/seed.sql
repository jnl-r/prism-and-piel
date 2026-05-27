USE prism_and_piel;

-- ---------- USERS ----------
INSERT INTO User (user_id, name, email, password) VALUES
  (1, 'Demo User',           'demo@prism.ph',     'demo'),
  (2, 'Janelle Ranario',     'janelle@email.com', '123'),
  (3, 'Trishia Camalonggay', 'trishia@email.com', '123');

-- ---------- SKIN PROFILES (weak entity: user_id + profile_id) ----------
INSERT INTO SkinProfile
  (user_id, profile_id, profile_label, skintone, undertone, skintype, primary_concern, preferred_finish)
VALUES
  (1, 1, 'Everyday Look',  'Medium', 'Warm',    'Combination', 'Oiliness,Dark Spots', 'Natural'),
  (1, 2, 'Glam Night',     'Tan',    'Warm',    'Dry',         'Dryness,Dullness',    'Dewy'),
  (2, 1, 'Office Routine', 'Light',  'Neutral', 'Normal',      'Dullness',            'Satin');

-- ---------- PRODUCTS (brand_name is a plain column) ----------
INSERT INTO Product
  (product_id, brand_name, product_name, category, formula_type, finish, description, image_url)
VALUES
  (1, 'BLK Cosmetics', 'Fresh Radiant Glow Filter Foundation', 'Base', 'Liquid', 'Dewy',
      'A radiant glow-filter foundation, 30 ml, for a luminous skin-like finish.', ''),
  (2, 'BLK Cosmetics', 'Creamy All-Over Paint Blush', 'Blush', 'Liquid', 'Dewy',
      'A creamy liquid blush formulated without parabens, phthalates, SLS/SLES and artificial fragrance.', ''),
  (3, 'BLK Cosmetics', 'Universal Skin Tint Sun Shield', 'Base', 'Cream', 'Matte',
      'A skin tint with SPF 30 that evens tone while shielding from the sun.', ''),
  (4, 'Absidy Beauty', 'Complexion Blur Translucent Perfecting Powder', 'Base', 'Compact Powder', 'Matte',
      'An oil-controlling, pore-minimizing, long-lasting perfecting powder.', ''),
  (5, 'Absidy Beauty', 'Weightless Touch Concealer', 'Concealer', 'Cream', 'Satin',
      'A medium-to-full coverage concealer for spot-concealing, under-eye brightening and colour-correcting.', ''),
  (6, 'Chu Chu Beauty', 'Heart Blush Duo', 'Blush', 'Powder', 'Matte',
      'A compact dual blush palette with a built-in mirror.', ''),
  (7, 'Ever Bilena', 'Pillow Pop Liquid Blush', 'Blush', 'Liquid', 'Natural',
      'A soft liquid blush that blends into a natural, pillowy flush.', '');

-- ---------- PRODUCT VARIANTS (weak entity: product_id + variant_id) ----------
INSERT INTO ProductVariant
  (product_id, variant_id, shade_name, shade_hex, recommended_undertone)
VALUES
  -- BLK Fresh Radiant Glow Filter Foundation
  (1, 1, 'Oat',          '#E8C9A8', 'Neutral'),
  (1, 2, 'Creme',        '#F0D9BE', 'Neutral'),
  (1, 3, 'Vanilla',      '#EAD0B0', 'Warm'),
  (1, 4, 'Butterscotch', '#C99A6B', 'Warm'),
  (1, 5, 'Sand',         '#D8B48C', 'Neutral'),
  (1, 6, 'Toast',        '#A9764C', 'Warm'),
  -- BLK Creamy All-Over Paint Blush
  (2, 1, 'Reef',         '#E59A86', 'Warm'),
  (2, 2, 'Beach',        '#E8A38C', 'Warm'),
  (2, 3, 'Palm Springs', '#D97E74', 'Cool'),
  (2, 4, 'Coast',        '#E2876F', 'Warm'),
  (2, 5, 'Golden Hour',  '#E0925E', 'Warm'),
  -- BLK Universal Skin Tint Sun Shield
  (3, 1, 'Chestnut',     '#9A6B45', 'Warm'),
  (3, 2, 'Creme',        '#F0D9BE', 'Neutral'),
  (3, 3, 'Linen',        '#EAD7BE', 'Neutral'),
  (3, 4, 'Oat',          '#E8C9A8', 'Neutral'),
  (3, 5, 'Toffee',       '#B07F50', 'Warm'),
  -- Absidy Complexion Blur Powder
  (4, 1, 'Honey',        '#E2B583', 'Warm'),
  (4, 2, 'Milk',         '#F2DCC4', 'Neutral'),
  (4, 3, 'Oat',          '#E8C9A8', 'Neutral'),
  (4, 4, 'Ube',          '#D8B6AE', 'Cool'),
  (4, 5, 'Petal',        '#EBC9BE', 'Cool'),
  -- Absidy Weightless Touch Concealer
  (5, 1, '0N',           '#F0D6BC', 'Neutral'),
  (5, 2, '1W',           '#E7C19A', 'Warm'),
  (5, 3, '2N',           '#D9B488', 'Neutral'),
  (5, 4, '3W',           '#C99A6B', 'Warm'),
  -- Chu Chu Heart Blush Duo
  (6, 1, 'Hey Sugar',    '#E79A88', 'Warm'),
  (6, 2, 'Miss Dolly',   '#DE8296', 'Cool'),
  (6, 3, 'Peachy Pop',   '#E8A077', 'Warm'),
  (6, 4, 'Darling Baby', '#E0A0A0', 'Neutral'),
  -- Ever Bilena Pillow Pop Liquid Blush
  (7, 1, 'Rouge',        '#C8506A', 'Cool'),
  (7, 2, 'Raspberry',    '#B83E5E', 'Cool'),
  (7, 3, 'Fresno',       '#D9785E', 'Warm');

-- ---------- AFFILIATE LINKS ----------
INSERT INTO AffiliateLink
  (link_id, product_id, variant_id, affiliate_url, click_count)
VALUES
  (1, 1, 4, 'https://vt.tiktok.com/blk-foundation-butterscotch', 64),
  (2, 4, 1, 'https://vt.tiktok.com/ZS9Y3TpQedyUP-c3AzV',          120),
  (3, 5, 1, 'https://vt.tiktok.com/ZS9Y3whFYWX1P-bVh1r',          88),
  (4, 6, 1, 'https://vt.tiktok.com/ZS9Y3oxVb3hgV-9B5jg',          73),
  (5, 2, 5, 'https://vt.tiktok.com/blk-blush-goldenhour',         41);

-- ---------- REVIEWS ----------
INSERT INTO Review
  (review_id, user_id, product_id, variant_id, rating, comment, skin_profile_match, created_at)
VALUES
  (1, 1, 1, 4, 4.5, 'Butterscotch melts into my warm undertone perfectly. Glowy but not greasy.', TRUE,  '2026-05-10'),
  (2, 1, 2, 5, 5.0, 'Golden Hour is the prettiest everyday flush. A tiny dab is enough.',          TRUE,  '2026-05-12'),
  (3, 2, 5, 1, 4.0, 'Shade 0N brightens my under-eyes well. Wish it had more deep shades.',        TRUE,  '2026-05-15'),
  (4, 2, 4, 2, 3.5, 'Milk keeps me matte but can look a little dry by afternoon.',                 FALSE, '2026-05-16'),
  (5, 3, 6, 2, 5.0, 'Miss Dolly is such a flattering cool-toned blush for fair skin.',             TRUE,  '2026-05-18'),
  (6, 3, 3, 3, 4.5, 'Linen skin tint evens me out with light, comfortable coverage.',              TRUE,  '2026-05-20');

-- ---------- RECOMMENDATION LOGS ----------
INSERT INTO RecommendationLog
  (log_id, user_id, product_id, variant_id, rank_position, clicked, generated_at)
VALUES
  (1, 1, 1, 4, 1, TRUE,  '2026-05-10'),
  (2, 1, 2, 5, 2, FALSE, '2026-05-10'),
  (3, 1, 3, 1, 3, FALSE, '2026-05-12');