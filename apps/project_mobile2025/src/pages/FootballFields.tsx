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
  rating?: number;
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
      pathname: `/venue-detail/${v.id}`, // ให้ตรงกับ App.tsx ของคุณ
      state: { venueId: v.id }
    });
  };

  const filteredList = list.filter(v =>
    (v.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (v.zone || '').toLowerCase().includes(searchText.toLowerCase())
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
        {/* ✅ เหมือนฝั่งแบด: ไม่ต้องใส่ padding ซ้ำหลายชั้น */}
        <div className="lux-container">

          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="ค้นหาชื่อสนามฟุตบอล..."
            animated={true}
            style={{ '--background': '#222', '--color': '#fff', padding: '0', paddingBottom: '15px' } as any}
          />

          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '30%', color: '#aaa' }}>กำลังโหลดสนาม...</div>
          ) : filteredList.map((v) => (
            <IonCard
              key={v.id}
              className="lux-card"
              style={{ marginBottom: '20px', borderRadius: '15px', overflow: 'hidden' }}
            >
              {/* ✅ ส่วนรูปบนการ์ด เหมือนแบด */}
              <div style={{ height: '200px', position: 'relative' }}>
                <img
                  src={v.imageUrl}
                  alt={v.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* ✅ badge rating เหมือนแบด */}
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <IonBadge color="warning" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                    <IonIcon icon={star} style={{ marginRight: '3px' }} /> {v.rating ?? 5.0}
                  </IonBadge>
                </div>

                {/* ✅ gradient + ชื่อ + ระยะทาง/โซน เหมือนแบด */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    padding: '20px 15px 10px'
                  }}
                >
                  <h2
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      margin: 0,
                      fontSize: '1.5rem',
                      textShadow: '2px 2px 4px black'
                    }}
                  >
                    {v.name}
                  </h2>

                  <div style={{ color: '#ccc', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={locationOutline} style={{ marginRight: '5px', color: '#FFD700' }} />
                    {v.distance} • {v.zone}
                  </div>
                </div>
              </div>

              {/* ✅ ส่วนล่างการ์ด เหมือนแบด */}
              <IonCardContent style={{ paddingTop: '15px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                    fontSize: '0.9rem',
                    color: '#ddd'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={timeOutline} style={{ marginRight: '6px', color: '#2dd36f' }} />
                    {v.openTime}{v.closeTime ? ` - ${v.closeTime}` : ''}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={walletOutline} style={{ marginRight: '6px', color: '#FFD700' }} />
                    {v.priceRange} บาท/ชม.
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                  <IonButton
                    expand="block"
                    color="warning"
                    onClick={() => openVenueDetail(v)}
                    style={{ '--color': 'black', fontWeight: 'bold', '--border-radius': '8px' } as any}
                  >
                    ดูรายละเอียด & จอง <IonIcon icon={arrowForward} slot="end" />
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default FootballFields;