// src/pages/BadmintonVenuePCR.tsx
import React, { useEffect, useState } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, 
  IonButton, IonIcon, IonBadge, IonSpinner 
} from '@ionic/react';
import { timeOutline, locationOutline, arrowForward, mapOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Home.css';

// ✅ นำเข้า Firestore
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const BadmintonVenuePCR: React.FC = () => {
  const history = useHistory();

  // สร้าง State สำหรับเก็บข้อมูลที่ดึงมา
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ดึงข้อมูลเมื่อโหลดหน้านี้
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        // สมมติว่าใน Firestore ของคุณมี Collection ชื่อ 'venues'
        // และมี Document ID ชื่อ 'pcr_badminton' หรือ '2'
        const docRef = doc(db, 'venues', 'pcr_badminton'); // 👈 **แก้ตรงนี้ให้ตรงกับ Document ID ใน Firebase ของคุณ**
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVenue({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
          // ใส่ข้อมูล Default ไว้กันพัง ถ้าหาใน DB ไม่เจอ
          setVenue({
             id: 2,
             name: 'PCR Badminton',
             zone: 'กังสดาล/โนนม่วง',
             distance: '2.8 กม.',
             rating: 4.2,
             openTime: '10:00 - 24:00',
             location: 'ใกล้โซนกังสดาล ทะลุบ้านโนนม่วง',
             imageUrl: 'https://static.wixstatic.com/media/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp/v1/fill/w_568,h_378,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp',
             totalCourts: 6,
             priceDay: '120',
             priceNight: '170'
          });
        }
      } catch (error) {
        console.error("Error fetching venue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueData();
  }, []);

  const openGoogleMap = () => {
    // ถ้าในฐานข้อมูลมี lat/lng ก็เอามาใช้ ถ้าไม่มีก็ใส่ค่าเริ่มต้น
    const lat = venue?.lat || 16.4650;
    const lng = venue?.lng || 102.8250;
    const mapUrl = `https://maps.google.com/?q=$${lat},${lng}`;
    window.open(mapUrl, '_system');
  };

  // ถ้าระบบกำลังโหลด ให้แสดงวงกลมหมุนๆ
  if (loading) {
    return (
      <IonPage>
        <IonContent className="lux-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <IonSpinner name="crescent" color="warning" />
        </IonContent>
      </IonPage>
    );
  }

  // ป้องกันกรณีที่โหลดเสร็จแล้วแต่หา venue ไม่เจอ
  if (!venue) return null;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/badminton-list" color="light" /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">
          <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', height: '220px' }}>
            {/* ดึง imageUrl จากฐานข้อมูล */}
            <img src={venue.imageUrl} alt="court" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="user-name" style={{ fontSize: '1.8rem', margin: 0 }}>{venue.name}</h1>
            <IonBadge color="warning" style={{ fontSize: '1rem', padding: '8px 12px', borderRadius: '8px' }}>⭐ {venue.rating}</IonBadge>
          </div>
          
          <p style={{ color: '#aaa', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IonIcon icon={locationOutline} /> ห่างจากสนามกีฬา 60 ปี {venue.distance}
          </p>

          <div style={{ background: '#222', padding: '15px', borderRadius: '15px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
             <IonIcon icon={mapOutline} style={{ fontSize: '2rem', color: '#FFD700' }} />
             <div>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>ตำแหน่งที่ตั้ง</div>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>{venue.location}</div>
             </div>
             <IonButton color="primary" onClick={openGoogleMap} style={{ margin: '16px' }}>
                <IonIcon icon={locationOutline} /> แผนที่
             </IonButton>
          </div>

          <div className="field-card" style={{ padding: '20px', marginTop: '20px', borderRadius: '20px' }}>
            <h3 style={{ color: 'white', margin: 0, borderLeft: '4px solid #D4AF37', paddingLeft: '10px' }}>อัตราค่าบริการ</h3>
            <ul style={{ color: '#ccc', lineHeight: '1.8', paddingLeft: '20px', marginTop: '10px' }}>
              {/* ดึงราคาจากฐานข้อมูล */}
              <li>🌞 กลางวัน : <span className="text-gold">{venue.priceDay || '120'}฿ / ชม.</span></li>
              <li>🌙 กลางคืน : <span className="text-gold">{venue.priceNight || '170'}฿ / ชม.</span></li>
            </ul>
          </div>

          <div style={{ marginTop: '40px' }}>
            {/* ส่ง venue ที่ได้จากฐานข้อมูล ไปหน้าจอง */}
            <IonButton expand="block" color="warning" onClick={() => history.push({ pathname: '/pcr-booking', state: { venue }})} shape="round" style={{ fontWeight: 'bold', height: '50px' }}>
              เช็คสนามว่าง / จองเลย <IonIcon icon={arrowForward} slot="end" />
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BadmintonVenuePCR;