// src/pages/CourtSelectPCR.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonFooter, IonModal, IonDatetime,
  IonSelect, IonSelectOption, useIonViewWillEnter, IonDatetimeButton
} from '@ionic/react';
import { checkmarkCircle, calendarOutline, arrowForwardOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './Home.css';

import { calcDurationHours, calcTotalPrice } from '../utils/pricing';

const CourtSelectPCR: React.FC = () => {
  const history = useHistory();
  const location = useLocation<any>();

  const [selectedCourts, setSelectedCourts] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<string>('17:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());

  // ✅ ข้อมูลเริ่มต้นของ PCR Badminton
  const [venue, setVenue] = useState<any>({
    id: 2,
    name: 'PCR Badminton',
    totalCourts: 6, // ✅ PCR มี 6 คอร์ท
    priceRange: '120 - 170'
  });

  useIonViewWillEnter(() => {
    if (location.state?.venue) setVenue(location.state.venue);
    setSelectedCourts([]);
  });

  useEffect(() => {
    const s = Number(startTime.split(':')[0]);
    const e = Number(endTime.split(':')[0]);
    if (e <= s) {
      const next = Math.min(24, s + 1);
      setEndTime(`${String(next).padStart(2, '0')}:00`);
    }
  }, [startTime]);

  // ✅ สร้างคอร์ทแค่ 6 คอร์ท
  const courts = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      status: 'available' as 'available' | 'occupied'
    }));
  }, []);

  const timeOptions = useMemo(() => {
    const arr: string[] = [];
    for (let i = 10; i <= 24; i++) arr.push(`${String(i).padStart(2, '0')}:00`);
    return arr;
  }, []);

  const duration = useMemo(() => calcDurationHours(startTime, endTime), [startTime, endTime]);

  const toggleCourt = (id: number) => {
    setSelectedCourts(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const goToBooking = () => {
    let finalPrice = calcTotalPrice({
      priceRange: venue?.priceRange,
      startTime,
      endTime,
      units: selectedCourts.length
    });

    history.push({
      pathname: '/booking-detail',
      state: {
        courtIds: selectedCourts,
        startTime,
        endTime,
        duration,
        date: selectedDate,
        totalPrice: finalPrice, 
        venue: { ...venue, name: 'PCR Badminton' }
        // ❌ ไม่มี hasShoeRental เพราะสนามนี้ไม่มีให้เช่า
      }
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/badminton-venue" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>จองสนาม ({venue.name})</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">
          <div className="lux-card" style={{ padding: '20px', marginBottom: '25px', border: '1px solid #FFD700' }}>
             <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#FFD700', fontSize: '0.9rem', marginBottom: '8px' }}>
                <IonIcon icon={calendarOutline} style={{ verticalAlign: 'middle' }} /> วันที่
              </div>
              <IonDatetimeButton datetime="datetime-pcr"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime id="datetime-pcr" presentation="date" value={selectedDate} onIonChange={e => setSelectedDate(e.detail.value as string)} style={{ '--background': '#1a1a1a', '--ion-text-color': '#fff', '--accent-color': '#FFD700' } as any} />
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
          </div>

          <h3 style={{ color: 'white', borderLeft: '4px solid #FFD700', paddingLeft: '10px' }}>
            เลือกสนามว่าง ({courts.length} คอร์ท)
          </h3>

          <div className="court-grid-8">
            {courts.map((court) => (
              <div key={court.id} className={`court-box ${selectedCourts.includes(court.id) ? 'selected' : ''}`} onClick={() => toggleCourt(court.id)}>
                <div className="court-lines"></div>
                <h3 style={{ margin: 0, zIndex: 2, color: selectedCourts.includes(court.id) ? 'black' : 'white' }}>{court.id}</h3>
                {selectedCourts.includes(court.id) && <IonIcon icon={checkmarkCircle} style={{ position: 'absolute', top: 5, right: 5, color: 'black' }} />}
              </div>
            ))}
          </div>

          <div style={{ height: '60px' }}></div>
        </div>
      </IonContent>

      {selectedCourts.length > 0 && (
        <IonFooter className="ion-no-border">
          <IonToolbar className="lux-toolbar">
            <IonButton expand="block" color="warning" onClick={goToBooking} style={{ margin: '10px', fontWeight: 'bold', '--color': 'black' } as any}>
              ต่อไป ({selectedCourts.length} คอร์ท)
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default CourtSelectPCR;