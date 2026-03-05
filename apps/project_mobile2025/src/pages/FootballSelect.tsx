// src/pages/FootballSelect.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonFooter, IonDatetimeButton, IonModal, IonDatetime,
  IonSelect, IonSelectOption
} from '@ionic/react';
import { checkmarkCircle, calendarOutline, arrowForwardOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './Home.css';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { calcDurationHours, calcTotalPrice } from '../utils/pricing';

// นำเข้าข้อมูลจำลอง
import { footballVenuesData } from '../data/mockfootball';

type VenueDoc = {
  id: string;
  name: string;
  priceRange: string;
  totalCourts?: number;
};

type SubVenueDoc = {
  id: string;
  venueId: string;
  name: string;
};

const FootballSelect: React.FC = () => {
  const history = useHistory();
  const location = useLocation<any>();
  const venueId: string = String(location.state?.venueId ?? 'football_1');

  const [venue, setVenue] = useState<VenueDoc | null>(null);
  const [subvenues, setSubvenues] = useState<SubVenueDoc[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>('17:00');
  const [endTime, setEndTime] = useState<string>('19:00');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());

  // โหลด venue + subvenues ตาม venueId
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // ดัก Mock Data
        if (venueId.startsWith('mock_')) {
          const mockId = Number(venueId.replace('mock_', ''));
          const mockData = footballVenuesData.find(v => v.id === mockId);
          if (mockData && mounted) {
            setVenue({
              id: venueId,
              name: mockData.name,
              priceRange: mockData.priceRange,
              totalCourts: mockData.totalCourts
            });
            // จำลองสนามย่อย
            const mockSubvenues = Array.from({ length: mockData.totalCourts }, (_, i) => ({
              id: `mock_field_${i + 1}`,
              venueId: venueId,
              name: `Field ${String.fromCharCode(65 + i)}`
            }));
            setSubvenues(mockSubvenues);
            setSelectedFields([]);
          }
          return;
        }

        // 1) venue
        const vRef = doc(db, 'venues', venueId);
        const vSnap = await getDoc(vRef);
        const v = vSnap.exists()
          ? ({ ...(vSnap.data() as any), id: vSnap.id } as VenueDoc)
          : null;

        // 2) subvenues (สนามย่อย)
        const subRef = collection(db, 'subvenues');
        const qSub = query(subRef, where('venueId', '==', venueId));
        const subSnap = await getDocs(qSub);
        const subs = subSnap.docs.map(d => ({ ...(d.data() as any), id: d.id })) as SubVenueDoc[];
        if (mounted) {
          setVenue(v);
          setSubvenues(subs);
          setSelectedFields([]);
        }
      } catch (e) {
        console.error('load football select data error:', e);
        if (mounted) {
          setVenue(null);
          setSubvenues([]);
        }
      }
    })();

    return () => { mounted = false; };
  }, [venueId]);

  // กัน endTime <= startTime
  useEffect(() => {
    const s = Number(startTime.split(':')[0]);
    const e = Number(endTime.split(':')[0]);
    if (e <= s) {
      const next = Math.min(24, s + 1);
      setEndTime(`${String(next).padStart(2, '0')}:00`);
    }
  }, [startTime]);
  // eslint-disable-line

  const timeOptions = useMemo(() => {
    const arr: string[] = [];
    for (let i = 10; i <= 24; i++) arr.push(`${String(i).padStart(2, '0')}:00`);
    return arr;
  }, []);
  const duration = useMemo(() => calcDurationHours(startTime, endTime), [startTime, endTime]);

  // list สนามย่อยจาก Firestore หรือ Mock
  const fields = useMemo(() => {
    if (subvenues.length > 0) {
      return subvenues.map((s) => ({
        id: s.id,
        name: s.name,
        status: 'available' as 'available' | 'occupied'
      }));
    }

    // fallback
    const total = venue?.totalCourts ?? 2;
    return Array.from({ length: total }, (_, i) => ({
      id: `auto_${i + 1}`,
      name: `Field ${String.fromCharCode(65 + i)}`,
      status: 'available' as const
    }));
  }, [subvenues, venue]);
  
  // เลือกได้ทีละ 1 สนาม
  const toggleField = (id: string) => {
    setSelectedFields(prev => (prev[0] === id ? [] : [id]));
  };

  const goToBooking = () => {
    if (!venue) return;
    const totalPrice = calcTotalPrice({
      priceRange: venue.priceRange,
      startTime,
      endTime,
      units: selectedFields.length
    });
    history.push({
      pathname: '/booking-detail',
      state: {
        courtIds: selectedFields,
        startTime,
        endTime,
        duration,
        date: selectedDate,
        totalPrice,
        venue: { id: venue.id, name: venue.name, priceRange: venue.priceRange, totalCourts: venue.totalCourts ?? fields.length }
      }
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/football-venue" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
            จองสนามบอล ({venue?.name ?? '...'})
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">

          <div className="lux-card" style={{ padding: '20px', marginBottom: '25px', border: '1px solid #FFD700' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#FFD700', fontSize: '0.9rem', marginBottom: '8px' }}>
                <IonIcon icon={calendarOutline} style={{ verticalAlign: 'middle', marginRight: 5 }} /> วันที่เตะ
              </div>

              <IonDatetimeButton datetime="datetime-football"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  id="datetime-football"
                  presentation="date"
                  value={selectedDate}
                  onIonChange={e => setSelectedDate(e.detail.value as string)}
                  style={{ '--background': '#1a1a1a', '--ion-text-color': '#fff', '--accent-color': '#FFD700' } as any}
                />
              </IonModal>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#FFD700', fontSize: '0.8rem' }}>เริ่ม</div>
                <IonSelect value={startTime} onIonChange={e => setStartTime(e.detail.value)} className="lux-input" interface="action-sheet">
                  {timeOptions.slice(0, -1).map(t => <IonSelectOption key={t} value={t}>{t}</IonSelectOption>)}
                </IonSelect>
              </div>

              <IonIcon icon={arrowForwardOutline} style={{ color: '#666', marginTop: '20px' }} />

              <div style={{ flex: 1 }}>
                <div style={{ color: '#FFD700', fontSize: '0.8rem' }}>ถึงเวลา</div>
                <IonSelect value={endTime} onIonChange={e => setEndTime(e.detail.value)} className="lux-input" interface="action-sheet">
                  {timeOptions.map(t => {
                    const tVal = Number(t.split(':')[0]);
                    const sVal = Number(startTime.split(':')[0]);
                    return tVal > sVal ? <IonSelectOption key={t} value={t}>{t}</IonSelectOption> : null;
                  })}
                </IonSelect>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '15px', color: '#aaa', fontSize: '0.9rem' }}>
              รวมระยะเวลา: <span style={{ color: '#fff', fontWeight: 'bold' }}>{duration} ชั่วโมง</span>
            </div>
          </div>

          <h3 style={{ color: 'white', borderLeft: '4px solid #FFD700', paddingLeft: '10px' }}>
            เลือกสนามว่าง ({fields.length} สนาม)
          </h3>

          <div className="court-grid-8" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {fields.map((field) => (
              <div
                key={field.id}
                className={`court-box ${selectedFields.includes(field.id) ? 'selected' : ''}`}
                style={{ opacity: field.status === 'occupied' ? 0.3 : 1, aspectRatio: '1.5/1' }}
                onClick={() => field.status === 'available' && toggleField(field.id)}
              >
                <div style={{
                  position: 'absolute', inset: 10, border: '2px solid rgba(255,255,255,0.3)', borderRadius: 5,
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  <div style={{ width: 30, height: 30, border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%' }}></div>
                  <div style={{ position: 'absolute', height: '100%', width: 1, background: 'rgba(255,255,255,0.3)' }}></div>
                </div>

                <h3 style={{ margin: 0, zIndex: 2, color: selectedFields.includes(field.id) ? 'black' : 'white', fontSize: '1.2rem' }}>
                  {field.name}
                </h3>

                {selectedFields.includes(field.id) && (
                  <IonIcon icon={checkmarkCircle} style={{ position: 'absolute', top: 5, right: 5, color: 'black', fontSize: '1.5rem' }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ height: '60px' }}></div>
        </div>
      </IonContent>

      {selectedFields.length > 0 && (
        <IonFooter className="ion-no-border">
          <IonToolbar className="lux-toolbar">
            <IonButton
              expand="block"
              color="warning"
              onClick={goToBooking}
              style={{ margin: '10px', fontWeight: 'bold', '--color': 'black' } as any}
            >
              ต่อไป (1 สนาม)
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default FootballSelect;