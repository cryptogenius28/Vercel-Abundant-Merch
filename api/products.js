// api/products.js
// Serves products from Supabase to the frontend
// Secrets stay server-side — never exposed to browser

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON = process.env.SUPABASE_ANON;

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return res.status(500).json({ error: "Supabase env vars not configured" });
  }

  try {
    const { category, featured, search, sort, page = 1, limit = 24 } = req.query;

    // Build Supabase REST query
    let url = `${SUPABASE_URL}/rest/v1/products?select=*`;

    // Filters
    if (category) url += `&category=eq.${encodeURIComponent(category)}`;
    if (featured === "true") url += `&featured=eq.true`;
    if (search) url += `&or=(title.ilike.*${encodeURIComponent(search)}*,brand.ilike.*${encodeURIComponent(search)}*,category.ilike.*${encodeURIComponent(search)}*)`;

    // Sort
    if (sort === "price_asc") url += `&order=price.asc`;
    else if (sort === "price_desc") url += `&order=price.desc`;
    else if (sort === "rating") url += `&order=rating.desc`;
    else if (sort === "popular") url += `&order=review_count.desc`;
    else url += `&order=created_at.desc`;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    url += `&limit=${limit}&offset=${offset}`;

    // Fetch from Supabase
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        "Content-Type": "application/json",
        Prefer: "count=exact",
      },
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: "Supabase error", detail: err });
    }

    const products = await response.json();

    // Get total count from header
    const contentRange = response.headers.get("content-range");
    const total = contentRange ? parseInt(contentRange.split("/")[1]) : products.length;

    return res.status(200).json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
