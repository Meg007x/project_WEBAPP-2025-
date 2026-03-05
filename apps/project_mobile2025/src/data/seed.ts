import { db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

// 1. ข้อมูลสนามหลัก (Venues) - สำหรับแสดงในหน้า List
const venuesData = [
  {
    id: 'badminton_1',
    type: 'badminton',
    name: 'PS Badminton',
    zone: 'บึงทุ่งสร้าง',
    distance: '6.5 กม.',
    priceRange: '120 - 180',
    openTime: '09:00',
    closeTime: '24:00',
    location: 'ถนนบางกอกน้อย เมืองขอนแก่น',
    imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3xY_ZSFMhPL9kE0poDTYtijzEDCHfJfjmX5Y_36hC790mTXsjh3CE6tRudLCi_a1LCbgzmauRhJv5aAA7kDubm46SJLULYtHtUxL9bcAicbs0_xh4j82WufpFLeGtoXtMxojnVuHq9iyuWVpGlRfCb5oZJcLgQiMUHEW21q3WEC3GHwgXz9OUHAhmyzg/s1360/PS01.jpg'
  },
  {
    id: 'badminton_2',
    type: 'badminton',
    name: 'PCR Badminton',
    zone: 'กังสดาล/โนนม่วง',
    distance: '2.8 กม.',
    priceRange: '120 - 170',
    openTime: '10:00',
    closeTime: '24:00',
    location: 'ใกล้โซนกังสดาล ทะลุบ้านโนนม่วง',
    imageUrl: 'https://static.wixstatic.com/media/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp/v1/fill/w_568,h_378,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp'
  },
  {
    id: 'football_1',
    type: 'football',
    name: 'KickOff Arena',
    zone: 'เหล่านาดี',
    distance: '4.2 กม.',
    priceRange: '500 - 800',
    openTime: '16:00',
    closeTime: '02:00',
    location: 'ถ.เหล่านาดี ตัดใหม่',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000'
  }
];

// 2. ข้อมูลสนามย่อย (Subvenues/Courts) - สำคัญมากสำหรับการเช็ค "จองซ้ำ"
const subVenuesData = [
  // ของ PS Badminton (4 คอร์ท)
  { id: 'ps_c1', venueId: 'badminton_1', name: 'Court 1' },
  { id: 'ps_c2', venueId: 'badminton_1', name: 'Court 2' },
  { id: 'ps_c3', venueId: 'badminton_1', name: 'Court 3' },
  { id: 'ps_c4', venueId: 'badminton_1', name: 'Court 4' },
  // ของ PCR Badminton (2 คอร์ทตัวอย่าง)
  { id: 'pcr_c1', venueId: 'badminton_2', name: 'Court 1' },
  { id: 'pcr_c2', venueId: 'badminton_2', name: 'Court 2' },
  // ของ KickOff Arena (2 สนามบอล)
  { id: 'ko_f1', venueId: 'football_1', name: 'Field A (Indoor)' },
  { id: 'ko_f2', venueId: 'football_1', name: 'Field B (Outdoor)' }
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
    alert("สร้างฐานข้อมูลสำเร็จ! ทั้งสนามหลักและสนามย่อย");
  } catch (error) {
    console.error(error);
    alert("เกิดข้อผิดพลาด!");
  }
};