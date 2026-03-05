// src/pages/FootballFields.tsx
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonIcon, IonButton, IonBadge, IonSearchbar
} from '@ionic/react';
import { locationOutline, timeOutline, star, walletOutline, arrowForward } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Home.css';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

// นำเข้าข้อมูลจำลอง
import { footballVenuesData, FootballVenue } from '../data/mockfootball';

type VenueDoc = {
  id: string;
  type: 'football' | 'badminton';
  name: string;
  zone: string;
  distance: string;
  priceRange: string;
  openTime: string;
  closeTime?: string;
  location: string;
  imageUrl: string;
  totalCourts?: number;
  rating?: number;
  facilities?: string[];
};

const FootballFields: React.FC = () => {
  const history = useHistory();
  const [list, setList] = useState<VenueDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const venuesRef = collection(db, 'venues');
        const q = query(venuesRef, where('type', '==', 'football'));
        const snap = await getDocs(q);

        let rows = snap.docs.map(d => ({ ...(d.data() as any), id: d.id })) as VenueDoc[];

        // แทรก Mock Data จาก mockfootball.ts เข้าไปเสมอ
        const mockVenues: VenueDoc[] = footballVenuesData.map(v => ({
          id: `mock_${v.id}`,
          type: 'football',
          name: v.name,
          zone: v.zone,
          distance: v.distance,
          priceRange: v.priceRange,
          openTime: v.openTime.split(' - ')[0],
          closeTime: v.openTime.split(' - ')[1],
          location: v.location,
          imageUrl: v.imageUrl,
          rating: v.rating,
          totalCourts: v.totalCourts,
          facilities: v.facilities
        }));

        // รวมข้อมูลฐานข้อมูลกับ Mock Data (ป้องกัน ID ซ้ำ)
        const combinedList = [...mockVenues];
        rows.forEach(dbVenue => {
           if(!combinedList.find(m => m.name === dbVenue.name)) {
               combinedList.push(dbVenue);
           }
        });

        if (mounted) setList(combinedList);
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
      state: { venueId: v.id }
    });
  };

  const filteredList = list.filter(v => 
    v.name.toLowerCase().includes(searchText.toLowerCase()) || 
    v.zone.toLowerCase().includes(searchText.toLowerCase())
  );

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
          
          <IonSearchbar 
            value={searchText} 
            onIonInput={(e) => setSearchText(e.detail.value!)} 
            placeholder="ค้นหาชื่อสนามฟุตบอล..." 
            animated={true}
            style={{ '--background': '#222', '--color': '#fff', padding: '0', paddingBottom: '15px' } as any}
          />

          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '40%', color: '#666' }}>
              <p>กำลังโหลดสนาม...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '40%', color: '#666' }}>
              <p>ไม่พบสนามที่คุณค้นหา</p>
            </div>
          ) : (
            filteredList.map((v) => (
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