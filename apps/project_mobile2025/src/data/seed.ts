import { db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

// 1. รวมข้อมูลสนามทั้งหมด (Badminton + Football) พร้อมเพิ่มพิกัด lat, lng
const venuesData = [
  // --- แบดมินตัน ---
  {
    id: 'badminton_1',
    type: 'badminton',
    name: 'PS Badminton',
    zone: 'บึงทุ่งสร้าง',
    lat: 16.4426,
    lng: 102.8525,
    priceRange: '120 - 180',
    openTime: '09:00',
    closeTime: '24:00',
    location: 'ถนนบางกอกน้อย เมืองขอนแก่น',
    imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3xY_ZSFMhPL9kE0poDTYtijzEDCHfJfjmX5Y_36hC790mTXsjh3CE6tRudLCi_a1LCbgzmauRhJv5aAA7kDubm46SJLULYtHtUxL9bcAicbs0_xh4j82WufpFLeGtoXtMxojnVuHq9iyuWVpGlRfCb5oZJcLgQiMUHEW21q3WEC3GHwgXz9OUHAhmyzg/s1360/PS01.jpg',
    rating: 4.5,
    facilities: ['ที่จอดรถ', 'WiFi', 'แอร์', 'เครื่องดื่ม']
  },
  {
    id: 'badminton_2',
    type: 'badminton',
    name: 'PCR Badminton',
    zone: 'กังสดาล/โนนม่วง',
    lat: 16.4715,
    lng: 102.8185,
    priceRange: '120 - 170',
    openTime: '10:00',
    closeTime: '24:00',
    location: 'ใกล้โซนกังสดาล ทะลุบ้านโนนม่วง',
    imageUrl: 'https://static.wixstatic.com/media/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp/v1/fill/w_568,h_378,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp',
    rating: 4.2,
    facilities: ['พื้นยางมาตรฐาน', 'ที่จอดรถ', 'พัดลมไอน้ำ']
  },
  {
    id: 'badminton_3',
    type: 'badminton',
    name: 'Blue Zone Badminton',
    zone: 'ต.ศิลา / เลี่ยงเมือง',
    lat: 16.4950,
    lng: 102.8450,
    priceRange: '120 - 180',
    openTime: '09:00',
    closeTime: '24:00',
    location: 'ถ.เลี่ยงเมือง ต.ศิลา เมืองขอนแก่น',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgtIP-eO9f2hmYfvejHsMfl_mHOIxCe1Wl4Q&s',
    rating: 4.5,
    facilities: ['สนามใหม่', 'ที่จอดรถกว้าง', 'เครื่องดื่ม']
  },
  // --- ฟุตบอล ---
  {
    id: 'football_1',
    type: 'football',
    name: 'KKU Soccer Park',
    zone: 'มข. / โนนม่วง',
    lat: 16.4812,
    lng: 102.8163,
    priceRange: '700 - 900',
    openTime: '16:00',
    closeTime: '24:00',
    location: 'ใกล้โซนโนนม่วง มหาวิทยาลัยขอนแก่น',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=60',
    rating: 4.7,
    facilities: ['หญ้าเทียม', 'ที่จอดรถ', 'ห้องน้ำ', 'ไฟส่องสว่าง']
  },
  {
    id: 'football_2',
    type: 'football',
    name: 'Bueng Nong Khot Arena',
    zone: 'บึงหนองโคตร',
    lat: 16.4250,
    lng: 102.7950,
    priceRange: '800 - 1100',
    openTime: '15:00',
    closeTime: '01:00',
    location: 'โซนบึงหนองโคตร เมืองขอนแก่น',
    imageUrl: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1000&q=60',
    rating: 4.6,
    facilities: ['หญ้าเทียม', 'ที่จอดรถ', 'ร้านน้ำ', 'ลูกบอลฟรี']
  },
  {
    id: 'football_3',
    type: 'football',
    name: 'Kan Sa Dal Football Hub',
    zone: 'กังสดาล',
    lat: 16.4650,
    lng: 102.8220,
    priceRange: '750 - 1000',
    openTime: '17:00',
    closeTime: '02:00',
    location: 'โซนกังสดาล ใกล้แหล่งของกิน',
    imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1000&q=60',
    rating: 4.5,
    facilities: ['สนามในร่มบางส่วน', 'WiFi', 'ที่จอดรถ', 'ห้องอาบน้ำ']
  }
];

// 2. ข้อมูลสนามย่อย (Subvenues/Courts)
const subVenuesData = [
  { id: 'ps_c1', venueId: 'badminton_1', name: 'Court 1' },
  { id: 'ps_c2', venueId: 'badminton_1', name: 'Court 2' },
  { id: 'ps_c3', venueId: 'badminton_1', name: 'Court 3' },
  { id: 'ps_c4', venueId: 'badminton_1', name: 'Court 4' },
  { id: 'pcr_c1', venueId: 'badminton_2', name: 'Court 1' },
  { id: 'pcr_c2', venueId: 'badminton_2', name: 'Court 2' },
  { id: 'bz_c1', venueId: 'badminton_3', name: 'Court 1' },
  { id: 'kku_f1', venueId: 'football_1', name: 'Field 1' },
  { id: 'bnk_f1', venueId: 'football_2', name: 'Field 1' },
  { id: 'ksd_f1', venueId: 'football_3', name: 'Field 1' }
];

export const seedDatabase = async () => {
  try {
    // ลงข้อมูลสนามหลัก
    for (const venue of venuesData) {
      await setDoc(doc(db, "venues", venue.id), venue);
    }
    // ลงข้อมูลสนามย่อย
    for (const sub of subVenuesData) {
      await setDoc(doc(db, "subvenues", sub.id), sub);
    }
    alert("สร้างฐานข้อมูลสำเร็จ! ข้อมูลถูกรวมและมีพิกัด Lat/Lng แล้ว");
  } catch (error) {
    console.error(error);
    alert("เกิดข้อผิดพลาด!");
  }
};