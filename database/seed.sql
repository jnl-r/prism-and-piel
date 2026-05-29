USE prism_and_piel;

-- ---------- USERS (USR-xxx) ----------
INSERT INTO User (user_id, name, email, password) VALUES
  ('USR-001', 'Demo User',           'demo@prism.ph',     'demo'),
  ('USR-002', 'Janelle Ranario',     'janelle@email.com', '123'),
  ('USR-003', 'Trishia Camalonggay', 'trishia@email.com', '123');

-- ---------- SKIN PROFILES (weak entity: user_id + profile_id) ----------
INSERT INTO SkinProfile
  (user_id, profile_id, profile_label, skintone, undertone, skintype, primary_concern, preferred_finish)
VALUES
  ('USR-001', 1, 'Everyday Look',  'Medium', 'Warm',    'Combination', 'Oiliness,Dark Spots', 'Natural'),
  ('USR-001', 2, 'Glam Night',     'Tan',    'Warm',    'Dry',         'Dryness,Dullness',    'Dewy'),
  ('USR-002', 1, 'Office Routine', 'Light',  'Neutral', 'Normal',      'Dullness',            'Satin');

-- ---------- PRODUCTS (PRD-xxx) ----------
INSERT INTO Product
  (product_id, brand_name, product_name, category, formula_type, finish, description, product_img)
VALUES
  ('PRD-001', 'BLK Cosmetics', 'Fresh Radiant Glow Filter Foundation', 'Base', 'Liquid', 'Dewy',
      'A radiant glow-filter foundation, 30 ml, for a luminous skin-like finish.', 'https://placehold.co/600x600/F8A8B9/ffffff?text=BLK+Glow+Filter'),
  ('PRD-002', 'BLK Cosmetics', 'Creamy All-Over Paint Blush', 'Blush', 'Liquid', 'Dewy',
      'A creamy liquid blush formulated without parabens, phthalates, SLS/SLES and artificial fragrance.', 'https://placehold.co/600x600/F8A8B9/ffffff?text=BLK+Paint+Blush'),
  ('PRD-003', 'BLK Cosmetics', 'Universal Skin Tint Sun Shield', 'Base', 'Cream', 'Matte',
      'A skin tint with SPF 30 that evens tone while shielding from the sun.', 'https://placehold.co/600x600/F8A8B9/ffffff?text=BLK+Skin+Tint'),
  ('PRD-004', 'Absidy Beauty', 'Complexion Blur Translucent Perfecting Powder', 'Base', 'Compact Powder', 'Matte',
      'An oil-controlling, pore-minimizing, long-lasting perfecting powder.', 'https://placehold.co/600x600/F8A8B9/ffffff?text=Absidy+Blur+Powder'),
  ('PRD-005', 'Absidy Beauty', 'Weightless Touch Concealer', 'Concealer', 'Cream', 'Satin',
      'A medium-to-full coverage concealer for spot-concealing, under-eye brightening and colour-correcting.', 'https://placehold.co/600x600/F8A8B9/ffffff?text=Absidy+Concealer'),
  ('PRD-006', 'Chu Chu Beauty', 'Heart Blush Duo', 'Blush', 'Powder', 'Matte',
      'A compact dual blush palette with a built-in mirror.', 'https://placehold.co/600x600/F8A8B9/ffffff?text=ChuChu+Heart+Blush'),
  ('PRD-007', 'Ever Bilena', 'Pillow Pop Liquid Blush', 'Blush', 'Liquid', 'Natural',
      'A soft liquid blush that blends into a natural, pillowy flush.', 'https://placehold.co/600x600/F8A8B9/ffffff?text=EB+Pillow+Pop');

-- ---------- PRODUCT VARIANTS (surrogate VAR-xxx; product_id is an FK) ----------
INSERT INTO ProductVariant
  (variant_id, product_id, shade_name, shade_hex, product_variant_img, recommended_undertone)
VALUES
  ('VAR-001', 'PRD-001', 'Oat', '#E8C9A8', '/assets/VAR_001.png', 'Neutral'),
  ('VAR-002', 'PRD-001', 'Creme', '#F0D9BE', '/assets/VAR_002.png', 'Neutral'),
  ('VAR-003', 'PRD-001', 'Vanilla', '#EAD0B0', '/assets/VAR_003.png', 'Warm'),
  ('VAR-004', 'PRD-001', 'Butterscotch', '#C99A6B', '/assets/VAR_004.png', 'Warm'),
  ('VAR-005', 'PRD-001', 'Sand', '#D8B48C', '/assets/VAR_005.png', 'Neutral'),
  ('VAR-006', 'PRD-001', 'Toast', '#A9764C', '/assets/VAR_006.png', 'Warm'),
  ('VAR-007', 'PRD-002', 'Reef', '#E59A86', '/assets/VAR_007.png', 'Warm'),
  ('VAR-008', 'PRD-002', 'Beach', '#E8A38C', '/assets/VAR_008.png', 'Warm'),
  ('VAR-009', 'PRD-002', 'Palm Springs', '#D97E74', '/assets/VAR_009.png', 'Cool'),
  ('VAR-010', 'PRD-002', 'Coast', '#E2876F', '/assets/VAR_010.png', 'Warm'),
  ('VAR-011', 'PRD-002', 'Golden Hour', '#E0925E', '/assets/VAR_011.png', 'Warm'),
  ('VAR-012', 'PRD-003', 'Chestnut', '#9A6B45', '/assets/VAR_012.png', 'Warm'),
  ('VAR-013', 'PRD-003', 'Creme', '#F0D9BE', '/assets/VAR_013.png', 'Neutral'),
  ('VAR-014', 'PRD-003', 'Linen', '#EAD7BE', '/assets/VAR_014.png', 'Neutral'),
  ('VAR-015', 'PRD-003', 'Oat', '#E8C9A8', '/assets/VAR_015.png', 'Neutral'),
  ('VAR-016', 'PRD-003', 'Toffee', '#B07F50', '/assets/VAR_016.png', 'Warm'),
  ('VAR-017', 'PRD-004', 'Honey', '#E2B583', '/assets/VAR_017.png', 'Warm'),
  ('VAR-018', 'PRD-004', 'Milk', '#F2DCC4', '/assets/VAR_018.png', 'Neutral'),
  ('VAR-019', 'PRD-004', 'Oat', '#E8C9A8', '/assets/VAR_019.png', 'Neutral'),
  ('VAR-020', 'PRD-004', 'Ube', '#D8B6AE', '/assets/VAR_020.png', 'Cool'),
  ('VAR-021', 'PRD-004', 'Petal', '#EBC9BE', '/assets/VAR_021.png', 'Cool'),
  ('VAR-022', 'PRD-005', '0N', '#F0D6BC', '/assets/VAR_022.png', 'Neutral'),
  ('VAR-023', 'PRD-005', '1W', '#E7C19A', '/assets/VAR_023.png', 'Warm'),
  ('VAR-024', 'PRD-005', '2N', '#D9B488', '/assets/VAR_024.png', 'Neutral'),
  ('VAR-025', 'PRD-005', '3W', '#C99A6B', '/assets/VAR_025.png', 'Warm'),
  ('VAR-026', 'PRD-006', 'Hey Sugar', '#E79A88', '/assets/VAR_026.png', 'Warm'),
  ('VAR-027', 'PRD-006', 'Miss Dolly', '#DE8296', '/assets/VAR_027.png', 'Cool'),
  ('VAR-028', 'PRD-006', 'Peachy Pop', '#E8A077', '/assets/VAR_028.png', 'Warm'),
  ('VAR-029', 'PRD-006', 'Darling Baby', '#E0A0A0', '/assets/VAR_029.png', 'Neutral'),
  ('VAR-030', 'PRD-007', 'Toast of New York', '#E8807B', '/assets/VAR_030.png', 'Cool'),
  ('VAR-031', 'PRD-007', 'Raspberry', '#B83E5E', '/assets/VAR_031.png', 'Cool'),
  ('VAR-032', 'PRD-007', 'Fresno', '#D9785E', '/assets/VAR_032.png', 'Warm'),
  ('VAR-033', 'PRD-002', 'Summer Time', '#B8604B', '/assets/VAR_033.png', 'Warm'),
  ('VAR-034', 'PRD-002', 'Poolside', '#A83720', '/assets/VAR_034.png', 'Warm'),
  ('VAR-035', 'PRD-003', 'Sand', '#E5C5AA', '/assets/VAR_035.png', 'Neutral'),
  ('VAR-036', 'PRD-003', 'Toast', '#D4A074', '/assets/VAR_036.png', 'Neutral'),
  ('VAR-037', 'PRD-003', 'Vanilla', '#F5D7BA', '/assets/VAR_037.png', 'Cool'),
  ('VAR-038', 'PRD-004', 'Banana Pudding', '#F5E5C6', '/assets/VAR_038.png', 'Warm'),
  ('VAR-039', 'PRD-005', '1NW', '#E8C9B7', '/assets/VAR_039.png', 'Neutral'),
  ('VAR-040', 'PRD-005', '2W', '#968874', '/assets/VAR_040.png', 'Warm'),
  ('VAR-041', 'PRD-006', 'Bubblegum Kiss', '#CC70B6', '/assets/VAR_041.png', 'Neutral'),
  ('VAR-042', 'PRD-006', 'Chiffon Dream', '#FFE4E3', '/assets/VAR_042.png', 'Neutral');

-- ---------- AFFILIATE LINKS (LNK-xxx) ----------
INSERT INTO AffiliateLink
  (link_id, product_id, affiliate_url, click_count)
VALUES
  ('LNK-001', 'PRD-001', 'https://vt.tiktok.com/ZS9Y3vTUBK6Co-fqn9r/', 64),
  ('LNK-002', 'PRD-002', 'https://vt.tiktok.com/ZS9Y33KGGCejs-OQEln/', 41),
  ('LNK-003', 'PRD-003', 'https://www.tiktok.com/@prismandpiel/sample-skin-tint', 17),
  ('LNK-004', 'PRD-004', 'https://vt.tiktok.com/ZS9Y3TpQedyUP-c3AzV', 120),
  ('LNK-005', 'PRD-005', 'https://vt.tiktok.com/ZS9Y3whFYWX1P-bVh1r', 88),
  ('LNK-006', 'PRD-006', 'https://vt.tiktok.com/ZS9Y3oxVb3hgV-9B5jg', 73),
  ('LNK-007', 'PRD-007', 'https://www.tiktok.com/@prismandpiel/sample-pillow-pop', 9);

-- ---------- REVIEWS (REV-xxx) ----------
INSERT INTO Review
  (review_id, user_id, variant_id, rating, comment, skin_profile_match, created_at)
VALUES
  ('REV-001', 'USR-001', 'VAR-004', 4.5, 'Butterscotch melts into my warm undertone perfectly. Glowy but not greasy.', TRUE, '2026-05-10'),
  ('REV-002', 'USR-001', 'VAR-011', 5.0, 'Golden Hour is the prettiest everyday flush. A tiny dab is enough.', TRUE, '2026-05-12'),
  ('REV-003', 'USR-002', 'VAR-022', 4.0, 'Shade 0N brightens my under-eyes well. Wish it had more deep shades.', TRUE, '2026-05-15'),
  ('REV-004', 'USR-002', 'VAR-018', 3.5, 'Milk keeps me matte but can look a little dry by afternoon.', FALSE, '2026-05-16'),
  ('REV-005', 'USR-003', 'VAR-027', 5.0, 'Miss Dolly is such a flattering cool-toned blush for fair skin.', TRUE, '2026-05-18'),
  ('REV-006', 'USR-003', 'VAR-014', 4.5, 'Linen skin tint evens me out with light, comfortable coverage.', TRUE, '2026-05-20');

-- ---------- RECOMMENDATION LOGS (LOG-xxx) ----------
INSERT INTO RecommendationLog
  (log_id, user_id, variant_id, rank_position, clicked, generated_at)
VALUES
  ('LOG-001', 'USR-001', 'VAR-004', 1, TRUE, '2026-05-10'),
  ('LOG-002', 'USR-001', 'VAR-011', 2, FALSE, '2026-05-10'),
  ('LOG-003', 'USR-001', 'VAR-012', 3, FALSE, '2026-05-12');