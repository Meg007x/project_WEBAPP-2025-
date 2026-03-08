import React, { useMemo, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonFooter, IonAvatar, IonItem, IonLabel, IonList,
  IonCheckbox, IonInput, useIonViewWillEnter, IonAlert
} from '@ionic/react';
import { personAdd, walletOutline, shirtOutline } from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';
import './Home.css';

// ✅ Firestore
import { auth, db } from '../firebaseConfig';
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

interface Member { id: number; name: string; hasShoes: boolean; }

const BookingDetail: React.FC = () => {
  const history = useHistory();
  const location = useLocation<any>();

  // State
  const [bookingData, setBookingData] = useState<any>({});
  const [partyName, setPartyName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [venue, setVenue] = useState<any>({ name: 'Loading...' });

  // Alert กันจองซ้อน
  const [showConflictAlert, setShowConflictAlert] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

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
      totalPrice: state.totalPrice || state.price || 0
    });

    setPartyName('');
    setMembers([{ id: 1, name: 'คุณ (Host)', hasShoes: false }]);
  });

  const dateStr = new Date(bookingData.date || new Date()).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: '2-digit'
  });

  const courtIds: Array<string | number> = Array.isArray(bookingData.courtIds) ? bookingData.courtIds : [];

  const isFootball = useMemo(() => {
    const name = String(venue.name || "").toLowerCase();
    const vid = String(venue?.id || bookingData?.venueId || '').toLowerCase();

    return (
      name.includes('football') ||
      name.includes('soccer') ||
      name.includes('field') ||
      name.includes('arena') ||
      name.includes('ball') ||
      name.includes('สนามบอล') ||
      name.includes('ฟุตบอล') ||
      name.includes('หญ้าเทียม') ||
      vid.startsWith('football_')
    );
  }, [venue, bookingData?.venueId]);

  // ✅ แก้ไขฟังก์ชันแสดงชื่อสนามตามประเภทกีฬา
  const formatCourtText = (idsAny: any[]) => {
    const ids = Array.isArray(idsAny) ? idsAny : [];

    if (isFootball) {
      // ⚽ ฟุตบอล: Field 1, Field 2...
      const labels = ids.map((x) => {
        if (typeof x === 'number') return `Field ${x}`;
        const s = String(x);
        const m1 = s.match(/mock_field_(\d+)/i);
        if (m1?.[1]) return `Field ${m1[1]}`;
        const m2 = s.match(/(?:^|_)f(\d+)$/i) || s.match(/f(\d+)/i);
        if (m2?.[1]) return `Field ${m2[1]}`;
        return `Field ${s.replace(/^mock_/i, '').replace(/_/g, ' ').trim()}`;
      });
      return labels.join(', ');
    }

    // 🏸 แบดมินตัน: Court 1, Court 2...
    return ids.map((x) => `Court ${String(x)}`).join(', ');
  };

  const totalCourtPrice = Number(bookingData.totalPrice) || 0;
  const basePricePerHead = members.length > 0
    ? Math.ceil(totalCourtPrice / members.length)
    : totalCourtPrice;

  const grandTotal = useMemo(() => {
    if (isFootball) return totalCourtPrice;
    const shoesCount = members.filter(m => m.hasShoes).length;
    return totalCourtPrice + (shoesCount * 20);
  }, [totalCourtPrice, members, isFootball]);

  const toMinutes = (t: string) => {
    const [h, m] = (t || "0:0").split(':').map(Number);
    return (h * 60) + (m || 0);
  };

  const dateKey = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const SLOT_STEP_MIN = 60;
  const buildSlotKeys = (startMin: number, endMin: number) => {
    const slots: number[] = [];
    for (let m = startMin; m < endMin; m += SLOT_STEP_MIN) {
      slots.push(Math.floor(m / SLOT_STEP_MIN));
    }
    return slots;
  };

  const makeReservationDocId = (venueId: string, dKey: string, courtId: string | number, slot: number) => {
    return `${venueId}_${dKey}_court${String(courtId)}_slot${slot}`;
  };

const handleConfirmBooking = async () => {
    const user = auth.currentUser;
    if (!user) {
      history.replace('/login');
      return;
    }

    const venueId: string = String(venue?.id ?? venue?.name ?? 'UNKNOWN_VENUE');
    const dKey = dateKey(bookingData.date); // ต้องแน่ใจนะว่าแกมีฟังก์ชัน dateKey()
    const startMin = toMinutes(bookingData.startTime); // ต้องมีฟังก์ชัน toMinutes()
    const endMin = toMinutes(bookingData.endTime);

    // ⭐️ เตรียมข้อมูลตั๋วแบบคลีนๆ ไร้ขยะเจือปน! โยนไปหน้าจ่ายเงิน
    const ticketPayload = {
      venue: venue,
      venueId: venueId,
      venueName: venue?.name || "Unknown Venue",
      partyName: partyName || "My Booking",
      date: bookingData.date,
      dateKey: dKey,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      startMin: startMin,
      endMin: endMin,
      duration: bookingData.duration || 1,
      courtIds: courtIds,
      totalPrice: grandTotal,
      membersCount: members.length,
      status: 'PAID', // ตั้งไว้ก่อน รอเซฟจริงหน้า Payment
      userId: user.uid,
      userEmail: user.email || null,
      userPhone: user.phoneNumber || null
    };

    // ⭐️ โยนข้อมูลทั้งหมดไปที่หน้า /payment
    history.push({
      pathname: '/payment',
      state: { ticketPayload, courtIds }
    });
  };

  const addMember = () => {
    const names = ['เพื่อน A', 'เพื่อน B', 'น้อง C', 'พี่ D'];
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
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#FFD700', fontSize: '0.9rem', marginBottom: '5px' }}>ชื่อปาร์ตี้</div>
            <IonInput value={partyName} onIonChange={e => setPartyName(e.detail.value!)} className="lux-input" placeholder="ตั้งชื่อทีม..." style={{ '--background': '#222', color: 'white', padding: '10px', borderRadius: '10px' } as any} />
          </div>
          <div className="lux-card" style={{ padding: '20px', marginBottom: '25px', border: '1px solid #FFD700' }}>
            <div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>
              <h2 style={{ color: '#FFD700', margin: 0, fontSize: '1.5rem' }}>BOOKING BILL</h2>
              <p style={{ color: '#888', margin: '5px 0 0 0' }}>{dateStr} @ {venue.name}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: '#ccc' }}>
              <div><span style={{ color: '#888' }}>เวลา:</span><br /><b>{bookingData.startTime}-{bookingData.endTime}</b></div>
              <div><span style={{ color: '#888' }}>สนาม:</span><br /><b>{formatCourtText(courtIds)}</b></div>
            </div>
            <div style={{ borderBottom: '1px dashed #555', margin: '15px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div><div style={{ fontSize: '0.8rem', color: '#888' }}>รวม</div><div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 'bold' }}>฿{grandTotal}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.8rem', color: '#FFD700' }}>ต่อคน</div><div style={{ fontSize: '1.8rem', color: '#FFD700', fontWeight: '900' }}>฿{basePricePerHead}</div></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: 'white', margin: 0, borderLeft: '3px solid #FFD700', paddingLeft: '8px' }}>สมาชิก ({members.length})</h3>
            <IonButton size="small" fill="outline" color="warning" onClick={addMember}><IonIcon icon={personAdd} slot="start" />เพิ่ม</IonButton>
          </div>
          <IonList style={{ background: 'transparent' }}>
            {members.map((m) => {
              const personalPrice = basePricePerHead + (!isFootball && m.hasShoes ? 20 : 0);
              return (
                <IonItem key={m.id} lines="none" className="party-item" style={{ marginBottom: '10px', borderRadius: '10px', '--background': '#1a1a1a' } as any}>
                  <IonAvatar slot="start" style={{ background: '#333', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid #FFD700' }}>{m.name.charAt(0)}</IonAvatar>
                  <IonLabel><h3 style={{ color: '#fff' }}>{m.name}</h3><p style={{ color: '#FFD700' }}>฿{personalPrice}</p></IonLabel>
                  {!isFootball && (
                    <div style={{ display: 'flex', alignItems: 'center', color: '#aaa', fontSize: '0.8rem' }}>
                      <IonIcon icon={shirtOutline} style={{ marginRight: 5 }} />
                      <IonCheckbox checked={m.hasShoes} onIonChange={() => toggleShoes(m.id)} color="warning" />
                    </div>
                  )}
                </IonItem>
              );
            })}
          </IonList>
        </div>
        <IonAlert isOpen={showConflictAlert} onDidDismiss={() => setShowConflictAlert(false)} header="ไม่สามารถจองได้" message={conflictMessage} buttons={['ตกลง']} />
      </IonContent>
      <IonFooter className="ion-no-border">
        <IonToolbar className="lux-toolbar" style={{ padding: '10px' }}>
          <IonButton expand="block" color="success" size="large" onClick={handleConfirmBooking} style={{ fontWeight: 'bold', '--color': 'white', '--border-radius': '15px' } as any}>
            <IonIcon icon={walletOutline} slot="start" />ยืนยัน ฿{grandTotal}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default BookingDetail;