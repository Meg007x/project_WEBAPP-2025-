// src/pages/FootballVenue.tsx
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonBadge
} from '@ionic/react';
import {
  timeOutline, locationOutline, callOutline, arrowForward,
  mapOutline, wifiOutline, carOutline, footballOutline
} from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';
import './Home.css';

import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// นำเข้าข้อมูลจำลอง
import { footballVenuesData } from '../data/mockfootball';

type VenueDoc = {
  id: string;
  type: 'football' | 'badminton';
  name: string;
  zone: string;
  distance: string;
  rating?: number;
  priceRange: string;
  openTime: string;
  closeTime?: string;
  location: string;
  facilities?: string[];
  imageUrl: string;
  totalCourts?: number;
};

const FootballVenue: React.FC = () => {
  const location = useLocation<any>();
  const history = useHistory();
  const venueId: string = String(location.state?.venueId ?? 'football_1');

  const [venue, setVenue] = useState<VenueDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // ดัก Mock Data
        if (venueId.startsWith('mock_')) {
          const mockId = Number(venueId.replace('mock_', ''));
          const mockData = footballVenuesData.find(v => v.id === mockId);
          if (mockData && mounted) {
            setVenue({
              id: venueId,
              type: 'football',
              name: mockData.name,
              zone: mockData.zone,
              distance: mockData.distance,
              rating: mockData.rating,
              priceRange: mockData.priceRange,
              openTime: mockData.openTime.split(' - ')[0],
              closeTime: mockData.openTime.split(' - ')[1],
              location: mockData.location,
              facilities: mockData.facilities,
              imageUrl: mockData.imageUrl,
              totalCourts: mockData.totalCourts
            });
          }
          return;
        }

        const ref = doc(db, 'venues', venueId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          if (mounted) setVenue(null);
          return;
        }

        const data = { ...(snap.data() as any), id: snap.id } as VenueDoc;
        if (mounted) setVenue(data);
      } catch (e) {
        console.error('load football venue error:', e);
        if (mounted) setVenue(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [venueId]);

  const handleBooking = () => {
    if (!venue) return;
    history.push({
      pathname: '/football-select',
      state: { venueId: venue.id }
    });
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar className="lux-toolbar">
            <IonButtons slot="start"><IonBackButton defaultHref="/football-list" color="light" /></IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="lux-page">
          <div style={{ textAlign: 'center', marginTop: '40%', color: '#666' }}>
            <p>กำลังโหลดรายละเอียด...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!venue) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar className="lux-toolbar">
            <IonButtons slot="start"><IonBackButton defaultHref="/football-list" color="light" /></IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="lux-page">
          <div style={{ textAlign: 'center', marginTop: '40%', color: '#666' }}>
            <p>ไม่พบข้อมูลสนาม</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const nightPrice = (venue.priceRange?.includes('-'))
    ? venue.priceRange.split('-')[1].trim()
    : venue.priceRange;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/football-list" color="light" /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">

          <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #333', height: '220px' }}>
            <img
              src={venue.imageUrl}
              alt="field"
              style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="user-name" style={{ fontSize: '1.8rem', margin: 0 }}>{venue.name}</h1>
            <IonBadge color="warning" style={{ fontSize: '1rem', padding: '8px 12px', borderRadius: '8px' }}>⭐ {venue.rating ?? 4.7}</IonBadge>
          </div>

          <p style={{ color: '#aaa', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IonIcon icon={locationOutline} /> ห่างจากคุณ {venue.distance}
          </p>

          <div style={{ background: '#222', padding: '15px', borderRadius: '15px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <IonIcon icon={mapOutline} style={{ fontSize: '2rem', color: '#FFD700' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>ตำแหน่งที่ตั้ง / โซน</div>
              <div style={{ color: '#888', fontSize: '0.9rem' }}>{venue.location} ({venue.zone})</div>
            </div>
            
            {/* แก้เฉพาะส่วนนี้ครับ */}
            <IonButton 
              fill="outline" 
              color="warning" 
              onClick={() => {
                const mapQuery = encodeURIComponent(`${venue.name} ขอนแก่น`);
                window.open(`https://maps.google.com/?q=${mapQuery}`, '_blank');
              }}
            >
              ดูแผนที่
            </IonButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            <div className="sport-card" style={{ padding: '15px' }}>
              <IonIcon icon={timeOutline} style={{ color: '#FFD700', fontSize: '24px' }} />
              <h4 style={{ margin: '5px 0' }}>เวลาทำการ</h4>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>
                {venue.openTime}{venue.closeTime ? ` - ${venue.closeTime}` : ''}
              </p>
            </div>
            <div className="sport-card" style={{ padding: '15px' }}>
              <IonIcon icon={callOutline} style={{ color: '#FFD700', fontSize: '24px' }} />
              <h4 style={{ margin: '5px 0' }}>ติดต่อ</h4>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>089-xxx-xxxx</p>
            </div>
          </div>

          <div className="field-card" style={{ padding: '20px', marginTop: '20px', borderRadius: '20px' }}>
            <h3 style={{ color: 'white', margin: 0, borderLeft: '4px solid #D4AF37', paddingLeft: '10px' }}>อัตราค่าบริการ</h3>
            <ul style={{ color: '#ccc', lineHeight: '1.8', paddingLeft: '20px', marginTop: '10px' }}>
              <li>🌞 10:00 - 17:00 : <span className="text-gold">800฿ / ชม.</span></li>
              <li>🌙 17:00 - 24:00 : <span className="text-gold">{nightPrice}฿ / ชม.</span></li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
            {venue.facilities?.length ? (
              venue.facilities.map((fac, i) => <IonBadge key={i} color="medium">{fac}</IonBadge>)
            ) : (
              <>
                <IonBadge color="medium"><IonIcon icon={carOutline} /> ที่จอดรถ</IonBadge>
                <IonBadge color="medium"><IonIcon icon={wifiOutline} /> WiFi</IonBadge>
                <IonBadge color="medium"><IonIcon icon={footballOutline} /> ลูกบอลฟรี</IonBadge>
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

export default FootballVenue;