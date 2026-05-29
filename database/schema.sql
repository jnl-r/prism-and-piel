DROP DATABASE IF EXISTS prism_and_piel;
CREATE DATABASE IF NOT EXISTS prism_and_piel;
USE prism_and_piel;

-- ---------- 1. User ----------
CREATE TABLE User (
  user_id    VARCHAR(12) PRIMARY KEY,          -- e.g. USR-001
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------- 2. SkinProfile (weak entity: PK = user_id + profile_id) ----------
CREATE TABLE SkinProfile (
  user_id          VARCHAR(12) NOT NULL,        -- FK -> User (USR-xxx)
  profile_id       INT NOT NULL,               
  profile_label    VARCHAR(50) NOT NULL,
  skintone         ENUM('Fair','Light','Medium','Tan','Deep') NOT NULL,
  undertone        ENUM('Warm','Cool','Neutral','Olive') NOT NULL,
  skintype         ENUM('Oily','Dry','Combination','Normal','Sensitive') NOT NULL,
  primary_concern  SET('Acne','Dark Spots','Dullness','Oiliness','Dryness','Aging') NULL,
  preferred_finish ENUM('Matte','Dewy','Satin','Natural','Shimmer') NULL,
  PRIMARY KEY (user_id, profile_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- ---------- 3. Product ----------
CREATE TABLE Product (
  product_id   VARCHAR(12) PRIMARY KEY,         -- e.g. PRD-001
  brand_name   VARCHAR(100) NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  category     ENUM('Base','Contour','Blush','Eye Palette','Lipstick','Highlighter','Concealer') NOT NULL,
  formula_type VARCHAR(50) NULL,
  finish       ENUM('Matte','Dewy','Satin','Natural','Shimmer') NULL,
  description  TEXT NOT NULL,
  product_img  VARCHAR(500) NULL               
);

-- ---------- 4. ProductVariant (surrogate PK = variant_id) ----------
CREATE TABLE ProductVariant (
  variant_id            VARCHAR(12) PRIMARY KEY, -- surrogate key, e.g. VAR-001
  product_id            VARCHAR(12) NOT NULL,    
  shade_name            VARCHAR(100) NOT NULL,
  shade_hex             VARCHAR(7) NULL,
  product_variant_img   VARCHAR(500) NULL,      
  recommended_undertone VARCHAR(50) NULL,
  FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
);

-- ---------- 5. AffiliateLink ----------
CREATE TABLE AffiliateLink (
  link_id       VARCHAR(12) PRIMARY KEY,         -- e.g. LNK-001
  product_id    VARCHAR(12) NOT NULL,           
  affiliate_url VARCHAR(500) NOT NULL,
  click_count   INT NOT NULL DEFAULT 0,
  last_updated  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
);

-- ---------- 6. Review ----------
CREATE TABLE Review (
  review_id          VARCHAR(12) PRIMARY KEY,    -- e.g. REV-001
  user_id            VARCHAR(12) NOT NULL,      
  variant_id         VARCHAR(12) NOT NULL,      
  rating             DECIMAL(2,1) NOT NULL CHECK (rating BETWEEN 1.0 AND 5.0),
  comment            TEXT NULL,
  skin_profile_match BOOLEAN NULL,
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES ProductVariant(variant_id) ON DELETE CASCADE
);

-- ---------- 7. RecommendationLog ----------
CREATE TABLE RecommendationLog (
  log_id        VARCHAR(12) PRIMARY KEY,         -- e.g. LOG-001
  user_id       VARCHAR(12) NOT NULL,            
  variant_id    VARCHAR(12) NOT NULL,           
  rank_position INT NULL,
  clicked       BOOLEAN DEFAULT FALSE,
  generated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES ProductVariant(variant_id) ON DELETE CASCADE
);