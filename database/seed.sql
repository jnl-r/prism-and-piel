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
  ('VAR-001', 'PRD-001', 'Oat', '#E8C9A8', 'https://placehold.co/600x600/E8C9A8/ffffff?text=Oat', 'Neutral'),
  ('VAR-002', 'PRD-001', 'Creme', '#F0D9BE', 'https://placehold.co/600x600/F0D9BE/ffffff?text=Creme', 'Neutral'),
  ('VAR-003', 'PRD-001', 'Vanilla', '#EAD0B0', 'https://placehold.co/600x600/EAD0B0/ffffff?text=Vanilla', 'Warm'),
  ('VAR-004', 'PRD-001', 'Butterscotch', '#C99A6B', 'https://placehold.co/600x600/C99A6B/ffffff?text=Butterscotch', 'Warm'),
  ('VAR-005', 'PRD-001', 'Sand', '#D8B48C', 'https://placehold.co/600x600/D8B48C/ffffff?text=Sand', 'Neutral'),
  ('VAR-006', 'PRD-001', 'Toast', '#A9764C', 'https://placehold.co/600x600/A9764C/ffffff?text=Toast', 'Warm'),
  ('VAR-007', 'PRD-002', 'Reef', '#E59A86', 'https://placehold.co/600x600/E59A86/ffffff?text=Reef', 'Warm'),
  ('VAR-008', 'PRD-002', 'Beach', '#E8A38C', 'https://placehold.co/600x600/E8A38C/ffffff?text=Beach', 'Warm'),
  ('VAR-009', 'PRD-002', 'Palm Springs', '#D97E74', 'https://placehold.co/600x600/D97E74/ffffff?text=Palm+Springs', 'Cool'),
  ('VAR-010', 'PRD-002', 'Coast', '#E2876F', 'https://placehold.co/600x600/E2876F/ffffff?text=Coast', 'Warm'),
  ('VAR-011', 'PRD-002', 'Golden Hour', '#E0925E', 'https://placehold.co/600x600/E0925E/ffffff?text=Golden+Hour', 'Warm'),
  ('VAR-012', 'PRD-003', 'Chestnut', '#9A6B45', 'https://placehold.co/600x600/9A6B45/ffffff?text=Chestnut', 'Warm'),
  ('VAR-013', 'PRD-003', 'Creme', '#F0D9BE', 'https://placehold.co/600x600/F0D9BE/ffffff?text=Creme', 'Neutral'),
  ('VAR-014', 'PRD-003', 'Linen', '#EAD7BE', 'https://placehold.co/600x600/EAD7BE/ffffff?text=Linen', 'Neutral'),
  ('VAR-015', 'PRD-003', 'Oat', '#E8C9A8', 'https://placehold.co/600x600/E8C9A8/ffffff?text=Oat', 'Neutral'),
  ('VAR-016', 'PRD-003', 'Toffee', '#B07F50', 'https://placehold.co/600x600/B07F50/ffffff?text=Toffee', 'Warm'),
  ('VAR-017', 'PRD-004', 'Honey', '#E2B583', 'https://placehold.co/600x600/E2B583/ffffff?text=Honey', 'Warm'),
  ('VAR-018', 'PRD-004', 'Milk', '#F2DCC4', 'https://placehold.co/600x600/F2DCC4/ffffff?text=Milk', 'Neutral'),
  ('VAR-019', 'PRD-004', 'Oat', '#E8C9A8', 'https://placehold.co/600x600/E8C9A8/ffffff?text=Oat', 'Neutral'),
  ('VAR-020', 'PRD-004', 'Ube', '#D8B6AE', 'https://placehold.co/600x600/D8B6AE/ffffff?text=Ube', 'Cool'),
  ('VAR-021', 'PRD-004', 'Petal', '#EBC9BE', 'https://placehold.co/600x600/EBC9BE/ffffff?text=Petal', 'Cool'),
  ('VAR-022', 'PRD-005', '0N', '#F0D6BC', 'https://placehold.co/600x600/F0D6BC/ffffff?text=0N', 'Neutral'),
  ('VAR-023', 'PRD-005', '1W', '#E7C19A', 'https://placehold.co/600x600/E7C19A/ffffff?text=1W', 'Warm'),
  ('VAR-024', 'PRD-005', '2N', '#D9B488', 'https://placehold.co/600x600/D9B488/ffffff?text=2N', 'Neutral'),
  ('VAR-025', 'PRD-005', '3W', '#C99A6B', 'https://placehold.co/600x600/C99A6B/ffffff?text=3W', 'Warm'),
  ('VAR-026', 'PRD-006', 'Hey Sugar', '#E79A88', 'https://placehold.co/600x600/E79A88/ffffff?text=Hey+Sugar', 'Warm'),
  ('VAR-027', 'PRD-006', 'Miss Dolly', '#DE8296', 'https://placehold.co/600x600/DE8296/ffffff?text=Miss+Dolly', 'Cool'),
  ('VAR-028', 'PRD-006', 'Peachy Pop', '#E8A077', 'https://placehold.co/600x600/E8A077/ffffff?text=Peachy+Pop', 'Warm'),
  ('VAR-029', 'PRD-006', 'Darling Baby', '#E0A0A0', 'https://placehold.co/600x600/E0A0A0/ffffff?text=Darling+Baby', 'Neutral'),
  ('VAR-030', 'PRD-007', 'Rouge', '#C8506A', 'https://placehold.co/600x600/C8506A/ffffff?text=Rouge', 'Cool'),
  ('VAR-031', 'PRD-007', 'Raspberry', '#B83E5E', 'https://placehold.co/600x600/B83E5E/ffffff?text=Raspberry', 'Cool'),
  ('VAR-032', 'PRD-007', 'Fresno', '#D9785E', 'https://placehold.co/600x600/D9785E/ffffff?text=Fresno', 'Warm');

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