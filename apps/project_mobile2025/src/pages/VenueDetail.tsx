import React, { useEffect, useState } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, 
  IonBackButton, IonBadge, IonIcon, IonButton, IonSkeletonText 
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { locationOutline, timeOutline, star } from 'ionicons/icons';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Interface ให้ครอบคลุมข้อมูลที่มีใน Firestore
type Venue = {
  id: string;
  name: string;
  type: string;
  zone?: string;
  location?: string;
  lat?: number;
  lng?: number;
  imageUrl?: string;
  priceRange?: string;
  openTime?: string;
  closeTime?: string;
  rating?: number;
};

const VenueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const snap = await getDoc(doc(db, 'venues', id));
        if (snap.exists()) {
          setVenue({ ...(snap.data() as any), id: snap.id });
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  // ฟังก์ชันนำทางไปหน้าจอง (ตรวจสอบประเภทกีฬาเพื่อส่งไปหน้าถูก)
  const goToBooking = () => {
    if (!venue) return;
    // ตัวอย่าง: ถ้าเป็น PS Badminton ส่งไปหน้าจองของ PS
    if (venue.name.includes('PS')) history.push('/ps-booking');
    else if (venue.name.includes('PCR')) history.push('/pcr-booking');
    else history.push('/court-select'); // default
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent><IonSkeletonText animated style={{ height: '100%' }} /></IonContent>
      </IonPage>
    );
  }

  if (!venue) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton /></IonButtons></IonToolbar></IonHeader>
        <IonContent className="ion-padding">ไม่พบข้อมูลสนาม</IonContent>
      </IonPage>
    );
  }

  const center: [number, number] = (venue.lat && venue.lng) ? [venue.lat, venue.lng] : [16.4769, 102.8236];

  return (
    <IonPage>
      <IonContent fullscreen className="lux-page">
        {/* Header Image */}
        <div style={{ position: 'relative', height: '300px' }}>
          <img src={venue.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={venue.name} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
            <IonButtons><IonBackButton defaultHref="/home" color="light" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%' }} /></IonButtons>
          </div>
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
             <IonBadge color="warning"><IonIcon icon={star} /> {venue.rating || 5.0}</IonBadge>
             <h1 style={{ margin: '5px 0', fontSize: '2rem', fontWeight: 800 }}>{venue.name}</h1>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {/* ข้อมูลเบื้องต้น */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
             <div style={{ textAlign: 'center', flex: 1, background: '#1a1a1a', padding: '10px', borderRadius: '15px' }}>
                <IonIcon icon={timeOutline} color="warning" />
                <p style={{ margin: 0, fontSize: '0.8rem' }}>เปิดบริการ</p>
                <b style={{ color: 'white' }}>{venue.openTime} - {venue.closeTime}</b>
             </div>
             <div style={{ textAlign: 'center', flex: 1, background: '#1a1a1a', padding: '10px', borderRadius: '15px' }}>
                <IonIcon icon={locationOutline} color="warning" />
                <p style={{ margin: 0, fontSize: '0.8rem' }}>โซน</p>
                <b style={{ color: 'white' }}>{venue.zone}</b>
             </div>
          </div>

          <h3 style={{ color: 'white' }}>ตำแหน่งที่ตั้ง</h3>
          <p style={{ color: '#aaa' }}>{venue.location}</p>

          {/* แผนที่ */}
          <div style={{ borderRadius: '20px', overflow: 'hidden', height: '200px', marginBottom: '25px', border: '1px solid #333' }}>
            <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={center}>
                <Popup>{venue.name}</Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* ราคาและปุ่มจอง */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            position: 'sticky', bottom: '0', background: '#000', padding: '15px 0'
          }}>
            <div>
              <p style={{ margin: 0, color: '#aaa' }}>ราคาเริ่มต้น</p>
              <h2 style={{ margin: 0, color: '#FFD700' }}>฿{venue.priceRange?.split(' ')[0]} <small>/ ชม.</small></h2>
            </div>
            <IonButton onClick={goToBooking} color="warning" shape="round" style={{ width: '150px', height: '50px', fontWeight: 'bold' }}>
              จองสนามเลย
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VenueDetail;