import React from 'react';
import { IonContent, IonPage, IonButton, IonIcon, IonHeader, IonToolbar, IonButtons } from '@ionic/react';
import { shareSocialOutline, homeOutline, downloadOutline, arrowBackOutline } from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';
import './Home.css';

const BookingTicket: React.FC = () => {
  const location = useLocation<any>();
  const history = useHistory();
  
  // รับค่าจากหน้าก่อนหน้า
  const rawData = location.state;

  // --- Logic การรับข้อมูล (ไม่ยุ่งกับ UI) ---
  const data = {
      // ดึงชื่อปาร์ตี้มาแสดง ถ้าไม่มีให้ขึ้น Booking
      partyName: rawData?.partyName || "Booking",
      
      // ดึงเลขสนามมาแสดง (กัน Error ถ้าไม่มีให้ใส่ 0)
      courtIds: rawData?.courtIds || [0], 
      
      startTime: rawData?.startTime || "00:00",
      endTime: rawData?.endTime || "00:00",
      date: rawData?.date || new Date().toISOString(),
      totalPrice: rawData?.totalPrice || 0,
      
      // เช็คว่ากดมาจากหน้าจอง หรือหน้าประวัติ (เพื่อเปลี่ยนปุ่ม Back/Home)
      isJustBooked: rawData?.isJustBooked ?? false
  };

  // --- Logic ปุ่มกด (ไม่ยุ่งกับ UI) ---
  const handleClose = () => {
      if (data.isJustBooked) {
          history.push('/home'); // ถ้าเพิ่งจองเสร็จ กลับหน้าแรก
      } else {
          history.goBack(); // ถ้าดูจากประวัติ ย้อนกลับ
      }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start">
            <IonButton onClick={handleClose} color="light">
                <IonIcon icon={data.isJustBooked ? homeOutline : arrowBackOutline} />
            </IonButton>
          </IonButtons>
          {/* UI Header เดิมเป๊ะๆ */}
          <div style={{ color: '#FFD700', textAlign: 'center', fontWeight: 'bold', width: '100%', paddingRight: '48px' }}>PS VIP PASS</div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="lux-page ion-padding">
        <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* --- TICKET DESIGN (UI เดิม 100% ห้ามแตะ) --- */}
          <div className="vip-ticket">
            <div className="ticket-header">
              <div style={{ letterSpacing: '2px', fontSize: '0.7rem' }}>OFFICIAL BOOKING PASS</div>
              {/* ตรงนี้จะแสดงชื่อปาร์ตี้ที่ถูกต้อง */}
              <h1 style={{ margin: '5px 0', fontSize: '2rem', fontWeight: '900' }}>{data.partyName}</h1>
              <div style={{ color: '#000', fontWeight: 'bold' }}>PS BADMINTON CLUB</div>
            </div>

            <div className="ticket-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <small>COURT</small>
                  <div className="val">#{data.courtIds.join(', ')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <small>TIME</small>
                  <div className="val">{data.startTime}-{data.endTime}</div>
                </div>
                <div>
                  <small>DATE</small>
                  <div className="val">{new Date(data.date).toLocaleDateString('th-TH')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <small>TOTAL</small>
                  <div className="val">฿{data.totalPrice}</div>
                </div>
              </div>

              {/* QR Code Section */}
              <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '2px dashed #ddd', paddingTop: '20px' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFIED-${data.partyName}`} 
                  alt="QR" 
                  style={{ width: '150px', borderRadius: '10px', border: '5px solid #fff' }} 
                />
                <div style={{ marginTop: '10px', fontFamily: 'monospace', opacity: 0.6 }}>
                    PS-TX-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px', width: '100%', display: 'flex', gap: '10px' }}>
              <IonButton expand="block" fill="outline" color="light" style={{ flex: 1 }}>
                 <IonIcon icon={downloadOutline} slot="start" /> เซฟรูป
              </IonButton>
              <IonButton expand="block" color="warning" style={{ flex: 1, '--color': '#000' }}>
                 <IonIcon icon={shareSocialOutline} slot="start" /> ส่งเข้ากลุ่ม
              </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BookingTicket;