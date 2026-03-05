import React from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, 
  IonButton, IonIcon, IonBadge 
} from '@ionic/react';
import { timeOutline, locationOutline, callOutline, arrowForward, mapOutline, wifiOutline, snowOutline, carOutline, walletOutline } from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';
import './Home.css';

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
    distance: '6.5 กม.',
    rating: 4.8,
    priceRange: '120 - 180',
    openTime: '15:00 - 24:00',
    location: 'ถนนบางกอกน้อย เมืองขอนแก่น',
    facilities: ['ที่จอดรถ', 'WiFi', 'แอร์', 'เครื่องดื่ม'],
    imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3xY_ZSFMhPL9kE0poDTYtijzEDCHfJfjmX5Y_36hC790mTXsjh3CE6tRudLCi_a1LCbgzmauRhJv5aAA7kDubm46SJLULYtHtUxL9bcAicbs0_xh4j82WufpFLeGtoXtMxojnVuHq9iyuWVpGlRfCb5oZJcLgQiMUHEW21q3WEC3GHwgXz9OUHAhmyzg/s1360/PS01.jpg',
    totalCourts: 8
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
  
  const incomingState = location.state?.venue || {};
  const currentId = incomingState.id || 1;
  const venue = venuesData.find(v => v.id === currentId) || venuesData[0];

  const nightPrice = (venue.priceRange && venue.priceRange.includes('-')) 
      ? venue.priceRange.split('-')[1] 
      : venue.priceRange;

  // ✅ แยกทางไปหน้าจองตาม ID ของสนาม
  const handleBooking = () => {
    if (venue.id === 1) {
      history.push({ pathname: '/ps-booking', state: { venue: venue } });
    } else if (venue.id === 2) {
      history.push({ pathname: '/pcr-booking', state: { venue: venue } });
    }
  };

  const openGoogleMap = () => {
    const coords = venue.id === 1 ? { lat: 16.4322, lng: 102.8390 } : { lat: 16.4650, lng: 102.8250 };
    const mapUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    window.open(mapUrl, '_system');
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/badminton-list" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>รายละเอียดสนาม</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">
          <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #333', height: '220px' }}>
            <img src={venue.imageUrl} alt="court" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="user-name" style={{ fontSize: '1.8rem', margin: 0 }}>{venue.name}</h1>
            <IonBadge color="warning" style={{ fontSize: '1rem', padding: '8px 12px', borderRadius: '8px' }}>⭐ {venue.rating}</IonBadge>
          </div>
          
          <p style={{ color: '#aaa', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IonIcon icon={locationOutline} style={{ color: '#FFD700' }} /> ห่างจากสนามกีฬา 60 ปี {venue.distance}
          </p>

          <div style={{ background: '#222', padding: '15px', borderRadius: '15px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <IonIcon icon={mapOutline} style={{ fontSize: '2rem', color: '#FFD700' }} />
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>ตำแหน่ง/โซน</div>
                  <div style={{ color: '#888', fontSize: '0.8rem' }}>{venue.zone}</div>
                </div>
             </div>
            {/* หาปุ่ม IonButton ดูแผนที่ ของฝั่งแบดมินตัน แล้วแก้ข้างใน onClick เป็นแบบนี้ครับ */}
            <IonButton 
              fill="outline" 
              color="primary" // (สีตามที่คุณตั้งไว้ฝั่งแบดมินตัน)
              onClick={() => {
                // สมมติว่าในโค้ดเดิมใช้พิกัด "16.485,102.855" หรือใช้ตัวแปร
                // แก้ URL ให้เป็นฟอร์แมตนี้ครับ (สังเกตว่าหลัง .com/ จะเป็น ?q= เลย)
                const mapQuery = venue?.location || "16.485,102.855"; // หรือใช้ venue.name 
                window.open(`https://maps.google.com/?q=${mapQuery}`, '_blank');
              }}
            >
              ดูแผนที่
            </IonButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            <div className="sport-card" style={{ padding: '15px', background: '#1a1a1a', borderRadius: '15px' }}>
              <IonIcon icon={timeOutline} style={{ color: '#FFD700', fontSize: '24px' }} />
              <h4 style={{ margin: '5px 0', color: '#fff' }}>เวลาทำการ</h4>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>{venue.openTime}</p>
            </div>
            <div className="sport-card" style={{ padding: '15px', background: '#1a1a1a', borderRadius: '15px' }}>
              <IonIcon icon={walletOutline} style={{ color: '#FFD700', fontSize: '24px' }} />
              <h4 style={{ margin: '5px 0', color: '#fff' }}>ราคาเริ่มต้น</h4>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>{venue.priceRange} ฿</p>
            </div>
          </div>

          <div className="field-card" style={{ padding: '20px', marginTop: '20px', borderRadius: '20px', background: '#1a1a1a' }}>
            <h3 style={{ color: 'white', margin: 0, borderLeft: '4px solid #FFD700', paddingLeft: '10px' }}>อัตราค่าบริการ</h3>
            <ul style={{ color: '#ccc', lineHeight: '1.8', paddingLeft: '20px', marginTop: '10px' }}>
              <li>🌞 กลางวัน : <span style={{ color: '#FFD700' }}>120฿ / ชม.</span></li>
              <li>🌙 กลางคืน : <span style={{ color: '#FFD700' }}>{nightPrice}฿ / ชม.</span></li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
             {venue.facilities.map((fac, i) => (
                <IonBadge key={i} color="medium" style={{ padding: '5px 10px' }}>{fac}</IonBadge>
             ))}
          </div>

          <div style={{ marginTop: '30px', paddingBottom: '30px' }}>
            <IonButton expand="block" color="warning" onClick={handleBooking} shape="round" style={{ fontWeight: 'bold', height: '55px', '--color': 'black' }}>
              จองสนามว่าง ({venue.name}) <IonIcon icon={arrowForward} slot="end" />
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BadmintonVenue;