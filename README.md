<div align="center">

<img src="docs/readme/banner.png" alt="Prism & Piel: Find the shade that was made for your skin" width="100%">

<br>

![TikTok Shop](https://img.shields.io/badge/Shop_on-TikTok_Shop-E98AA0?style=for-the-badge&logo=tiktok&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4A3B3F?style=for-the-badge&logo=mysql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-4A3B3F?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4A3B3F?style=for-the-badge&logo=express&logoColor=white)

</div>

<br>

<img src="docs/readme/h-why.png" alt="Why Prism & Piel" width="100%">

Most shade finders are built for Western skin and global brands. Filipino skin lives in the light-to-tan range with warm, neutral and olive undertones, and the brands we actually buy are sold on TikTok Shop. **Prism & Piel matches you to those shades and sends you straight to the listing.**

<br>

<img src="docs/readme/h-how.png" alt="How it works" width="100%">

<img src="docs/readme/step-1.png" alt="01 Save your skin" width="100%">

Skintone, undertone, skin type and finish. Keep a profile for every look, like an Everyday Look and a Glam Night.

<img src="docs/readme/profiles.png" alt="Skin profiles page" width="100%">

<img src="docs/readme/step-2.png" alt="02 Get matched" width="100%">

Pick a profile and Prism & Piel ranks every shade that fits your undertone and finish.

<img src="docs/readme/matches.png" alt="Find My Shade results" width="100%">

<img src="docs/readme/step-3.png" alt="03 Shop it on TikTok" width="100%">

<img src="docs/readme/tiktok-shop.png" alt="Shop on TikTok: every product links to its TikTok Shop listing through an affiliate link" width="100%">

<br>

<img src="docs/readme/h-browse.png" alt="Browse freely" width="100%">

No account needed. Filter by category or brand, swipe through every shade, and shop. Sign in and your home page shows your top picks.

<img src="docs/readme/catalog.png" alt="Product catalog" width="100%">

<img src="docs/readme/home.png" alt="Home page with top shade picks" width="100%">

<br>

<img src="docs/readme/h-database.png" alt="A database project" width="100%">

Prism & Piel runs on a relational MySQL database. Products, shades, skin profiles, reviews, recommendations and TikTok Shop links live in **7 normalized tables**, and the shade matching is a single SQL query.

<img src="database/erd/physical-erd.png" alt="Physical ERD" width="100%">

<details>
<summary><b>Tables</b></summary>

| Table | Holds |
|---|---|
| `User` | Accounts |
| `SkinProfile` | Saved skin profiles (weak entity, PK `user_id + profile_id`) |
| `Product` | Product lines |
| `ProductVariant` | Each shade, with hex color and best undertone |
| `AffiliateLink` | The TikTok Shop link and click count for each product |
| `Review` | Ratings per shade |
| `RecommendationLog` | Every shade recommended to a user, with rank |

</details>

<details>
<summary><b>The matching query</b></summary>

```sql
SELECT pv.variant_id, pv.shade_name, p.product_name, p.brand_name,
       COALESCE(AVG(r.rating), 0) AS avg_rating
FROM ProductVariant pv
JOIN Product p     ON p.product_id = pv.product_id
LEFT JOIN Review r ON r.variant_id = pv.variant_id
WHERE pv.recommended_undertone = ?
  AND (p.finish = ? OR p.finish IS NULL)
GROUP BY pv.variant_id
ORDER BY avg_rating DESC
LIMIT 10;
```

</details>

<details>
<summary><b>Run it locally</b></summary>

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Create `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=prism_and_piel
```

```bash
cd backend
npm install
npm start
```

Open http://localhost:3000 and sign in with `demo@prism.ph` / `demo`.

</details>

<br>

<img src="docs/readme/footer.png" alt="Prism & Piel: made for every undertone" width="100%">
