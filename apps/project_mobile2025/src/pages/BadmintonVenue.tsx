import React from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, 
  IonButton, IonIcon, IonBadge 
} from '@ionic/react';
import { timeOutline, locationOutline, callOutline, arrowForward, mapOutline, wifiOutline, snowOutline, carOutline } from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';
import './Home.css';

// --- 1. ข้อมูลจำลอง (Mock DB) ที่คุณอัปเดตล่าสุด ---
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
  totalCourts: number;
}

export const venuesData: Venue[] = [
  {
    id: 1,
    name: 'PS Badminton',
    zone: 'บึ้งทุ่งสร้าง',
    distance: '6.5 กม.', // แก้ตามที่คุณต้องการ
    rating: 4.5,
    priceRange: '120 - 180',
    openTime: '09:00 - 24:00',
    location: 'ถนนบางกอกน้อย เมืองขอนแก่น', // แก้ตามที่คุณต้องการ
    facilities: ['ที่จอดรถ', 'WiFi', 'แอร์', 'เครื่องดื่ม'],
    imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3xY_ZSFMhPL9kE0poDTYtijzEDCHfJfjmX5Y_36hC790mTXsjh3CE6tRudLCi_a1LCbgzmauRhJv5aAA7kDubm46SJLULYtHtUxL9bcAicbs0_xh4j82WufpFLeGtoXtMxojnVuHq9iyuWVpGlRfCb5oZJcLgQiMUHEW21q3WEC3GHwgXz9OUHAhmyzg/s1360/PS01.jpg',
    totalCourts: 4
  },
  {
    id: 2,
    name: 'PCR Badminton',
    zone: 'กังสดาล/โนนม่วง',
    distance: '2.8 กม.',
    rating: 4.2,
    priceRange: '120 - 170',
    openTime: '10:00 - 24:00',
    location: 'ใกล้โซนกังสดาล ทะลุบ้านโนนม่วง',
    facilities: ['พื้นยางมาตรฐาน', 'ที่จอดรถ', 'พัดลมไอน้ำ'],
    imageUrl: 'https://static.wixstatic.com/media/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp/v1/fill/w_568,h_378,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp',
    totalCourts: 6
  }
];

const BadmintonVenue: React.FC = () => {
  const location = useLocation<any>();
  const history = useHistory();
  
  // --- 2. LOGIC การดึงข้อมูลที่ถูกต้อง ---
  // รับ ID มาจากหน้าก่อนหน้า (ถ้าไม่มีให้ Default เป็น 1)
  const incomingState = location.state?.venue || {};
  const currentId = incomingState.id || 1;

  // ค้นหาข้อมูลจริงๆ จาก venuesData ด้วย ID (เพื่อให้ได้ข้อมูลล่าสุดที่คุณแก้)
  // ถ้าหาไม่เจอ ให้ใช้ตัวแรกเป็น Default
  const venue = venuesData.find(v => v.id === currentId) || venuesData[0];

  // คำนวณราคากลางคืน (UI Logic เดิม)
  const nightPrice = (venue.priceRange && venue.priceRange.includes('-')) 
      ? venue.priceRange.split('-')[1] 
      : venue.priceRange;

  const handleBooking = () => {
    history.push({
      pathname: '/court-select',
      state: { venue: venue } // ส่งข้อมูลล่าสุดไป
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/badminton-list" color="light" /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">

          {/* Cover Image */}
          <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #333', height: '220px' }}>
            <img 
                src={venue.imageUrl} 
                alt="court" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' }} 
                onError={(e:any) => {e.target.style.display='none'}}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="user-name" style={{ fontSize: '1.8rem', margin: 0 }}>{venue.name}</h1>
            <IonBadge color="warning" style={{ fontSize: '1rem', padding: '8px 12px', borderRadius: '8px' }}>⭐ {venue.rating}</IonBadge>
          </div>
          
          {/* ส่วนนี้ดึง venue.distance มาแสดงแล้ว (เช่น 6.5 กม.) */}
          <p style={{ color: '#aaa', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IonIcon icon={locationOutline} /> ห่างจากสนามกีฬา 60 ปี {venue.distance}
          </p>

          {/* Location Pin: ส่วนนี้ดึง venue.location มาแสดงแล้ว (ถนนบางกอกน้อย...) */}
          <div style={{ background: '#222', padding: '15px', borderRadius: '15px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
             <IonIcon icon={mapOutline} style={{ fontSize: '2rem', color: '#FFD700' }} />
             <div>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>ตำแหน่งที่ตั้ง / โซน</div>
                {/* แสดง Location และ Zone ตามข้อมูลใหม่ */}
                <div style={{ color: '#888', fontSize: '0.9rem' }}>{venue.location} ({venue.zone})</div>
             </div>
          </div>

          {/* Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            <div className="sport-card" style={{ padding: '15px' }}>
              <IonIcon icon={timeOutline} style={{ color: '#FFD700', fontSize: '24px' }} />
              <h4 style={{ margin: '5px 0' }}>เวลาทำการ</h4>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>{venue.openTime}</p>
            </div>
            <div className="sport-card" style={{ padding: '15px' }}>
              <IonIcon icon={callOutline} style={{ color: '#FFD700', fontSize: '24px' }} />
              <h4 style={{ margin: '5px 0' }}>ติดต่อ</h4>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>080-xxx-xxxx</p>
            </div>
          </div>

          {/* Price Info */}
          <div className="field-card" style={{ padding: '20px', marginTop: '20px', borderRadius: '20px' }}>
            <h3 style={{ color: 'white', margin: 0, borderLeft: '4px solid #D4AF37', paddingLeft: '10px' }}>อัตราค่าบริการ</h3>
            <ul style={{ color: '#ccc', lineHeight: '1.8', paddingLeft: '20px', marginTop: '10px' }}>
              <li>🌞 กลางวัน : <span className="text-gold">120฿ / ชม.</span></li>
              <li>🌙 กลางคืน : <span className="text-gold">{nightPrice}฿ / ชม.</span></li>
            </ul>
          </div>

          {/* Facilities: ดึงจาก Array มาแสดง ถ้าไม่มีใช้ Default */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
             {venue.facilities && venue.facilities.length > 0 ? (
                 venue.facilities.map((fac, index) => (
                    <IonBadge key={index} color="medium">{fac}</IonBadge>
                 ))
             ) : (
                 <>
                    <IonBadge color="medium"><IonIcon icon={carOutline}/> ที่จอดรถ</IonBadge>
                    <IonBadge color="medium"><IonIcon icon={wifiOutline}/> WiFi</IonBadge>
                    <IonBadge color="medium"><IonIcon icon={snowOutline}/> แอร์</IonBadge>
                 </>
             )}
          </div>

          <div style={{ marginTop: '40px' }}>
            <IonButton 
              expand="block" 
              color="warning" 
              onClick={handleBooking}
              shape="round" 
              style={{ fontWeight: 'bold', height: '50px' }}
            >
              เช็คสนามว่าง / จองเลย <IonIcon icon={arrowForward} slot="end" />
            </IonButton>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default BadmintonVenue;