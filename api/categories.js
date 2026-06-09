// api/categories.js
// Returns category list with live product counts from Supabase

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON = process.env.SUPABASE_ANON;

  const CATEGORIES = [
    { slug: "electronics",  name: "Electronics",        image: "https://images.pexels.com/photos/705164/computer-laptop-work-place-camera-705164.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { slug: "home-garden",  name: "Home & Garden",       image: "https://images.unsplash.com/photo-1724582586529-62622e50c0b3?auto=format&fit=crop&w=800&q=80" },
    { slug: "fashion",      name: "Fashion",             image: "https://images.pexels.com/photos/13158675/pexels-photo-13158675.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { slug: "beauty",       name: "Beauty",              image: "https://images.pexels.com/photos/7256102/pexels-photo-7256102.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { slug: "sports",       name: "Sports & Outdoors",   image: "https://images.pexels.com/photos/6740821/pexels-photo-6740821.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { slug: "tools",        name: "Tools & Hardware",    image: "https://images.pexels.com/photos/220639/pexels-photo-220639.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { slug: "toys",         name: "Toys & Games",        image: "https://images.pexels.com/photos/3661193/pexels-photo-3661193.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { slug: "office",       name: "Office & Stationery", image: "https://images.pexels.com/photos/5872176/pexels-photo-5872176.jpeg?auto=compress&cs=tinysrgb&w=800" },
  ];

  try {
    // Get counts per category in one query
    const url = `${SUPABASE_URL}/rest/v1/products?select=category&order=category`;
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
    });

    const rows = await response.json();

    // Count per category
    const counts = {};
    if (Array.isArray(rows)) {
      rows.forEach(({ category }) => {
        counts[category] = (counts[category] || 0) + 1;
      });
    }

    const categories = CATEGORIES.map((c) => ({
      ...c,
      count: counts[c.slug] || 0,
    }));

    return res.status(200).json({ categories });
  } catch (err) {
    // Fallback to static counts if DB fails
    return res.status(200).json({
      categories: CATEGORIES.map((c) => ({ ...c, count: 0 })),
    });
  }
}
