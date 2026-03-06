// src/pages/BadmintonVenueBlueZone.tsx
import React from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, 
  IonButton, IonIcon, IonBadge, IonFooter 
} from '@ionic/react';
import { timeOutline, locationOutline, callOutline, arrowForward, mapOutline, carOutline, iceCreamOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Home.css';

const BadmintonVenueBlueZone: React.FC = () => {
  const history = useHistory();

  const venue = { 
    id: 3, 
    name: 'Blue Zone Badminton', 
    priceRange: '120 - 180',
    totalCourts: 8 
  };

  // URL สำหรับ Google Map ของ Blue Zone (แก้ไขเป็น API บังคับนำทาง)
const openGoogleMap = () => {
    // พิกัดของ Blue Zone ที่แกเพิ่งหามาได้
    const lat = 16.4913769872995; 
    const lng = 102.82520462885827;

    // ⭐️ ใช้คำสั่งของ Google Maps Search API บังคับให้ปักหมุด
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
    window.open(mapUrl, '_blank');
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
            <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgtIP-eO9f2hmYfvejHsMfl_mHOIxCe1Wl4Q&s" 
                alt="Blue Zone" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="user-name" style={{ fontSize: '1.8rem', margin: 0 }}>Blue Zone Badminton</h1>
            <IonBadge color="warning" style={{ fontSize: '1rem', padding: '8px 12px', borderRadius: '8px' }}>⭐ 4.5</IonBadge>
          </div>
          
          <p style={{ color: '#aaa', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IonIcon icon={locationOutline} style={{ color: '#FFD700' }} /> ต.ศิลา • 8.2 กม. จาก มข.
          </p>

          {/* ปุ่มตำแหน่งที่ตั้ง */}
          <div 
            style={{ background: '#222', padding: '15px', borderRadius: '15px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #333' }}
          >
             <IonIcon icon={mapOutline} style={{ fontSize: '2rem', color: '#FFD700' }} />
             <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>ตำแหน่งที่ตั้ง</div>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>ถ.เลี่ยงเมือง ต.ศิลา (ใกล้ดูโฮม)</div>
             </div>
              {/* เรียกใช้ openGoogleMap ที่แก้ไขแล้ว */}
              <IonButton color="primary" fill="outline" onClick={openGoogleMap} style={{ margin: '16px' }}>
                ดูแผนที่
              </IonButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            <div className="sport-card" style={{ padding: '15px' }}>
              <IonIcon icon={timeOutline} style={{ color: '#FFD700', fontSize: '24px' }} />
              <h4 style={{ margin: '5px 0' }}>เวลาทำการ</h4>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>09:00 - 24:00 น.</p>
            </div>
            <div className="sport-card" style={{ padding: '15px' }}>
              <IonIcon icon={callOutline} style={{ color: '#FFD700', fontSize: '24px' }} />
              <h4 style={{ margin: '5px 0' }}>ติดต่อ</h4>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>โทรสอบถามสนาม</p>
            </div>
          </div>

          <div className="field-card" style={{ padding: '20px', marginTop: '20px', borderRadius: '20px' }}>
            <h3 style={{ color: 'white', margin: 0, borderLeft: '4px solid #D4AF37', paddingLeft: '10px' }}>อัตราค่าบริการ</h3>
            <ul style={{ color: '#ccc', lineHeight: '1.8', paddingLeft: '20px', marginTop: '10px' }}>
              <li>🌞 ช่วงกลางวัน : <span className="text-gold">120฿ / ชม.</span></li>
              <li>🌙 ช่วงกลางคืน : <span className="text-gold">180฿ / ชม.</span></li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
             <IonBadge color="medium"><IonIcon icon={carOutline} style={{marginRight: '4px'}}/> ที่จอดรถกว้าง</IonBadge>
             <IonBadge color="medium"><IonIcon icon={iceCreamOutline} style={{marginRight: '4px'}}/> มีเครื่องดื่ม</IonBadge>
             <IonBadge color="medium">พื้นยางมาตรฐาน</IonBadge>
          </div>
           <div style={{ marginTop: '40px' }}>
            {/* ✅ ปุ่มจอง วิ่งไปหน้า CourtSelectBlueZone */}
              <IonButton expand="block" color="warning" onClick={() => history.push({ pathname: '/booking-bluezone', state: { venue }})} shape="round" style={{ fontWeight: 'bold', height: '50px', '--color': 'black' }}>
                        เช็คสนามว่าง / จองเลย <IonIcon icon={arrowForward} slot="end" />
              </IonButton>
            </div>

          <div style={{ height: '100px' }}></div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BadmintonVenueBlueZone;