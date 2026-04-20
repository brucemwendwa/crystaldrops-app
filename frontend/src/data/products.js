const source = 'Sourced from protected aquifers in Kenya, monitored for quality at every stage.';
const purification = '9-step reverse osmosis, carbon filtration, and UV sterilization before sealed bottling.';
const benefits = 'Mineral-balanced taste, sealed for hygiene, ideal for families, offices, and daily hydration.';

export const products = [
  {
    id: 'cd-05l',
    name: 'CrystalDrops 0.5L',
    price: 30, // Default display price (single)
    size: '0.5L',
    image: '/images/bottle_05l.png',
    description: 'Perfect for quick hydration on the go. Fits easily in bags and cup holders. A customised parcel is available for KES 420.',
    prices: { single: 30, parcel: 350, 'customised parcel': 420 },
    parcelQuantity: 24,
    source, purification, benefits
  },
  {
    id: 'cd-1l',
    name: 'CrystalDrops 1L',
    price: 40,
    size: '1L',
    image: '/images/bottle_1l.png',
    description: 'The standard size for daily hydration. Ideal for meals and workouts.',
    prices: { single: 40, parcel: 350 },
    parcelQuantity: 12,
    source, purification, benefits
  },
  {
    id: 'cd-15l',
    name: 'CrystalDrops 1.5L',
    price: 50,
    size: '1.5L',
    image: '/images/bottle_15l.png',
    description: 'Great for sharing or keeping on your desk throughout the workday.',
    prices: { single: 50, parcel: 350, refill: 10 },
    parcelQuantity: 12,
    source, purification, benefits
  },
  {
    id: 'cd-5l',
    name: 'CrystalDrops 5L',
    price: 100,
    size: '5L',
    image: '/images/bottle_5l.png',
    description: 'Perfect for small families or weekend trips. Easy-pour handle.',
    prices: { single: 100, parcel: 350, refill: 50 },
    parcelQuantity: 4,
    source, purification, benefits
  },
  {
    id: 'cd-10l',
    name: 'CrystalDrops 10L',
    price: 280,
    size: '10L',
    image: '/images/bottle_10l.png',
    description: 'Great for households that want fewer deliveries. Easy-carry and easy-pour.',
    prices: { single: 280, refill: 100 },
    source, purification, benefits
  },
  {
    id: 'cd-20l',
    name: 'CrystalDrops 20L',
    price: 380,
    size: '20L',
    image: '/images/bottle_20l.png',
    description: 'Designed for water dispensers—the most economical choice for homes and offices. Refill program available.',
    prices: { single: 380, refill: 200 },
    source, purification, benefits
  }
];
