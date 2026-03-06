// src/pages/CourtSelectBlueZone.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonFooter, IonModal, IonDatetime,
  IonSelect, IonSelectOption, useIonViewWillEnter, IonDatetimeButton
} from '@ionic/react';
import { checkmarkCircle, calendarOutline, arrowForwardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Home.css';
import { calcDurationHours, calcTotalPrice } from '../utils/pricing';

// ✅ นำเข้า Firebase
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { isTimeOverlap } from '../utils/time';

const CourtSelectBlueZone: React.FC = () => {
  const history = useHistory();
  const [selectedCourts, setSelectedCourts] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<string>('17:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());
  
  // ✅ State เก็บ ID
  const [occupiedCourts, setOccupiedCourts] = useState<number[]>([]);

  // ข้อมูลสนาม Blue Zone
  const venue = { 
    id: 3, 
    name: 'Blue Zone Badminton', 
    priceRange: '120 - 180' 
  };

  useIonViewWillEnter(() => {
    setSelectedCourts([]);
  });

  // ลอจิกปรับเวลาสิ้นสุดอัตโนมัติ
  useEffect(() => {
    const s = Number(startTime.split(':')[0]);
    const e = Number(endTime.split(':')[0]);
    if (e <= s) {
      const next = Math.min(24, s + 1);
      setEndTime(`${String(next).padStart(2, '0')}:00`);
    }
  }, [startTime]);

  // ✅ เช็คการจองทับซ้อน
// ✅ เช็คการจองทับซ้อน (เวอร์ชั่นปรับปรุง: ดัก Format วันที่และ ID อัตโนมัติ)
  useEffect(() => {
    let mounted = true;
    const checkAvailability = async () => {
      if (!venue?.id || !selectedDate || !startTime || !endTime) return;
      
      try {
        const dateString = selectedDate.split('T')[0]; // ตัดเอาแค่ 2026-03-06
        
        // 1. ดึงข้อมูลการจองทั้งหมดมาเช็ค (ไม่ต้องใช้ where เพื่อป้องกันปัญหา Type ไม่ตรงกัน)
        const snap = await getDocs(collection(db, 'bookings'));
        let busy: number[] = [];

        snap.forEach(doc => {
          const data = doc.data();
          
          // 2. เช็คว่า ID สถานที่ตรงกันไหม (จับแปลงเป็น String ให้หมดเพื่อเทียบกัน)
          if (String(data.venueId) === String(venue.id)) {
            
            // 3. เช็ควันที่ว่าตรงกันไหม (จับตัดให้เหลือแค่ YYYY-MM-DD เพื่อเทียบ)
            const dbDate = data.date ? String(data.date).split('T')[0] : '';
            if (dbDate === dateString) {
              
              // 4. เช็คเวลาทับซ้อน
              if (isTimeOverlap(startTime, endTime, data.startTime, data.endTime)) {
                if (Array.isArray(data.courtIds)) {
                  // ฝั่งแบดมินตัน: ดันเข้า array โดยแปลงเป็น Number
                  busy.push(...data.courtIds.map(Number)); 
                }
              }
            }
          }
        });

        // ลองพ่นค่าออกมาดูใน Console ว่าจับสนามที่ไม่ว่างได้ไหม
        console.log("สนามที่ถูกจองแล้วเวลานี้:", busy);

        if (mounted) {
          setOccupiedCourts(busy);
          // เอาสนามที่ถูกล็อคออกจากตะกร้าที่เลือกไว้
          setSelectedCourts(prev => prev.filter(id => !busy.includes(id)));
        }
      } catch (error) {
        console.error("Error checking availability:", error);
      }
    };
    
    checkAvailability();
    return () => { mounted = false; };
  }, [venue?.id, selectedDate, startTime, endTime]);

  const courts = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ id: i + 1 })), []);
  const timeOptions = useMemo(() => {
    const arr = [];
    for (let i = 9; i <= 24; i++) arr.push(`${String(i).padStart(2, '0')}:00`);
    return arr;
  }, []);

  const toggleCourt = (id: number) => {
    setSelectedCourts(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const goToBooking = () => {
    const finalPrice = calcTotalPrice({ 
        priceRange: venue.priceRange, 
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
        duration: calcDurationHours(startTime, endTime), 
        date: selectedDate, 
        totalPrice: finalPrice, 
        venue: venue 
      }
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/venue-bluezone" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>เลือกคอร์ท (Blue Zone)</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">
          
          <div className="lux-card" style={{ padding: '20px', marginBottom: '25px', border: '1px solid #FFD700' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#FFD700', fontSize: '0.9rem', marginBottom: '8px' }}>
                <IonIcon icon={calendarOutline} style={{ verticalAlign: 'middle' }} /> วันที่จอง
              </div>
              <IonDatetimeButton datetime="dt-blue"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime 
                  id="dt-blue" 
                  presentation="date" 
                  value={selectedDate} 
                  onIonChange={e => setSelectedDate(e.detail.value as string)} 
                  style={{ '--background': '#1a1a1a', '--ion-text-color': '#fff' } as any}
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
          </div>

          <h3 style={{ color: 'white', borderLeft: '4px solid #FFD700', paddingLeft: '10px' }}>
            เลือกสนามว่าง (8 คอร์ท)
          </h3>

          <div className="court-grid-8">
            {courts.map((court) => {
              // ✅ ล็อคปุ่ม
              const isOccupied = occupiedCourts.includes(court.id);
              return (
                <div 
                  key={court.id} 
                  className={`court-box ${selectedCourts.includes(court.id) ? 'selected' : ''}`} 
                  onClick={() => !isOccupied && toggleCourt(court.id)}
                  style={{ 
                    opacity: isOccupied ? 0.3 : 1,
                    pointerEvents: isOccupied ? 'none' : 'auto',
                    backgroundColor: isOccupied ? '#111' : '' 
                  }}
                >
                  <div className="court-lines"></div>
                  <h3 style={{ margin: 0, zIndex: 2, color: selectedCourts.includes(court.id) ? 'black' : 'white' }}>{court.id}</h3>
                  {selectedCourts.includes(court.id) && <IonIcon icon={checkmarkCircle} style={{ position: 'absolute', top: 5, right: 5, color: 'black' }} />}
                  {isOccupied && <span style={{fontSize:'0.7rem', color:'red', position:'absolute', bottom:5}}>ไม่ว่าง</span>}
                </div>
              );
            })}
          </div>

          <div style={{ height: '60px' }}></div>
        </div>
      </IonContent>

      {selectedCourts.length > 0 && (
        <IonFooter className="ion-no-border">
          <IonToolbar className="lux-toolbar">
            <IonButton expand="block" color="warning" onClick={goToBooking} style={{ margin: '10px', fontWeight: 'bold', '--color': 'black' } as any}>
              จองที่เลือก ({selectedCourts.length} คอร์ท)
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default CourtSelectBlueZone;