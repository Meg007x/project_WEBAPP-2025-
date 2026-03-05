import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonBadge, IonSkeletonText
} from '@ionic/react';
import {
  timeOutline, locationOutline, arrowForward,
  mapOutline, walletOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import './Home.css';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const FootballVenue: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, 'venues', id));
        if (snap.exists()) setVenue({ ...snap.data(), id: snap.id });
      } catch (e) {
        console.error('Error fetching venue:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ✅ ให้เหมือนฝั่งแบด: เปิด Maps ด้วย ?q= (ใช้ location ก่อน ถ้าไม่มีค่อยใช้ชื่อสนาม)
  const openGoogleMap = () => {
    const mapQuery =
      venue?.location ||
      (venue?.name ? `สนามฟุตบอล ${venue.name}` : '16.485,102.855');

    window.open(`https://maps.google.com/?q=${encodeURIComponent(mapQuery)}`, '_blank');
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <IonSkeletonText animated style={{ height: '100%' }} />
        </IonContent>
      </IonPage>
    );
  }

  if (!venue) {
    return (
      <IonPage>
        <IonContent className="ion-padding">ไม่พบข้อมูลสนาม</IonContent>
      </IonPage>
    );
  }

  // ✅ ให้เหมือนแบด: ถ้า priceRange เป็น "500 - 800" เอาเลขหลังเป็นราคากลางคืน
  const nightPrice =
    (venue?.priceRange && String(venue.priceRange).includes('-'))
      ? String(venue.priceRange).split('-')[1].trim()
      : (venue?.nightPrice ?? venue?.priceRange ?? '800');

  const dayPrice =
    venue?.dayPrice ??
    (venue?.priceRange && String(venue.priceRange).includes('-')
      ? String(venue.priceRange).split('-')[0].trim()
      : '500');

  // ✅ facilities ให้เหมือนแบด (ถ้าไม่มีใน DB ให้ fallback)
  const facilities: string[] = Array.isArray(venue?.facilities)
    ? venue.facilities
    : ['ที่จอดรถ', 'WiFi', 'ห้องน้ำ', 'เครื่องดื่ม'];

  return (
    <IonPage>
      {/* ✅ Header เหมือน BadmintonVenue */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/football-list" color="light" />
          </IonButtons>
          <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
            รายละเอียดสนาม
          </div>
        </IonToolbar>
      </IonHeader>

      {/* ✅ Content wrapper เหมือน BadmintonVenue */}
      <IonContent fullscreen className="lux-page">
        <div className="lux-container">
          {/* ✅ Banner เหมือนแบด */}
          <div
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              marginBottom: '20px',
              border: '1px solid #333',
              height: '220px'
            }}
          >
            <img
              src={venue.imageUrl}
              alt={venue.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* ✅ ชื่อ + rating เหมือนแบด */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="user-name" style={{ fontSize: '1.8rem', margin: 0 }}>
              {venue.name}
            </h1>
            <IonBadge
              color="warning"
              style={{ fontSize: '1rem', padding: '8px 12px', borderRadius: '8px' }}
            >
              ⭐ {venue.rating ?? '5.0'}
            </IonBadge>
          </div>

          {/* ✅ ระยะทาง เหมือนแบด */}
          <p
            style={{
              color: '#aaa',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <IonIcon icon={locationOutline} style={{ color: '#FFD700' }} />
            ห่างจากคุณ {venue.distance ?? '2.5'} กม.
          </p>

          {/* ✅ กล่องโซน + ปุ่มดูแผนที่ เหมือนแบด */}
          <div
            style={{
              background: '#222',
              padding: '15px',
              borderRadius: '15px',
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <IonIcon icon={mapOutline} style={{ fontSize: '2rem', color: '#FFD700' }} />
              <div>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>ตำแหน่ง/โซน</div>
                <div style={{ color: '#888', fontSize: '0.8rem' }}>
                  {venue.zone ?? '-'}
                </div>
              </div>
            </div>

            <IonButton
              fill="outline"
              color="primary"
              onClick={openGoogleMap}
            >
              ดูแผนที่
            </IonButton>
          </div>

          {/* ✅ การ์ดเวลา/ราคา แบบ 2 คอลัมน์ เหมือนแบด */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            <div className="sport-card" style={{ padding: '15px', background: '#1a1a1a', borderRadius: '15px' }}>
              <IonIcon icon={timeOutline} style={{ color: '#FFD700', fontSize: '24px' }} />
              <h4 style={{ margin: '5px 0', color: '#fff' }}>เวลาทำการ</h4>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>
                {venue.openTime ?? '10:00'} - {venue.closeTime ?? '24:00'}
              </p>
            </div>

            <div className="sport-card" style={{ padding: '15px', background: '#1a1a1a', borderRadius: '15px' }}>
              <IonIcon icon={walletOutline} style={{ color: '#FFD700', fontSize: '24px' }} />
              <h4 style={{ margin: '5px 0', color: '#fff' }}>ราคาเริ่มต้น</h4>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>
                {venue.priceRange ?? `${dayPrice} - ${nightPrice}`} ฿
              </p>
            </div>
          </div>

          {/* ✅ อัตราค่าบริการ เหมือนแบด */}
          <div className="field-card" style={{ padding: '20px', marginTop: '20px', borderRadius: '20px', background: '#1a1a1a' }}>
            <h3 style={{ color: 'white', margin: 0, borderLeft: '4px solid #FFD700', paddingLeft: '10px' }}>
              อัตราค่าบริการ
            </h3>
            <ul style={{ color: '#ccc', lineHeight: '1.8', paddingLeft: '20px', marginTop: '10px' }}>
              <li>🌞 กลางวัน : <span style={{ color: '#FFD700' }}>{dayPrice}฿ / ชม.</span></li>
              <li>🌙 กลางคืน : <span style={{ color: '#FFD700' }}>{nightPrice}฿ / ชม.</span></li>
            </ul>
          </div>

          {/* ✅ Facilities เป็น badge เหมือนแบด */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
            {facilities.map((fac: string, i: number) => (
              <IonBadge key={i} color="medium" style={{ padding: '5px 10px' }}>
                {fac}
              </IonBadge>
            ))}
          </div>

          {/* ✅ ปุ่มจองท้ายหน้า เหมือนแบด */}
          <div style={{ marginTop: '30px', paddingBottom: '30px' }}>
            <IonButton
              expand="block"
              color="warning"
              shape="round"
              style={{ fontWeight: 'bold', height: '55px', '--color': 'black' }}
              onClick={() => history.push(`/football-select`, { venue })}
            >
              จองสนามว่าง ({venue.name}) <IonIcon icon={arrowForward} slot="end" />
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default FootballVenue;