import React, { useEffect, useState } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, 
  IonIcon, IonLabel, IonSegment, IonSegmentButton, IonAlert, useIonViewWillEnter 
} from '@ionic/react';
import { ticketOutline, timeOutline, calendarOutline, trashOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Home.css';

const TicketList: React.FC = () => {
  const history = useHistory();
  const [tickets, setTickets] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  // ใช้ useIonViewWillEnter แทน useEffect เพื่อให้โหลดใหม่ทุกครั้งที่กลับมาหน้านี้
  useIonViewWillEnter(() => {
    // แก้ชื่อ Key เป็น 'my_tickets' ให้ตรงกับหน้า BookingDetail
    const saved = localStorage.getItem('my_tickets');
    if (saved) setTickets(JSON.parse(saved));
  });

  // ฟังก์ชันลบตั๋ว (ลบถาวรจากเครื่อง)
  const confirmDelete = () => {
    if (ticketToDelete !== null) {
      const newTickets = tickets.filter(t => t.id !== ticketToDelete);
      setTickets(newTickets);
      // บันทึกค่าใหม่ลงเครื่องทันที
      localStorage.setItem('my_tickets', JSON.stringify(newTickets));
      setTicketToDelete(null);
    }
    setShowAlert(false);
  };

  const openTicket = (ticket: any) => {
    history.push({
      pathname: '/booking-ticket',
      state: { 
        ...ticket, 
        isNewBooking: false // ✅ ย้ำชัดๆ ว่าไม่ใช่การจองใหม่
      }
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/home" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>กระเป๋าตั๋ว (Wallet)</div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="lux-page">
        
        {/* ✅ Wrapper แก้ชิดขอบ */}
        <div style={{ padding: '20px' }}>
          
          <IonSegment value="active" style={{ marginBottom: '25px', background: '#333', borderRadius: '12px', padding: '4px' }}>
            <IonSegmentButton value="active"><IonLabel style={{ color: '#FFD700' }}>ตั๋วของฉัน</IonLabel></IonSegmentButton>
            <IonSegmentButton value="history"><IonLabel style={{ color: '#888' }}>ประวัติเก่า</IonLabel></IonSegmentButton>
          </IonSegment>

          {tickets.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
               <IonIcon icon={ticketOutline} style={{ fontSize: '4rem', opacity: 0.5 }} />
               <p>ยังไม่มีการจองครับ</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className="lux-card" style={{ marginBottom: '16px', padding: '0', display: 'flex', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                <div style={{ width: '8px', background: '#FFD700' }}></div>
                
                <div style={{ padding: '16px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  {/* พื้นที่กดเพื่อดูตั๋ว */}
                  <div onClick={() => openTicket(t)} style={{ flex: 1, cursor: 'pointer' }}>
                      <div style={{ color: '#aaa', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                        <IonIcon icon={calendarOutline} /> 
                        {new Date(t.date).toLocaleDateString('th-TH', {day:'numeric', month:'short'})} 
                        <span style={{ margin: '0 5px' }}>|</span> 
                        <IonIcon icon={timeOutline} /> {t.startTime}-{t.endTime}
                      </div>
                      <h2 style={{ margin: '0 0 5px 0', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{t.partyName}</h2>
                      <div style={{ color: '#2dd36f', fontSize: '0.85rem' }}>● พร้อมใช้งาน</div>
                  </div>
                  
                  {/* ปุ่มลบ (ถังขยะ) */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); setTicketToDelete(t.id); setShowAlert(true); }}
                    style={{ padding: '10px', marginLeft: '10px', color: '#ff4961', cursor: 'pointer' }}
                  >
                      <IonIcon icon={trashOutline} style={{ fontSize: '1.4rem' }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alert ยืนยันการลบ */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="ยืนยันการลบ"
          message="คุณต้องการลบประวัติการจองนี้ใช่หรือไม่?"
          buttons={[
            { text: 'ยกเลิก', role: 'cancel', cssClass: 'secondary' },
            { text: 'ลบเลย', handler: confirmDelete }
          ]}
        />

      </IonContent>
    </IonPage>
  );
};

export default TicketList;