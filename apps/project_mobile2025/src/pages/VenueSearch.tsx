import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonIcon
} from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { haversineKm } from '../utils/distance';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Venue = {
  id: string;
  type: 'badminton' | 'football';
  name: string;
  zone?: string;
  location?: string;
  priceRange?: string;
  openTime?: string;
  closeTime?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
};

const DEFAULT_CENTER = { lat: 16.4769, lng: 102.8236 }; // โซน มข. / ขอนแก่น ปรับได้

const VenueSearch: React.FC = () => {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | 'football' | 'badminton'>('all');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);

  // 1) โหลด venues จาก Firestore
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'venues'));
      const list: Venue[] = snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
      setVenues(list);
    })();
  }, []);

  // 2) ขอพิกัดผู้ใช้ (ถ้าไม่ได้ก็ยังใช้ได้ แค่ไม่เรียง “ใกล้เคียงจริง”)
  useEffect(() => {
    (async () => {
      try {
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        setMe(null);
      }
    })();
  }, []);

  // 3) filter + คำนวณระยะทาง + sort ใกล้สุดก่อน
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();

    const byType = venues.filter(v => (type === 'all' ? true : v.type === type));
    const byText = byType.filter(v => {
      if (!kw) return true;
      const hay = `${v.name} ${v.zone ?? ''} ${v.location ?? ''}`.toLowerCase();
      return hay.includes(kw);
    });

    const withDist = byText.map(v => {
      if (me && typeof v.lat === 'number' && typeof v.lng === 'number') {
        const km = haversineKm(me, { lat: v.lat, lng: v.lng });
        return { ...v, _km: km };
      }
      return { ...v, _km: Number.POSITIVE_INFINITY };
    });

    withDist.sort((a: any, b: any) => a._km - b._km);
    return withDist as Array<Venue & { _km: number }>;
  }, [venues, q, type, me]);

  const mapCenter = me ?? DEFAULT_CENTER;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <div style={{ paddingLeft: 8, fontWeight: 700 }}>ค้นหา/สนามใกล้เคียง</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: 16 }}>
          <IonSearchbar
            value={q}
            onIonChange={e => setQ(e.detail.value ?? '')}
            placeholder="ค้นหาชื่อสนาม/โซน..."
          />

          <IonSegment value={type} onIonChange={e => setType(e.detail.value as any)} style={{ marginTop: 8 }}>
            <IonSegmentButton value="all"><IonLabel>ทั้งหมด</IonLabel></IonSegmentButton>
            <IonSegmentButton value="football"><IonLabel>ฟุตบอล</IonLabel></IonSegmentButton>
            <IonSegmentButton value="badminton"><IonLabel>แบด</IonLabel></IonSegmentButton>
          </IonSegment>

          {/* Map (หน้ารวม) */}
          <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
            <MapContainer center={mapCenter as any} zoom={13} style={{ height: 260, width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {me && (
                <Marker position={me as any}>
                  <Popup>ตำแหน่งของคุณ</Popup>
                </Marker>
              )}

              {filtered
                .filter(v => typeof v.lat === 'number' && typeof v.lng === 'number')
                .map(v => (
                  <Marker key={v.id} position={{ lat: v.lat!, lng: v.lng! } as any}>
                    <Popup>
                      <div style={{ fontWeight: 700 }}>{v.name}</div>
                      <div style={{ fontSize: 12 }}>{v.zone ?? ''}</div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>

          {/* List */}
          <div style={{ marginTop: 12 }}>
            {filtered.map(v => (
              <div
                key={v.id}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: '1px solid #333',
                  marginBottom: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => {
                  // ไปหน้ารายละเอียด: ส่ง id
                  window.location.href = `/venue/${v.id}`; // ถ้าคุณใช้ history ก็เปลี่ยนเป็น history.push
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{v.name}</div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>
                    <IonIcon icon={locationOutline} /> {v.zone ?? '-'} • {v.location ?? '-'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: 12, opacity: 0.85 }}>
                  {v._km !== Infinity ? `${v._km.toFixed(2)} กม.` : 'ไม่มีพิกัด'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VenueSearch;