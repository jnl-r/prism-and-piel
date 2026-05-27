USE prism_and_piel;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE RecommendationLog;
TRUNCATE TABLE Review;
TRUNCATE TABLE AffiliateLink;
TRUNCATE TABLE ProductVariant;
TRUNCATE TABLE Product;
TRUNCATE TABLE SkinProfile;
TRUNCATE TABLE User;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users
INSERT INTO User (name, email, password) VALUES
('Ana Reyes',   'ana@email.com',  'hashed_password_1'),
('Bea Santos',  'bea@email.com',  'hashed_password_2'),
('Cara Lim',    'cara@email.com', 'hashed_password_3'),
('Dana Cruz',   'dana@email.com', 'hashed_password_4'),
('Elle Garcia', 'elle@email.com', 'hashed_password_5');

-- 2. SkinProfiles (2 per user)
INSERT INTO SkinProfile (profile_id, user_id, profile_label, skintone, undertone, skintype, primary_concern, preferred_finish) VALUES
(1, 1, 'Summer Profile',  'Medium', 'Warm',    'Oily',        'Acne,Oiliness',      'Matte'),
(2, 1, 'Routine Profile', 'Tan',    'Warm',    'Combination', 'Dark Spots',         'Dewy'),
(1, 2, 'Daily Look',      'Fair',   'Cool',    'Dry',         'Dryness',            'Dewy'),
(2, 2, 'Night Out',       'Light',  'Neutral', 'Normal',      'Dullness',           'Satin'),
(1, 3, 'Everyday',        'Tan',    'Olive',   'Oily',        'Oiliness,Acne',      'Matte'),
(2, 3, 'Post-Beach',      'Deep',   'Warm',    'Combination', 'Dark Spots,Dullness','Natural'),
(1, 4, 'Work Look',       'Light',  'Cool',    'Sensitive',   'Aging',              'Satin'),
(2, 4, 'Weekend Glow',    'Medium', 'Neutral', 'Dry',         'Dryness',            'Dewy'),
(1, 5, 'Bold Look',       'Deep',   'Warm',    'Oily',        'Oiliness',           'Matte'),
(2, 5, 'Natural Look',    'Tan',    'Olive',   'Normal',      'Dark Spots',         'Natural');

-- 3. Products (brand_name as attribute — no separate Brand table)
INSERT INTO Product (product_name, brand_name, category, formula_type, finish, description) VALUES
('All-Out Face Foundation', 'BLK Cosmetics', 'Base',      'Liquid', 'Matte',    'Full coverage liquid foundation for Filipino skin tones'),
('Pro Lip Color',           'BLK Cosmetics', 'Lipstick',  'Cream',  'Satin',    'Long-lasting cream lipstick in Filipino-friendly shades'),
('Fit Me Foundation',       'Maybelline',    'Base',      'Liquid', 'Matte',    'Lightweight foundation that fits your skin tone'),
('SuperStay Lipstick',      'Maybelline',    'Lipstick',  'Liquid', 'Matte',    '24hr transfer-proof liquid lipstick'),
('Stay On Concealer',       'Careline',      'Concealer', 'Liquid', 'Natural',  'Lightweight concealer for dark spots and blemishes'),
('Velvet Foundation',       'Absidy',        'Base',      'Liquid', 'Dewy',     'Hydrating foundation for dry skin types'),
('Blush On',                'Happy Skin',    'Blush',     'Powder', 'Natural',  'Buildable powder blush for Filipino skin');

-- 4. ProductVariants (composite PK: variant_id + product_id)
INSERT INTO ProductVariant (variant_id, product_id, shade_name, shade_hex, recommended_undertone) VALUES
(1, 1, 'Warm Beige',    '#C68642', 'Warm'),
(2, 1, 'Golden Tan',    '#A0522D', 'Warm'),
(3, 1, 'Cool Ivory',    '#F5E6D3', 'Cool'),
(1, 2, 'Berry Flush',   '#8B2252', 'Cool'),
(2, 2, 'Terracotta',    '#C05A2C', 'Warm'),
(1, 3, 'Natural Beige', '#D4A574', 'Neutral'),
(2, 3, 'Sand',          '#C2956C', 'Warm'),
(1, 4, 'Dusty Rose',    '#B5687A', 'Cool'),
(2, 4, 'Brick Red',     '#943126', 'Warm'),
(1, 5, 'Porcelain',     '#F2E0D0', 'Cool'),
(1, 6, 'Honey Glow',    '#C8874B', 'Warm'),
(2, 6, 'Caramel',       '#A0622D', 'Warm'),
(1, 7, 'Coral Bliss',   '#E8735A', 'Warm'),
(2, 7, 'Rosy Pink',     '#D4849A', 'Cool');

-- 5. AffiliateLinks — FIX: now includes product_id to satisfy composite FK
INSERT INTO AffiliateLink (variant_id, product_id, affiliate_url, click_count) VALUES
(1, 1, 'https://tiktokshop.com/blk-warm-beige?aff=prism001',          0),
(2, 1, 'https://tiktokshop.com/blk-golden-tan?aff=prism001',          0),
(1, 3, 'https://tiktokshop.com/maybelline-natural-beige?aff=prism001', 0),
(1, 4, 'https://tiktokshop.com/maybelline-dusty-rose?aff=prism001',    0),
(1, 6, 'https://tiktokshop.com/absidy-honey-glow?aff=prism001',        0),
(1, 7, 'https://tiktokshop.com/happyskin-coral-bliss?aff=prism001',    0);

-- 6. Reviews — FIX: now includes product_id to satisfy composite FK
INSERT INTO Review (user_id, variant_id, product_id, rating, comment, skin_profile_match) VALUES
(1, 1, 1, 4.5, 'Great coverage, stays all day on oily skin!',    TRUE),
(2, 1, 1, 4.0, 'Lightweight and natural finish, love it!',       TRUE),
(3, 2, 1, 5.0, 'Perfect shade for my tan skin!',                 TRUE),
(4, 1, 1, 3.5, 'Good hydration but oxidizes a little',           FALSE),
(5, 2, 2, 4.5, 'The terracotta shade is so flattering!',         TRUE);

-- 7. RecommendationLog — FIX: now includes product_id to satisfy composite FK
INSERT INTO RecommendationLog (user_id, variant_id, product_id, rank_position, clicked) VALUES
(1, 1, 1, 1, TRUE),
(1, 2, 1, 2, FALSE),
(2, 1, 1, 1, TRUE),
(3, 2, 1, 1, FALSE),
(4, 1, 1, 1, TRUE),
(5, 2, 2, 1, FALSE);
