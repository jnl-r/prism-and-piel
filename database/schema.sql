CREATE DATABASE IF NOT EXISTS prism_and_piel;
USE prism_and_piel;

DROP TABLE IF EXISTS RecommendationLog;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS AffiliateLink;
DROP TABLE IF EXISTS ProductVariant;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS SkinProfile;
DROP TABLE IF EXISTS User;

-- 1. User
CREATE TABLE User (
  user_id   INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(100) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. SkinProfile (weak entity, composite PK: profile_id + user_id)
CREATE TABLE SkinProfile (
  profile_id      INT          NOT NULL,
  user_id         INT          NOT NULL,                          -- was missing
  profile_label   VARCHAR(100) NOT NULL,                         -- was missing
  skintone        ENUM('Fair','Light','Medium','Tan','Deep') NOT NULL,
  undertone       ENUM('Warm','Cool','Neutral','Olive')      NOT NULL,
  skintype        ENUM('Oily','Dry','Combination','Normal','Sensitive') NOT NULL,
  primary_concern SET('Acne','Dark Spots','Dullness','Oiliness','Dryness','Aging') NULL,
  preferred_finish ENUM('Matte','Dewy','Satin','Natural','Shimmer') NULL,
  PRIMARY KEY (profile_id, user_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- 3. Product
CREATE TABLE Product (
  product_id   INT AUTO_INCREMENT PRIMARY KEY,
  brand_name   VARCHAR(100) NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  category     ENUM('Base','Contour','Blush','Eye Palette','Lipstick','Highlighter','Concealer') NOT NULL,
  formula_type VARCHAR(50)  NULL,
  finish       ENUM('Matte','Dewy','Satin','Natural','Shimmer') NULL,
  description  TEXT         NOT NULL
);

-- 4. ProductVariant
CREATE TABLE ProductVariant (
  variant_id           INT          NOT NULL,
  product_id           INT          NOT NULL,
  shade_name           VARCHAR(100) NOT NULL,
  shade_hex            VARCHAR(7)   NULL,
  recommended_undertone VARCHAR(50) NULL,
  PRIMARY KEY (variant_id, product_id),
  FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
);

-- 5. AffiliateLink
CREATE TABLE AffiliateLink (
  link_id       INT AUTO_INCREMENT PRIMARY KEY,
  variant_id    INT          NOT NULL,
  product_id    INT          NOT NULL,
  affiliate_url VARCHAR(500) NOT NULL,
  click_count   INT          NOT NULL DEFAULT 0,
  last_updated  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id, product_id) REFERENCES ProductVariant(variant_id, product_id) ON DELETE CASCADE
);

-- 6. Review
CREATE TABLE Review (
  review_id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT            NOT NULL,
  variant_id         INT            NOT NULL,
  product_id         INT            NOT NULL,
  rating             DECIMAL(2,1)   NOT NULL CHECK (rating BETWEEN 1.0 AND 5.0),
  comment            TEXT           NULL,
  skin_profile_match BOOLEAN        NULL,
  created_at         DATETIME       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id, product_id) REFERENCES ProductVariant(variant_id, product_id) ON DELETE CASCADE
);

-- 7. RecommendationLog
--    FIX: FK now correctly references the composite PK (variant_id, product_id);
--         added product_id column
CREATE TABLE RecommendationLog (
  log_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT      NOT NULL,
  variant_id   INT      NOT NULL,
  product_id   INT      NOT NULL,
  rank_position INT     NULL,
  clicked      BOOLEAN  DEFAULT FALSE,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id, product_id) REFERENCES ProductVariant(variant_id, product_id) ON DELETE CASCADE
);
