// src/pages/FootballFields.tsx
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonIcon, IonButton, IonBadge
} from '@ionic/react';
import { locationOutline, timeOutline, star, walletOutline, arrowForward } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Home.css';

import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

type VenueDoc = {
  id: string;              // เช่น football_1
  type: 'football' | 'badminton';
  name: string;
  zone: string;
  distance: string;
  priceRange: string;
  openTime: string;
  closeTime?: string;
  location: string;
  imageUrl: string;
  totalCourts?: number;    // แนะนำให้มี (จำนวนสนามย่อย)
  rating?: number;
};

const FootballFields: React.FC = () => {
  const history = useHistory();
  const [list, setList] = useState<VenueDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const venuesRef = collection(db, 'venues');
        const q = query(venuesRef, where('type', '==', 'football'));
        const snap = await getDocs(q);

        const rows = snap.docs.map(d => ({ ...(d.data() as any), id: d.id })) as VenueDoc[];

        if (mounted) setList(rows);
      } catch (e) {
        console.error('load football venues error:', e);
        if (mounted) setList([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const openVenueDetail = (v: VenueDoc) => {
    history.push({
      pathname: '/football-venue',
      state: { venueId: v.id } // ✅ ส่ง docId จริง เช่น football_1
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/home" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>สนามฟุตบอล</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '40%', color: '#666' }}>
              <p>กำลังโหลดสนาม...</p>
            </div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '40%', color: '#666' }}>
              <p>ยังไม่มีสนามฟุตบอลในฐานข้อมูล</p>
            </div>
          ) : (
            list.map((v) => (
              <IonCard
                key={v.id}
                className="lux-card"
                style={{ marginBottom: '20px', borderRadius: '15px', overflow: 'hidden' }}
              >
                <div style={{ height: '200px', position: 'relative' }}>
                  <img src={v.imageUrl} alt="field" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <IonBadge color="warning" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                      <IonIcon icon={star} /> {v.rating ?? 4.7}
                    </IonBadge>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px 15px 10px' }}>
                    <h2 style={{ color: 'white', fontWeight: 'bold', margin: 0, fontSize: '1.5rem' }}>{v.name}</h2>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                      <IonIcon icon={locationOutline} color="warning" /> {v.distance} ({v.zone})
                    </div>
                  </div>
                </div>

                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#ddd' }}>
                    <div><IonIcon icon={timeOutline} color="success" /> {v.openTime}{v.closeTime ? ` - ${v.closeTime}` : ''}</div>
                    <div><IonIcon icon={walletOutline} color="warning" /> {v.priceRange} บ./ชม.</div>
                  </div>

                  <IonButton
                    expand="block"
                    color="warning"
                    onClick={() => openVenueDetail(v)}
                    style={{ '--color': 'black', fontWeight: 'bold' } as any}
                  >
                    ดูรายละเอียด & จอง <IonIcon icon={arrowForward} slot="end" />
                  </IonButton>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default FootballFields;