import React, { useState, useMemo } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, 
  IonButton, IonIcon, IonFooter, IonAvatar, IonItem, IonLabel, IonList, 
  IonCheckbox, IonInput, useIonViewWillEnter 
} from '@ionic/react';
import { personAdd, walletOutline, shirtOutline } from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';
import './Home.css';

interface Member { id: number; name: string; hasShoes: boolean; }

const BookingDetail: React.FC = () => {
  const history = useHistory();
  const location = useLocation<any>();
  
  // State
  const [bookingData, setBookingData] = useState<any>({});
  const [partyName, setPartyName] = useState(''); 
  const [members, setMembers] = useState<Member[]>([]);
  const [venue, setVenue] = useState<any>({ name: 'Loading...' });

  // Reset ค่าเมื่อเข้าหน้าใหม่
  useIonViewWillEnter(() => {
    const state = location.state || {};
    if (state.venue) setVenue(state.venue);

    setBookingData({
        courtIds: state.courtIds || [],
        startTime: state.startTime || "17:00",
        endTime: state.endTime || "18:00",
        duration: state.duration || 1,
        date: state.date || new Date().toISOString(),
    });

    setPartyName('Badminton Night 🔥');
    setMembers([{ id: 1, name: 'คุณ (Host)', hasShoes: false }]);
  });

  const dateStr = new Date(bookingData.date || new Date()).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit'});
  const courtIds = bookingData.courtIds || [];
  
  // ตรวจสอบว่าเป็น PCR หรือไม่
  const isPCR = useMemo(() => {
     const nameUpper = (venue.name || "").toUpperCase();
     return nameUpper.includes('PCR') || nameUpper.includes('PRC');
  }, [venue]);

  // 1. คำนวณค่าสนาม (Court Price Only)
  const totalCourtPrice = useMemo(() => {
    try {
        let total = 0;
        const startH = parseInt((bookingData.startTime || "00:00").split(':')[0]); 
        
        for (let i = 0; i < (bookingData.duration || 1); i++) {
            const currentHour = startH + i;
            if (currentHour >= 17) total += 180;
            else total += 120;
        }
        return total * courtIds.length;
    } catch (e) { return 0; }
  }, [bookingData, courtIds]);

  // 2. คำนวณค่าหัวพื้นฐาน (ยังไม่รวมรองเท้า)
  const basePricePerHead = members.length > 0 ? Math.ceil(totalCourtPrice / members.length) : totalCourtPrice;

  // 3. คำนวณราคารวมสุทธิ (ค่าสนาม + ค่ารองเท้าทุกคน) -- เอาไว้โชว์ยอดรวมและบันทึก
  const grandTotal = useMemo(() => {
      const shoesCount = members.filter(m => m.hasShoes).length;
      return totalCourtPrice + (shoesCount * 20);
  }, [totalCourtPrice, members]);

  // ยืนยันการจอง
  const handleConfirmBooking = () => {
    const newTicket = {
        id: Date.now(),
        venueName: venue.name,
        partyName: partyName,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        courtIds: courtIds,
        // บันทึกราคาสุทธิ (รวมรองเท้าแล้ว)
        totalPrice: grandTotal,
        membersCount: members.length,
        status: 'PAID'
    };

    const existingTickets = JSON.parse(localStorage.getItem('my_tickets') || '[]');
    const updatedTickets = [newTicket, ...existingTickets];
    localStorage.setItem('my_tickets', JSON.stringify(updatedTickets));

    history.push({
      pathname: '/booking-ticket',
      state: { 
          ...newTicket, 
          venue: venue,
          isJustBooked: true 
      }
    });
  };

  const addMember = () => {
    const names = ['เพื่อน A', 'เพื่อน B', 'น้อง C', 'พี่ D', 'เสี่ย E'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    setMembers([...members, { id: Date.now(), name: `${randomName} #${members.length}`, hasShoes: false }]);
  };

  const toggleShoes = (id: number) => {
    setMembers(members.map(m => m.id === id ? { ...m, hasShoes: !m.hasShoes } : m));
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/court-select" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>สรุปยอด (Bill)</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">

            {/* Input ชื่อปาร์ตี้ */}
            <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#FFD700', fontSize: '0.9rem', marginBottom: '5px' }}>ชื่อปาร์ตี้ (จะแสดงบนตั๋ว)</div>
            <IonInput 
                value={partyName}
                onIonChange={e => setPartyName(e.detail.value!)}
                className="lux-input"
                style={{ '--background': '#222', 'color': 'white', padding: '10px', borderRadius: '10px' }}
            />
            </div>

            {/* ใบเสร็จ */}
            <div className="lux-card" style={{ padding: '20px', marginBottom: '25px', border: '1px solid #FFD700' }}>
            <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
                <h2 style={{ color: '#FFD700', margin: 0, fontSize: '1.5rem' }}>BOOKING BILL</h2>
                <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.9rem' }}>{dateStr} @ {venue.name}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: '#ccc' }}>
                <div>
                    <span style={{ color: '#888' }}>เวลา:</span> <br/>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{bookingData.startTime} - {bookingData.endTime}</span>
                </div>
                <div>
                    <span style={{ color: '#888' }}>สนาม:</span> <br/>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>เบอร์ {courtIds.join(', ')}</span>
                </div>
                <div>
                    <span style={{ color: '#888' }}>จำนวนคน:</span> <br/>
                    <span style={{ color: 'white' }}>{members.length} คน</span>
                </div>
            </div>
            
            <div style={{ borderBottom: '1px dashed #555', margin: '15px 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>ราคารวมทั้งหมด</div>
                    {/* แก้ตรงนี้: แสดง Grand Total ที่รวมรองเท้าแล้ว */}
                    <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 'bold' }}>฿{grandTotal}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#FFD700' }}>ค่าสนาม/คน (ฐาน)</div>
                    <div style={{ fontSize: '1.8rem', color: '#FFD700', fontWeight: '900' }}>฿{basePricePerHead}</div>
                </div>
            </div>
            </div>

            {/* สมาชิก */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: 'white', margin: 0, borderLeft: '3px solid #FFD700', paddingLeft: '8px' }}>
                สมาชิก ({members.length})
            </h3>
            <IonButton size="small" fill="outline" color="warning" onClick={addMember}>
                <IonIcon icon={personAdd} slot="start" /> เพิ่มคน
            </IonButton>
            </div>

            <IonList style={{ background: 'transparent', paddingBottom: '0' }}>
            {members.map((m) => {
                // คำนวณราคารายบุคคล: ค่าสนาม + (ถ้ารองเท้า +20)
                const personalPrice = basePricePerHead + (m.hasShoes ? 20 : 0);
                
                return (
                <IonItem key={m.id} lines="none" className="party-item" style={{ marginBottom: '10px', borderRadius: '10px', '--background': '#1a1a1a' }}>
                <IonAvatar slot="start" style={{ background: '#333', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid #FFD700' }}>
                    {m.name.charAt(0)}
                </IonAvatar>
                <IonLabel>
                    <h3 style={{ color: '#fff' }}>{m.name}</h3>
                    <p style={{ color: '#888', fontSize: '0.8rem' }}>
                        จ่าย: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>฿{personalPrice}</span>
                    </p>
                </IonLabel>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {!isPCR && (
                        <div style={{ display: 'flex', alignItems: 'center', color: '#aaa', fontSize: '0.8rem' }}>
                            <IonIcon icon={shirtOutline} style={{ marginRight: 5 }}/> 
                            <span style={{ marginRight: 5 }}>รองเท้า (+20฿)</span>
                            <IonCheckbox 
                                checked={m.hasShoes} 
                                onIonChange={() => toggleShoes(m.id)} 
                                color="warning" 
                                style={{ '--size': '18px', '--checkbox-background': '#333' }} 
                            />
                        </div>
                    )}
                </div>
                </IonItem>
                );
            })}
            </IonList>

            <div style={{ height: '50px' }}></div>
        </div>

      </IonContent>

      <IonFooter className="ion-no-border">
        <IonToolbar className="lux-toolbar" style={{ padding: '10px' }}>
          {/* แก้ตรงนี้: ปุ่มแสดง Grand Total ที่ถูกต้อง */}
          <IonButton expand="block" color="success" size="large" onClick={handleConfirmBooking} style={{ fontWeight: 'bold', '--color': 'white', '--border-radius': '15px' }}>
            <IonIcon icon={walletOutline} slot="start" />
            ยืนยันการจอง ฿{grandTotal}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default BookingDetail;