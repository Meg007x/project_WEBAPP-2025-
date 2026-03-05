export interface Venue {
  id: number;
  name: string;
  zone: string;
  distance: string;
  rating: number;
  priceRange: string;
  openTime: string;
  location: string;
  facilities: string[];
  imageUrl: string;
  totalCourts: number; // ✅ เพิ่มจำนวนคอร์ดของแต่ละสนาม
}

export const venuesData: Venue[] = [
  {
    id: 1,
    name: 'PS Badminton',
    zone: 'บึ้งทุ่งสร้าง',
    distance: '6.5 กม.', // จากสนามกีฬา 60 ปี
    rating: 4.5,
    priceRange: '120 - 180',
    openTime: '09:00 - 24:00',
    location: 'ถนนบางกอกน้อย เมืองขอนแก่น',
    facilities: ['ที่จอดรถ', 'WiFi', 'แอร์', 'เครื่องดื่ม'],
    imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3xY_ZSFMhPL9kE0poDTYtijzEDCHfJfjmX5Y_36hC790mTXsjh3CE6tRudLCi_a1LCbgzmauRhJv5aAA7kDubm46SJLULYtHtUxL9bcAicbs0_xh4j82WufpFLeGtoXtMxojnVuHq9iyuWVpGlRfCb5oZJcLgQiMUHEW21q3WEC3GHwgXz9OUHAhmyzg/s1360/PS01.jpg',
    totalCourts: 4 // PS มี 4 คอร์ด
  },
  {
    id: 2,
    name: 'PCR Badminton',
    zone: 'กังสดาล/โนนม่วง',
    distance: '2.8 กม.', // จากสนามกีฬา 60 ปี
    rating: 4.2,
    priceRange: '120 - 170',
    openTime: '10:00 - 24:00',
    location: 'ใกล้โซนกังสดาล ทะลุบ้านโนนม่วง',
    facilities: ['พื้นยางมาตรฐาน', 'ที่จอดรถ', 'พัดลมไอน้ำ'],
    imageUrl: 'https://static.wixstatic.com/media/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp/v1/fill/w_568,h_378,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp', // ✅ รูปใหม่ที่คุณขอ
    totalCourts: 6 // ✅ PCR มี 6 คอร์ด
  }
];