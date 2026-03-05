import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

type Venue = {
  id: string;
  name: string;
  zone?: string;
  location?: string;
  lat?: number;
  lng?: number;
};

const VenueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'venues', id));
      if (snap.exists()) setVenue({ ...(snap.data() as any), id: snap.id });
      else setVenue(null);
    })();
  }, [id]);

  if (!venue) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/home" /></IonButtons></IonToolbar></IonHeader>
        <IonContent fullscreen style={{ padding: 16 }}>ไม่พบข้อมูลสนาม</IonContent>
      </IonPage>
    );
  }

  const center = (venue.lat && venue.lng) ? { lat: venue.lat, lng: venue.lng } : { lat: 16.4769, lng: 102.8236 };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/home" /></IonButtons>
          <div style={{ paddingLeft: 8, fontWeight: 800 }}>{venue.name}</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: 16 }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
            <MapContainer center={center as any} zoom={15} style={{ height: 300, width: '100%' }}>
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {venue.lat && venue.lng && (
                <Marker position={center as any}>
                  <Popup>
                    <div style={{ fontWeight: 800 }}>{venue.name}</div>
                    <div style={{ fontSize: 12 }}>{venue.location ?? ''}</div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          <div style={{ marginTop: 12 }}>
            <div><b>โซน:</b> {venue.zone ?? '-'}</div>
            <div><b>ที่อยู่:</b> {venue.location ?? '-'}</div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VenueDetail;