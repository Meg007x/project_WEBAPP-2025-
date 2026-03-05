// src/data/mockfootball.ts

export interface FootballVenue {
  id: number;
  name: string;
  zone: string;
  distance: string;
  rating: number;
  priceRange: string;     // เช่น "800 - 1200"
  openTime: string;       // เช่น "10:00 - 24:00"
  location: string;
  facilities: string[];
  imageUrl: string;
  totalCourts: number;    // จำนวนสนามย่อย (Field A,B,C...)
}

export const footballVenuesData: FootballVenue[] = [
  {
    id: 1,
    name: 'KKU Soccer Park',
    zone: 'มข. / โนนม่วง',
    distance: '1.5 กม.',
    rating: 4.7,
    priceRange: '700 - 900',
    openTime: '16:00 - 24:00',
    location: 'ใกล้โซนโนนม่วง มหาวิทยาลัยขอนแก่น',
    facilities: ['หญ้าเทียม', 'ที่จอดรถ', 'ห้องน้ำ', 'ไฟส่องสว่าง'],
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=60',
    totalCourts: 2
  },
  {
    id: 2,
    name: 'Bueng Nong Khot Arena',
    zone: 'บึงหนองโคตร',
    distance: '6.0 กม.',
    rating: 4.6,
    priceRange: '800 - 1100',
    openTime: '15:00 - 01:00',
    location: 'โซนบึงหนองโคตร เมืองขอนแก่น',
    facilities: ['หญ้าเทียม', 'ที่จอดรถ', 'ร้านน้ำ', 'ลูกบอลฟรี'],
    imageUrl: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1000&q=60',
    totalCourts: 3
  },
  {
    id: 3,
    name: 'Kan Sa Dal Football Hub',
    zone: 'กังสดาล',
    distance: '3.2 กม.',
    rating: 4.5,
    priceRange: '750 - 1000',
    openTime: '17:00 - 02:00',
    location: 'โซนกังสดาล ใกล้แหล่งของกิน',
    facilities: ['สนามในร่มบางส่วน', 'WiFi', 'ที่จอดรถ', 'ห้องอาบน้ำ'],
    imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1000&q=60',
    totalCourts: 2
  }
];