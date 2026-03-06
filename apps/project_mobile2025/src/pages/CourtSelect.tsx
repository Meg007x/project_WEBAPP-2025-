// src/pages/CourtSelect.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonFooter, IonDatetimeButton, IonModal, IonDatetime,
  IonSelect, IonSelectOption, useIonViewWillEnter
} from '@ionic/react';
import { checkmarkCircle, calendarOutline, arrowForwardOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './Home.css';
import { calcDurationHours, calcTotalPrice } from '../utils/pricing';

// ✅ นำเข้า Firebase และฟังก์ชันเช็คเวลา
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { isTimeOverlap } from '../utils/time';

const CourtSelect: React.FC = () => {
  const history = useHistory();
  const location = useLocation<any>();

  const [selectedCourts, setSelectedCourts] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<string>('17:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());

  // ✅ State เก็บ ID สนามที่ไม่ว่าง
  const [occupiedCourts, setOccupiedCourts] = useState<number[]>([]);

  // venue จากหน้า BadmintonVenue
  const [venue, setVenue] = useState<any>({
    id: 1,
    name: 'PS Badminton',
    totalCourts: 8,
    priceRange: '120 - 180'
  });

  useIonViewWillEnter(() => {
    if (location.state?.venue) setVenue(location.state.venue);
    setSelectedCourts([]);
  });

  // ถ้า startTime ขยับไปเกิน endTime ให้ขยับ endTime ตาม
  useEffect(() => {
    const s = Number(startTime.split(':')[0]);
    const e = Number(endTime.split(':')[0]);
    if (e <= s) {
      const next = Math.min(24, s + 1);
      setEndTime(`${String(next).padStart(2, '0')}:00`);
    }
  }, [startTime]);
  // eslint-disable-line

  // ✅ ดึงข้อมูลการจองมาเช็คว่าคอร์ทไหนไม่ว่างบ้าง
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

  // จำนวนคอร์ด: ใช้ venue.totalCourts ก่อน, ถ้าไม่มีค่อยเดาจากชื่อ (PCR=6, อื่น=8)
  const totalCourts = useMemo(() => {
    const n = Number(venue?.totalCourts);
    if (Number.isFinite(n) && n > 0) return n;

    const nameUpper = String(venue?.name || '').toUpperCase();
    const isPCR = nameUpper.includes('PCR') || nameUpper.includes('PRC');
    return isPCR ? 6 : 8;
  }, [venue]);

  const courts = useMemo(() => {
    return Array.from({ length: totalCourts }, (_, i) => ({
      id: i + 1,
      status: 'available' as 'available' | 'occupied'
    }));
  }, [totalCourts]);

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
    const totalPrice = calcTotalPrice({
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
        totalPrice,
        venue
      }
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/badminton-venue" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
            จองสนาม ({venue.name})
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">

          <div className="lux-card" style={{ padding: '20px', marginBottom: '25px', border: '1px solid #FFD700' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#FFD700', fontSize: '0.9rem', marginBottom: '8px' }}>
                <IonIcon icon={calendarOutline} style={{ verticalAlign: 'middle' }} /> วันที่
              </div>

              <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  id="datetime"
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
            เลือกสนามว่าง ({courts.length} คอร์ด)
          </h3>

          <div className="court-grid-8">
            {courts.map((court) => {
              // ✅ เช็คสถานะการจอง
              const isOccupied = occupiedCourts.includes(court.id);
              
              return (
                <div
                  key={court.id}
                  className={`court-box ${selectedCourts.includes(court.id) ? 'selected' : ''}`}
                  // ✅ ล็อคปุ่มถ้ามีการจองแล้ว
                  style={{ 
                    opacity: isOccupied ? 0.3 : 1,
                    pointerEvents: isOccupied ? 'none' : 'auto',
                    backgroundColor: isOccupied ? '#111' : '' 
                  }}
                  onClick={() => !isOccupied && toggleCourt(court.id)}
                >
                  <div className="court-lines"></div>
                  <h3 style={{ margin: 0, zIndex: 2, color: selectedCourts.includes(court.id) ? 'black' : 'white' }}>
                    {court.id}
                  </h3>
                  {selectedCourts.includes(court.id) && (
                    <IonIcon icon={checkmarkCircle} style={{ position: 'absolute', top: 5, right: 5, color: 'black' }} />
                  )}
                  {/* ✅ แสดงข้อความว่าไม่ว่าง */}
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
            <IonButton
              expand="block"
              color="warning"
              onClick={goToBooking}
              style={{ margin: '10px', fontWeight: 'bold', '--color': 'black' } as any}
            >
              ต่อไป ({selectedCourts.length} คอร์ด)
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default CourtSelect;