import React, { useState, useMemo } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, 
  IonButton, IonIcon, IonFooter, IonDatetimeButton, IonModal, IonDatetime, 
  IonSelect, IonSelectOption, useIonViewWillEnter 
} from '@ionic/react';
import { checkmarkCircle, calendarOutline, arrowForwardOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './Home.css';

const CourtSelect: React.FC = () => {
  const history = useHistory();
  const location = useLocation<any>();
  
  const [selectedCourts, setSelectedCourts] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<string>('17:00');
  const [endTime, setEndTime] = useState<string>('18:00'); 
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());
  
  // State สำหรับเก็บข้อมูลสนาม
  const [venue, setVenue] = useState<any>({ id: 1, name: 'PS Badminton' });

  useIonViewWillEnter(() => {
    // 1. รับค่า Venue ที่ส่งมาจากหน้าเลือกสนาม
    if (location.state && location.state.venue) {
      setVenue(location.state.venue);
    }
    // Reset ค่าการเลือก
    setSelectedCourts([]);
  });

  // --- จุดที่แก้ LOGIC 8 vs 6 คอร์ด ---
  const courts = useMemo(() => {
    // เช็คชื่อสนาม
    const nameUpper = (venue.name || "").toUpperCase();
    const isPCR = nameUpper.includes('PCR') || nameUpper.includes('PRC'); 
    
    // ถ้าเป็น PCR ให้มี 6 คอร์ด, ถ้าไม่ใช่ให้มี 8
    const totalCourts = isPCR ? 6 : 8;

    // สร้าง Array [1, 2, 3, ..., n]
    return Array.from({ length: totalCourts }, (_, i) => ({
        id: i + 1,
        status: 'available' 
    }));
  }, [venue]); 
  // ------------------------------------

  const timeOptions = [];
  for (let i = 10; i <= 24; i++) {
    const time = i < 10 ? `0${i}:00` : `${i}:00`;
    timeOptions.push(time);
  }

  const getDuration = () => {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    return end - start;
  };

  const toggleCourt = (id: number) => {
    if (selectedCourts.includes(id)) setSelectedCourts(selectedCourts.filter(c => c !== id));
    else setSelectedCourts([...selectedCourts, id]);
  };

  const goToBooking = () => {
    history.push({
      pathname: '/booking-detail',
      state: { 
        courtIds: selectedCourts, 
        startTime, 
        endTime, 
        duration: getDuration(), 
        date: selectedDate,
        venue: venue // ส่ง Venue ไปต่อเรื่อยๆ ห้ามทำหาย
      }
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/badminton-venue" color="light" /></IonButtons>
          {/* แสดงชื่อสนามที่ถูกต้อง */}
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
             จองสนาม ({venue.name})
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">
            
            {/* ... (ส่วนเลือกวันที่และเวลา เหมือนเดิมทุกประการ ห้ามแก้) ... */}
            <div className="lux-card" style={{ padding: '20px', marginBottom: '25px', border: '1px solid #FFD700' }}>
            <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#FFD700', fontSize: '0.9rem', marginBottom: '8px' }}>
                <IonIcon icon={calendarOutline} style={{ verticalAlign: 'middle' }}/> วันที่
                </div>
                <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
                <IonModal keepContentsMounted={true}>
                <IonDatetime 
                    id="datetime" 
                    presentation="date" 
                    value={selectedDate}
                    onIonChange={e => setSelectedDate(e.detail.value as string)}
                    style={{ '--background': '#1a1a1a', '--ion-text-color': '#fff', '--accent-color': '#FFD700' }} 
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
                        const tVal = parseInt(t.split(':')[0]);
                        const sVal = parseInt(startTime.split(':')[0]);
                        return tVal > sVal ? <IonSelectOption key={t} value={t}>{t}</IonSelectOption> : null;
                    })}
                </IonSelect>
                </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '15px', color: '#aaa', fontSize: '0.9rem' }}>
                รวมระยะเวลา: <span style={{ color: '#fff', fontWeight: 'bold' }}>{getDuration()} ชั่วโมง</span>
            </div>
            </div>

            <h3 style={{ color: 'white', borderLeft: '4px solid #FFD700', paddingLeft: '10px' }}>
            เลือกสนามว่าง ({courts.length} คอร์ด)
            </h3>
            
            {/* Grid จะ Render ตามจำนวนในตัวแปร courts (6 หรือ 8) โดยอัตโนมัติ */}
            <div className="court-grid-8">
            {courts.map((court) => (
                <div 
                key={court.id}
                className={`court-box ${selectedCourts.includes(court.id) ? 'selected' : ''}`}
                style={{ opacity: court.status === 'occupied' ? 0.3 : 1 }}
                onClick={() => court.status === 'available' && toggleCourt(court.id)}
                >
                <div className="court-lines"></div>
                <h3 style={{ margin: 0, zIndex: 2, color: selectedCourts.includes(court.id) ? 'black' : 'white' }}>
                    {court.id}
                </h3>
                {selectedCourts.includes(court.id) && 
                    <IonIcon icon={checkmarkCircle} style={{ position: 'absolute', top: 5, right: 5, color: 'black' }} />
                }
                </div>
            ))}
            </div>

            <div style={{ height: '60px' }}></div>
        </div>
      </IonContent>

      {selectedCourts.length > 0 && (
        <IonFooter className="ion-no-border">
          <IonToolbar className="lux-toolbar">
            <IonButton expand="block" color="warning" onClick={goToBooking} style={{ margin: '10px', fontWeight: 'bold', '--color': 'black' }}>
              ต่อไป ({selectedCourts.length} คอร์ด)
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default CourtSelect;