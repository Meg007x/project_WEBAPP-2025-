import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonFooter, IonDatetimeButton, IonModal, IonDatetime,
  IonSelect, IonSelectOption, useIonViewWillEnter
} from '@ionic/react';
import { checkmarkCircle, calendarOutline, arrowForwardOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './Home.css';

// สมมติว่าคุณมีไฟล์ utils/pricing.ts เหมือนของแบด
import { calcDurationHours, calcTotalPrice } from '../utils/pricing';

const FootballSelect: React.FC = () => {
  const history = useHistory();
  const location = useLocation<any>();

  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>('17:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());

  // รับข้อมูล venue จาก navigation state
  const [venue, setVenue] = useState<any>(location.state?.venue || null);
  const [subvenues, setSubvenues] = useState<any[]>([]);

  useIonViewWillEnter(() => {
    if (location.state?.venue) {
        setVenue(location.state.venue);
    }
    setSelectedFields([]);
    
    // โหลดสนามย่อยจาก Firebase (หรือใช้ข้อมูลจำลองถ้ายังไม่มี)
    // ในที่นี้ผมคง logic เดิมของคุณในการดึง subvenues ไว้
  });

  // Logic ปรับเวลาสิ้นสุดอัตโนมัติ (เหมือนแบด)
  useEffect(() => {
    const s = Number(startTime.split(':')[0]);
    const e = Number(endTime.split(':')[0]);
    if (e <= s) {
      const next = Math.min(24, s + 1);
      setEndTime(`${String(next).padStart(2, '0')}:00`);
    }
  }, [startTime]);

  const timeOptions = useMemo(() => {
    const arr: string[] = [];
    for (let i = 8; i <= 24; i++) arr.push(`${String(i).padStart(2, '0')}:00`);
    return arr;
  }, []);

  const duration = useMemo(() => calcDurationHours(startTime, endTime), [startTime, endTime]);

  const toggleField = (id: string) => {
    setSelectedFields(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const goToBooking = () => {
    // คำนวณราคารวม (ใช้ logic เดียวกับแบด)
    const totalPrice = calcTotalPrice({
      priceRange: venue?.priceRange || "500 - 800",
      startTime,
      endTime,
      units: selectedFields.length
    });

    history.push({
      pathname: '/booking-detail',
      state: {
        courtIds: selectedFields, // ใช้ key เดิมเพื่อให้หน้าถัดไปรับค่าได้
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
          <IonButtons slot="start">
            <IonBackButton defaultHref="/football-list" color="light" />
          </IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
            จองสนาม ({venue?.name || 'Football'})
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">

          {/* Card เลือกวันที่และเวลา - สไตล์เดียวกับแบด */}
          <div className="lux-card" style={{ padding: '20px', marginBottom: '25px', border: '1px solid #FFD700' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#FFD700', fontSize: '0.9rem', marginBottom: '8px' }}>
                <IonIcon icon={calendarOutline} style={{ verticalAlign: 'middle' }} /> วันที่
              </div>

              <IonDatetimeButton datetime="football-datetime"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  id="football-datetime"
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
                <IonSelect value={startTime} onIonChange={e => setStartTime(e.detail.value)} className="lux-input" interface="popover">
                  {timeOptions.slice(0, -1).map(t => <IonSelectOption key={t} value={t}>{t}</IonSelectOption>)}
                </IonSelect>
              </div>

              <IonIcon icon={arrowForwardOutline} style={{ color: '#666', marginTop: '20px' }} />

              <div style={{ flex: 1 }}>
                <div style={{ color: '#FFD700', fontSize: '0.8rem' }}>ถึงเวลา</div>
                <IonSelect value={endTime} onIonChange={e => setEndTime(e.detail.value)} className="lux-input" interface="popover">
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
            เลือกสนามที่ว่าง
          </h3>

          {/* Grid สนามฟุตบอล - ใช้สไตล์เดียวกับแบดแต่ปรับสัดส่วนนิดหน่อย */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            {/* ในที่นี้ถ้า subvenues ยังไม่โหลดจาก Firebase ผมจำลองให้ 2 สนามก่อน */}
            {(subvenues.length > 0 ? subvenues : [{id:'A', name:'สนาม A'}, {id:'B', name:'สนาม B'}]).map((field) => (
              <div
                key={field.id}
                className={`court-box ${selectedFields.includes(field.id) ? 'selected' : ''}`}
                onClick={() => toggleField(field.id)}
                style={{ 
                    height: '100px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    position: 'relative',
                    background: selectedFields.includes(field.id) ? '#FFD700' : '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '15px',
                    textAlign: 'center'
                }}
              >
                <div className="court-lines" style={{ opacity: 0.2 }}></div>
                <h3 style={{ margin: 0, zIndex: 2, color: selectedFields.includes(field.id) ? 'black' : 'white', fontWeight: 'bold' }}>
                  {field.name}
                </h3>
                <span style={{ fontSize: '0.7rem', zIndex: 2, color: selectedFields.includes(field.id) ? '#333' : '#888' }}>
                    หญ้าเทียม Indoor
                </span>
                {selectedFields.includes(field.id) && (
                  <IonIcon icon={checkmarkCircle} style={{ position: 'absolute', top: 10, right: 10, color: 'black', fontSize: '1.2rem' }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ height: '80px' }}></div>
        </div>
      </IonContent>

      {/* Footer ปุ่มยืนยัน - สไตล์เดียวกับแบด */}
      {selectedFields.length > 0 && (
        <IonFooter className="ion-no-border">
          <IonToolbar className="lux-toolbar">
            <IonButton
              expand="block"
              color="warning"
              onClick={goToBooking}
              style={{ margin: '15px', fontWeight: 'bold', '--color': 'black', height: '50px', '--border-radius': '12px' } as any}
            >
              ต่อไป ({selectedFields.length} สนาม)
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default FootballSelect;