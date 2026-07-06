// ───────────────────────────────────────────────────────────────────────
// Demo seed data — sample catalog for SUCE (sarees, kurtis, women's
// western wear, kids wear) at two price tiers, matching the shapes the
// real backend (Phase 1 schema) will return.
//
// WHERE TO CHANGE: edit this file to add/remove/reprice demo products —
// it has zero effect once DEMO_MODE is false (see src/demo/config.js).
// ───────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: 1, name: 'Sarees', slug: 'sarees' },
  { id: 2, name: 'Kurtis & Suits', slug: 'kurtis-suits' },
  { id: 3, name: "Women's Western Wear", slug: 'womens-western' },
  { id: 4, name: 'Kids Wear', slug: 'kids-wear' },
]

const BRAND = { id: 1, name: 'SUCE Label' }

function categoryFor(slug) {
  return CATEGORIES.find((c) => c.slug === slug)
}

function img(slug) {
  return [{ url: `/products/${slug}.jpg`, isPrimary: true }]
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// price = original price, discountPrice = sale price (null when no sale).
// Effective price for "Under ₹499" / "Premium Edit" sorting is
// `discountPrice ?? price`, same rule the rest of the app uses.
const RAW_PRODUCTS = [
  // ── Sarees ────────────────────────────────────────────────────────
  { slug: 'maroon-zari-border-cotton-saree', name: 'Maroon Zari-Border Cotton Saree', category: 'sarees',
    price: 2199, discountPrice: 1799, stock: 18, sku: 'SUC-SAR-101', rating: 4.6, reviews: 128, sizes: ['Free Size'], age: 4,
    description: 'Handloom cotton with a traditional zari border — pairs easily with a contrast blouse for festive days that still need to be comfortable.' },
  { slug: 'mustard-yellow-printed-saree', name: 'Mustard Yellow Printed Saree', category: 'sarees',
    price: 599, discountPrice: 499, stock: 32, sku: 'SUC-SAR-102', rating: 4.2, reviews: 64, sizes: ['Free Size'], age: 11,
    description: 'An everyday printed saree in breathable georgette — easy to drape, easier to wear through a full day.' },
  { slug: 'banarasi-silk-blend-saree-emerald', name: 'Banarasi Silk-Blend Saree, Emerald', category: 'sarees',
    price: 1999, discountPrice: null, stock: 9, sku: 'SUC-SAR-103', rating: 4.8, reviews: 212, sizes: ['Free Size'], age: 21,
    description: 'Woven silk-blend with a Banarasi motif border, for the occasions that call for a little more shine.' },
  { slug: 'everyday-cotton-saree-teal', name: 'Everyday Cotton Saree, Teal', category: 'sarees',
    price: 399, discountPrice: null, stock: 41, sku: 'SUC-SAR-104', rating: 4.0, reviews: 37, sizes: ['Free Size'], age: 2,
    description: 'Lightweight cotton in a solid teal — the saree you reach for on a regular Tuesday.' },
  { slug: 'festive-georgette-saree-wine', name: 'Festive Georgette Saree, Wine', category: 'sarees',
    price: 1499, discountPrice: null, stock: 14, sku: 'SUC-SAR-105', rating: 4.5, reviews: 91, sizes: ['Free Size'], age: 33,
    description: 'Flowing georgette with a hand-finished border, built for evening functions and family festivities alike.' },

  // ── Kurtis & Suits ───────────────────────────────────────────────
  { slug: 'anarkali-suit-set-powder-blue', name: 'Anarkali Suit Set, Powder Blue', category: 'kurtis-suits',
    price: 1599, discountPrice: 1299, stock: 11, sku: 'SUC-KUR-201', rating: 4.7, reviews: 156, sizes: ['S', 'M', 'L', 'XL'], age: 6,
    description: 'A flared Anarkali set with matching dupatta — floor-length drama without the floor-length fuss.' },
  { slug: 'straight-cut-cotton-kurti-ivory', name: 'Straight-Cut Cotton Kurti, Ivory', category: 'kurtis-suits',
    price: 399, discountPrice: null, stock: 54, sku: 'SUC-KUR-202', rating: 4.1, reviews: 48, sizes: ['S', 'M', 'L', 'XL', 'XXL'], age: 1,
    description: 'A clean, straight-cut kurti in pure cotton — the one that goes with everything in your wardrobe.' },
  { slug: 'embroidered-kurti-set-rust', name: 'Embroidered Kurti Set, Rust', category: 'kurtis-suits',
    price: 1599, discountPrice: null, stock: 16, sku: 'SUC-KUR-203', rating: 4.6, reviews: 102, sizes: ['S', 'M', 'L', 'XL'], age: 18,
    description: 'Thread-embroidered yoke, matching palazzo — dressed up without trying too hard.' },
  { slug: 'printed-aline-kurti-coral', name: 'Printed A-Line Kurti, Coral', category: 'kurtis-suits',
    price: 399, discountPrice: 299, stock: 60, sku: 'SUC-KUR-204', rating: 4.0, reviews: 29, sizes: ['S', 'M', 'L', 'XL'], age: 9,
    description: 'An A-line silhouette in a soft coral print, cut to move with you.' },
  { slug: 'chikankari-kurta-set-white', name: 'Chikankari Kurta Set, White', category: 'kurtis-suits',
    price: 1999, discountPrice: null, stock: 7, sku: 'SUC-KUR-205', rating: 4.9, reviews: 184, sizes: ['S', 'M', 'L', 'XL'], age: 27,
    description: 'Hand-finished chikankari embroidery on pure cotton — quiet, considered, and built to outlast a trend cycle.' },

  // ── Women's Western Wear ─────────────────────────────────────────
  { slug: 'floral-wrap-midi-dress', name: 'Floral Wrap Midi Dress', category: 'womens-western',
    price: 1299, discountPrice: 999, stock: 22, sku: 'SUC-WST-301', rating: 4.3, reviews: 77, sizes: ['XS', 'S', 'M', 'L'], age: 3,
    description: "A wrap silhouette in a small-scale floral, easy enough for brunch and sturdy enough for the rest of your day." },
  { slug: 'essential-denim-jacket', name: 'Essential Denim Jacket', category: 'womens-western',
    price: 1199, discountPrice: null, stock: 19, sku: 'SUC-WST-302', rating: 4.4, reviews: 88, sizes: ['S', 'M', 'L', 'XL'], age: 15,
    description: 'Mid-wash denim, a relaxed cut — the jacket that outlives every season it was actually bought for.' },
  { slug: 'ribbed-knit-coord-set', name: 'Ribbed Knit Co-ord Set', category: 'womens-western',
    price: 1499, discountPrice: null, stock: 13, sku: 'SUC-WST-303', rating: 4.5, reviews: 65, sizes: ['XS', 'S', 'M', 'L'], age: 8,
    description: "A ribbed top and trouser set cut from the same cloth, for days you want to look finished without deciding twice." },
  { slug: 'basic-cotton-tee-charcoal', name: 'Basic Cotton Tee, Charcoal', category: 'womens-western',
    price: 299, discountPrice: 199, stock: 88, sku: 'SUC-WST-304', rating: 4.0, reviews: 41, sizes: ['XS', 'S', 'M', 'L', 'XL'], age: 5,
    description: 'A heavyweight cotton tee in our house charcoal — the kind of basic worth buying twice.' },
  { slug: 'pleated-mini-skirt', name: 'Pleated Mini Skirt', category: 'womens-western',
    price: 499, discountPrice: null, stock: 27, sku: 'SUC-WST-305', rating: 3.9, reviews: 23, sizes: ['XS', 'S', 'M', 'L'], age: 12,
    description: 'A box-pleated mini in a structured cotton-blend that holds its shape through a full day on your feet.' },

  // ── Kids Wear ────────────────────────────────────────────────────
  { slug: 'girls-cotton-frock-pink-gingham', name: 'Girls Cotton Frock, Pink Gingham', category: 'kids-wear',
    price: 499, discountPrice: 399, stock: 35, sku: 'SUC-KID-401', rating: 4.4, reviews: 52, sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], age: 7,
    description: 'A gingham cotton frock built for actual play — soft, breathable, and easy to wash on repeat.' },
  { slug: 'boys-ethnic-kurta-pyjama-set', name: 'Boys Ethnic Kurta-Pyjama Set', category: 'kids-wear',
    price: 499, discountPrice: null, stock: 24, sku: 'SUC-KID-402', rating: 4.3, reviews: 38, sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], age: 20,
    description: 'A two-piece kurta-pyjama set for the smallest guests at every festive gathering.' },
  { slug: 'girls-party-tutu-dress', name: 'Girls Party Tutu Dress', category: 'kids-wear',
    price: 1299, discountPrice: null, stock: 10, sku: 'SUC-KID-403', rating: 4.6, reviews: 71, sizes: ['2-3Y', '4-5Y', '6-7Y'], age: 2,
    description: 'A layered tulle skirt and fitted bodice, made for birthdays and the photos that follow them.' },
  { slug: 'kids-festive-lehenga-set', name: 'Kids Festive Lehenga Set', category: 'kids-wear',
    price: 2199, discountPrice: 1799, stock: 6, sku: 'SUC-KID-404', rating: 4.7, reviews: 94, sizes: ['3-4Y', '5-6Y', '7-8Y'], age: 14,
    description: 'A scaled-down lehenga set with the same finishing as our adult festive edit — twirl-tested.' },
  { slug: 'boys-printed-shirt-shorts-set', name: 'Boys Printed Shirt & Shorts Set', category: 'kids-wear',
    price: 299, discountPrice: null, stock: 47, sku: 'SUC-KID-405', rating: 4.1, reviews: 33, sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], age: 24,
    description: 'A breathable shirt-and-shorts set in a small printed motif, sized for actual kid-sized chaos.' },
]

export const PRODUCTS = RAW_PRODUCTS.map((p, index) => ({
  id: index + 1,
  name: p.name,
  slug: p.slug,
  description: p.description,
  price: p.price,
  discountPrice: p.discountPrice,
  stockQuantity: p.stock,
  sku: p.sku,
  sizes: p.sizes,
  category: categoryFor(p.category),
  brand: BRAND,
  images: img(p.slug),
  averageRating: p.rating,
  reviewCount: p.reviews,
  createdAt: daysAgo(p.age),
}))

export function effectivePrice(product) {
  return product.discountPrice ?? product.price
}

// ── Demo reviews ──────────────────────────────────────────────────────
const REVIEW_NAMES = ['Ananya', 'Priya', 'Kavya', 'Meera', 'Sneha', 'Divya', 'Riya', 'Pooja', 'Aarav', 'Rohan']
const REVIEW_TEMPLATES = [
  'Fits true to size and the fabric feels much better than I expected for the price.',
  'Color in person is even nicer than the photos. Already ordered a second one.',
  'Good quality stitching, held up fine after a few washes.',
  'Comfortable for a full day out — would buy again.',
  'Delivery was quick and the packaging was neat. Happy with the purchase.',
  'Slightly long for my height but the tailoring is lovely.',
  'Exactly what I needed for a family function — got a lot of compliments.',
  'Soft fabric, breathable, great for everyday wear.',
]

export function generateReviews(product) {
  const count = Math.min(4, Math.max(1, Math.round(product.reviewCount / 40)))
  return Array.from({ length: count }).map((_, i) => ({
    id: `${product.id}-r${i}`,
    user: { firstName: REVIEW_NAMES[(product.id + i) % REVIEW_NAMES.length] },
    rating: Math.max(3, Math.round(product.averageRating) - (i % 2)),
    comment: REVIEW_TEMPLATES[(product.id * 3 + i) % REVIEW_TEMPLATES.length],
    createdAt: daysAgo(3 + i * 9),
  }))
}

// ── Demo accounts ──────────────────────────────────────────────────────
export const DEMO_CUSTOMER = {
  id: 1,
  firstName: 'Demo',
  lastName: 'Customer',
  email: 'customer@suce.demo',
  phone: '9876543210',
  role: 'CUSTOMER',
  enabled: true,
  createdAt: daysAgo(40),
}

export const DEMO_ADMIN = {
  id: 2,
  firstName: 'Demo',
  lastName: 'Admin',
  email: 'admin@suce.demo',
  phone: '9876500000',
  role: 'ADMIN',
  enabled: true,
  createdAt: daysAgo(90),
}

export const DEMO_USERS = [
  DEMO_CUSTOMER,
  DEMO_ADMIN,
  { id: 3, firstName: 'Ishita', lastName: 'Rao', email: 'ishita.rao@example.com', role: 'CUSTOMER', enabled: true, createdAt: daysAgo(25) },
  { id: 4, firstName: 'Naveen', lastName: 'Kumar', email: 'naveen.k@example.com', role: 'CUSTOMER', enabled: true, createdAt: daysAgo(12) },
  { id: 5, firstName: 'Tara', lastName: 'Singh', email: 'tara.singh@example.com', role: 'CUSTOMER', enabled: false, createdAt: daysAgo(60) },
]
