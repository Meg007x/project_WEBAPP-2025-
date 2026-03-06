// src/pages/BookingHistory.tsx
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonIcon, IonBadge, IonSpinner
} from '@ionic/react';
import { calendarOutline, timeOutline, locationOutline, checkmarkCircle } from 'ionicons/icons';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './Home.css';

const BookingHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // ดึงการจองทั้งหมดที่ userId ตรงกับคนที่ล็อกอินอยู่
        const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        
        let fetchedBookings: any[] = [];
        snap.forEach(doc => {
          fetchedBookings.push({ id: doc.id, ...doc.data() });
        });

        // นำมาเรียงลำดับ (Sort) ด้วยวันที่เตะ (date) จาก ใหม่ ไป เก่า
        fetchedBookings.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}:00`).getTime();
          const dateB = new Date(`${b.date}T${b.startTime}:00`).getTime();
          return dateB - dateA; // มากไปน้อย (ใหม่ไปเก่า)
        });

        if (mounted) {
          setHistory(fetchedBookings);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => { mounted = false; };
  }, [user]);

  // ฟังก์ชันช่วยแปลงวันที่ให้ดูอ่านง่ายขึ้น
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'ไม่ระบุวันที่';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/home" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>ประวัติการจอง</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container" style={{ marginTop: '20px' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <IonSpinner name="crescent" color="warning" />
              <p style={{ color: '#aaa' }}>กำลังโหลดประวัติ...</p>
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
              <IonIcon icon={calendarOutline} style={{ fontSize: '60px', opacity: 0.5 }} />
              <p>คุณยังไม่มีประวัติการจองในระบบ</p>
            </div>
          ) : (
            history.map((item, index) => (
              <IonCard key={item.id || index} className="lux-card" style={{ marginBottom: '20px', borderRadius: '15px' }}>
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                    <div>
                      <h2 style={{ color: 'white', margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {item.venueName || 'ไม่ระบุชื่อสนาม'}
                      </h2>
                      <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '0.8rem' }}>
                        รหัสการจอง: {item.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <IonBadge color="success">
                      <IonIcon icon={checkmarkCircle} style={{ verticalAlign: 'middle', marginRight: '3px' }}/> 
                      เสร็จสิ้น
                    </IonBadge>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                    <div style={{ color: '#ddd', fontSize: '0.9rem' }}>
                      <IonIcon icon={calendarOutline} style={{ color: '#FFD700', marginRight: '5px' }} />
                      <span style={{ fontWeight: 'bold' }}>{formatDate(item.date)}</span>
                    </div>
                    <div style={{ color: '#ddd', fontSize: '0.9rem' }}>
                      <IonIcon icon={timeOutline} style={{ color: '#FFD700', marginRight: '5px' }} />
                      <span style={{ fontWeight: 'bold' }}>{item.startTime} - {item.endTime}</span> น.
                    </div>
                  </div>

                  <div style={{ marginTop: '15px', color: '#aaa', fontSize: '0.9rem' }}>
                    <IonIcon icon={locationOutline} style={{ color: '#FFD700', marginRight: '5px' }} />
                    สนามที่เล่น: <span style={{ color: 'white' }}>
                      {Array.isArray(item.courtIds) ? item.courtIds.join(', ') : 'ไม่ได้ระบุ'}
                    </span>
                  </div>

                  <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #444', textAlign: 'right' }}>
                    <span style={{ color: '#aaa', fontSize: '0.9rem', marginRight: '10px' }}>ยอดสุทธิ:</span>
                    <span style={{ color: '#FFD700', fontSize: '1.3rem', fontWeight: 'bold' }}>
                      ฿{item.totalPrice ? item.totalPrice.toLocaleString() : '0'}
                    </span>
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          )}

          <div style={{ height: '50px' }}></div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BookingHistory;