import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonIcon, IonBadge
} from '@ionic/react';
import { locationOutline, walkOutline } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ฟังก์ชัน Haversine คำนวณระยะทาง
const haversineKm = (p1: {lat:number, lng:number}, p2: {lat:number, lng:number}) => {
  const R = 6371;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(p1.lat * Math.PI/180) * Math.cos(p2.lat * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const VenueSearch: React.FC = () => {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | 'football' | 'badminton'>('all');
  const [venues, setVenues] = useState<any[]>([]);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // 1. ดึงพิกัดเรา
    Geolocation.getCurrentPosition().then(pos => {
      setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }).catch(() => console.log("Geolocation denied"));

    // 2. ดึงพิกัดสนาม
    getDocs(collection(db, 'venues')).then(snap => {
      setVenues(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const filtered = useMemo(() => {
    return venues
      .filter(v => (type === 'all' || v.type === type))
      .filter(v => v.name.toLowerCase().includes(q.toLowerCase()))
      .map(v => ({
        ...v,
        _km: (me && v.lat) ? haversineKm(me, { lat: v.lat, lng: v.lng }) : Infinity
      }))
      .sort((a, b) => a._km - b._km);
  }, [venues, q, type, me]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="dark">
          <IonButtons slot="start"><IonBackButton defaultHref="/home" /></IonButtons>
          <IonLabel style={{ fontWeight: 700 }}>ค้นหาสนาม</IonLabel>
        </IonToolbar>
        <IonToolbar color="dark">
          <IonSearchbar onIonInput={e => setQ(e.detail.value!)} placeholder="ชื่อสนาม หรือโซน..." />
          <IonSegment value={type} onIonChange={e => setType(e.detail.value as any)}>
            <IonSegmentButton value="all"><IonLabel>ทั้งหมด</IonLabel></IonSegmentButton>
            <IonSegmentButton value="football"><IonLabel>ฟุตบอล</IonLabel></IonSegmentButton>
            <IonSegmentButton value="badminton"><IonLabel>แบด</IonLabel></IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="lux-page">
        {/* Map View */}
        <div style={{ height: '300px', width: '100%' }}>
          <MapContainer center={me || {lat: 16.4322, lng: 102.8236}} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filtered.filter(v => v.lat).map(v => (
              <Marker key={v.id} position={[v.lat, v.lng]}>
                <Popup><b>{v.name}</b><br/>{v.zone}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* List View */}
        <div style={{ padding: '16px' }}>
          {filtered.map(v => (
            <div key={v.id} onClick={() => window.location.href=`/venue-detail/${v.id}`} style={{
              background: '#1a1a1a', padding: '15px', borderRadius: '15px', marginBottom: '10px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #333'
            }}>
              <div>
                <h3 style={{ margin: 0, color: 'white' }}>{v.name}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                  <IonIcon icon={locationOutline} /> {v.zone}
                </p>
                {v._km !== Infinity && (
                  <p style={{ margin: 0, color: '#FFD700', fontSize: '0.85rem' }}>
                    <IonIcon icon={walkOutline} /> {v._km.toFixed(1)} กม. จากคุณ
                  </p>
                )}
              </div>
              <IonBadge color="success">฿{v.priceRange?.split(' ')[0]}</IonBadge>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VenueSearch;