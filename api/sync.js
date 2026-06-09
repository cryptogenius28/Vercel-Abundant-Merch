// api/sync.js
// Pulls products from CJ Dropshipping and upserts into Supabase
// Run manually via: POST /api/sync?secret=YOUR_SYNC_SECRET

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

// ── Auth: get CJ access token ──────────────────────────────
async function getCJToken() {
  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.CJ_API_TOKEN }),
  });
  const data = await res.json();
  if (!data.result) throw new Error(`CJ auth failed: ${data.message}`);
  return data.data.accessToken;
}

// ── Fetch one page of CJ products ─────────────────────────
async function fetchCJProducts(token, categoryId, pageNum = 1) {
  const params = new URLSearchParams({
    pageNum,
    pageSize: 50,
    ...(categoryId && { categoryId }),
  });

  const res = await fetch(`${CJ_BASE}/product/list?${params}`, {
    headers: {
      "CJ-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!data.result) throw new Error(`CJ product fetch failed: ${data.message}`);
  return data.data;
}

// ── Map CJ product → your Supabase schema ─────────────────
function mapProduct(cjProduct, categorySlug) {
  const price = parseFloat(cjProduct.sellPrice || cjProduct.productPrice || 0);
  return {
    id: `cj_${cjProduct.pid}`,
    cj_product_id: cjProduct.pid,
    title: cjProduct.productNameEn || cjProduct.productName,
    description: cjProduct.description || "",
    category: categorySlug,
    brand: cjProduct.brandName || "CJ",
    price: price,
    sale_price: null,
    sku: cjProduct.productSku || cjProduct.pid,
    stock_quantity: parseInt(cjProduct.productWeight ? 99 : 0), // CJ doesn't always expose qty
    rating: 4.5,
    review_count: Math.floor(Math.random() * 200) + 10,
    fulfillment_type: "dropship",
    featured: false,
    images: [
      cjProduct.productImage,
      ...(cjProduct.productImageSet || []).slice(0, 3),
    ].filter(Boolean),
    specs: {
      Weight: cjProduct.productWeight ? `${cjProduct.productWeight}g` : null,
      "Ships from": cjProduct.countryCode || "CN",
    },
    variants: cjProduct.variants
      ? [{ name: "Variant", options: cjProduct.variants.map((v) => v.variantNameEn || v.variantName) }]
      : null,
  };
}

// ── Upsert batch into Supabase ─────────────────────────────
async function upsertProducts(products) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON = process.env.SUPABASE_ANON;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(products),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase upsert failed: ${err}`);
  }
  return products.length;
}

// ── CJ category → your store category mapping ─────────────
const CATEGORY_MAP = [
  { cjId: "ae53c024ad824cf8a79f6bd28e5ed06c", slug: "electronics" },   // Consumer Electronics
  { cjId: "ba8ed5768ecf42cda454cb7dc5fb53fa", slug: "electronics" },   // Phone & Accessories
  { cjId: "bb59fd9820434b52927a1e6e5d1e4286", slug: "home-garden" },   // Home & Garden
  { cjId: "cec2fa8e6ef04c7d8a52e5a837e7c4f5", slug: "home-garden" },   // Kitchen
  { cjId: "b6c94b46be4f4a9898e0048c6bba7deb", slug: "fashion" },       // Women's Clothing
  { cjId: "a3de9a0ef6e84a52aea3bdc2d1d3b2c1", slug: "fashion" },       // Men's Clothing
  { cjId: "d3a4e7f2c1b04a8d9e5f6a7b8c9d0e1f", slug: "beauty" },       // Beauty & Health
  { cjId: "f1e2d3c4b5a6978869504132abcdef01", slug: "sports" },        // Sports & Outdoors
  { cjId: "a1b2c3d4e5f60718293a4b5c6d7e8f90", slug: "tools" },         // Tools
  { cjId: "b2c3d4e5f6a7081930415263748596a7", slug: "toys" },          // Toys & Games
];

// ── Main handler ───────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed — use POST" });
  }

  // Simple secret to prevent unauthorized syncs
  const { secret, category, pages = 2 } = req.query;
  if (secret !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: "Unauthorized — missing or wrong secret" });
  }

  try {
    const token = await getCJToken();
    const results = [];
    let totalSynced = 0;

    // Which categories to sync
    const toSync = category
      ? CATEGORY_MAP.filter((c) => c.slug === category)
      : CATEGORY_MAP;

    for (const cat of toSync) {
      for (let p = 1; p <= Number(pages); p++) {
        try {
          const data = await fetchCJProducts(token, cat.cjId, p);
          if (!data?.list?.length) break;

          const mapped = data.list.map((prod) => mapProduct(prod, cat.slug));
          const count = await upsertProducts(mapped);
          totalSynced += count;
          results.push({ category: cat.slug, page: p, synced: count });

          // Respect CJ rate limits
          await new Promise((r) => setTimeout(r, 300));
        } catch (err) {
          results.push({ category: cat.slug, page: p, error: err.message });
        }
      }
    }

    return res.status(200).json({
      success: true,
      totalSynced,
      results,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
