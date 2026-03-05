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

  const courtIds: number[] = bookingData.courtIds || [];

  // เช็คว่าเป็นบอลไหม (เพื่อซ่อนรองเท้าตามเงื่อนไข)
  const isFootball = useMemo(() => {
    const name = (venue.name || "").toLowerCase();
    return (
      name.includes('football') ||
      name.includes('soccer') ||
      name.includes('field') ||
      name.includes('arena') ||
      name.includes('ball') ||
      name.includes('สนามบอล') ||
      name.includes('ฟุตบอล') ||
      name.includes('หญ้าเทียม')
    );
  }, [venue]);

  // ราคารวม (จากหน้าก่อนหน้าเป็นหลัก)
  const totalCourtPrice = Number(bookingData.totalPrice) || 0;

  // ค่าเฉลี่ย/คน (ฐาน) — ปัดขึ้น
  const basePricePerHead = members.length > 0
    ? Math.ceil(totalCourtPrice / members.length)
    : totalCourtPrice;

  // รวมสุทธิ (รองเท้า +20 เฉพาะแบด)
  const grandTotal = useMemo(() => {
    if (isFootball) return totalCourtPrice;
    const shoesCount = members.filter(m => m.hasShoes).length;
    return totalCourtPrice + (shoesCount * 20);
  }, [totalCourtPrice, members, isFootball]);

  // ---------- Helpers (เวลา/วัน/slot) ----------
  const toMinutes = (t: string) => {
    const [h, m] = (t || "0:0").split(':').map(Number);
    return (h * 60) + (m || 0);
  };

  const dateKey = (iso: string) => {
    if (!iso) return '';
    // เอา YYYY-MM-DD แบบ local จริงๆ (ลด timezone เพี้ยน)
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // slot step (นาที) — ถ้าระบบคุณเป็นรายชั่วโมง ใช้ 60 ได้
  // แนะนำ 30 จะกันเคสครึ่งชั่วโมงได้ด้วย
  const SLOT_STEP_MIN = 60;

  const buildSlotKeys = (startMin: number, endMin: number) => {
    const slots: number[] = [];
    // slot เป็น index ตาม step เช่น 17:00 => 34 ถ้า step=30 (เพราะ 17*60/30 = 34)
    for (let m = startMin; m < endMin; m += SLOT_STEP_MIN) {
      slots.push(Math.floor(m / SLOT_STEP_MIN));
    }
    return slots;
  };

  const makeReservationDocId = (venueId: string, dKey: string, courtId: number, slot: number) => {
    // doc id ต้อง deterministic เพื่อ "ชนกัน" ได้จริง
    return `${venueId}_${dKey}_court${courtId}_slot${slot}`;
  };
  // -------------------------------------------

  const handleConfirmBooking = async () => {
    const user = auth.currentUser;
    if (!user) {
      history.replace('/login');
      return;
    }

    const venueId: string = String(venue?.id ?? venue?.name ?? 'UNKNOWN_VENUE');
    const dKey = dateKey(bookingData.date);
    const startMin = toMinutes(bookingData.startTime);
    const endMin = toMinutes(bookingData.endTime);

    // ✅ สร้าง ticket data (ไว้แสดงหน้า ticket)
    const ticketPayload = {
      venue: venue,
      venueId,
      venueName: venue?.name || "Unknown Venue",
      partyName: partyName || "My Booking",
      date: bookingData.date,
      dateKey: dKey,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      startMin,
      endMin,
      duration: bookingData.duration || 1,
      courtIds: courtIds,
      totalPrice: grandTotal,
      membersCount: members.length,
      status: 'PAID',
      userId: user.uid,
      userEmail: user.email || null,
      userPhone: user.phoneNumber || null,
    };

    try {
      const bookingsCol = collection(db, 'bookings');
      const reservationsCol = collection(db, 'court_reservations');

      // ✅ สร้าง bookingRef ก่อน เพื่อใช้ id ผูกกับ reservations
      const bookingRef = doc(bookingsCol);

      // สร้าง slot ทั้งหมดที่ต้องล็อก
      const slots = buildSlotKeys(startMin, endMin);

      const reservationIds: string[] = [];
      for (const cId of courtIds) {
        for (const s of slots) {
          reservationIds.push(makeReservationDocId(venueId, dKey, cId, s));
        }
      }

      await runTransaction(db, async (tx) => {
        // 1) ตรวจทุก reservation doc ว่าถูกจองแล้วหรือยัง
        for (const rid of reservationIds) {
          const rRef = doc(reservationsCol, rid);
          const snap = await tx.get(rRef);
          if (snap.exists()) {
            const data = snap.data() as any;
            const oldStart = data?.startTime || '';
            const oldEnd = data?.endTime || '';
            const oldCourt = data?.courtId ?? '';
            const oldVenueName = data?.venueName || venue?.name || 'สนาม';

            throw new Error(
              `CONFLICT|จองซ้อนเวลาไม่ได้\n\nสนาม: ${oldVenueName}\nคอร์ด/สนาม: ${oldCourt}\nเวลา: ${oldStart} - ${oldEnd}`
            );
          }
        }

        // 2) ถ้าไม่ชน -> create booking
        tx.set(bookingRef, {
          ...ticketPayload,
          id: bookingRef.id,
          reservationIds,              // ✅ เก็บไว้ใช้ลบภายหลัง
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // 3) create reservations ทุก slot
        for (const cId of courtIds) {
          for (const s of slots) {
            const rid = makeReservationDocId(venueId, dKey, cId, s);
            const rRef = doc(reservationsCol, rid);

            tx.set(rRef, {
              bookingId: bookingRef.id,
              userId: user.uid,
              venueId,
              venueName: venue?.name || "Unknown Venue",
              dateKey: dKey,
              courtId: cId,
              slot: s,
              startTime: bookingData.startTime,
              endTime: bookingData.endTime,
              createdAt: serverTimestamp(),
            });
          }
        }
      });

      // ✅ สำเร็จ -> ไปหน้าตั๋ว (ส่ง state เหมือนเดิม)
      history.push({
        pathname: '/booking-ticket',
        state: { ...ticketPayload, id: bookingRef.id, isJustBooked: true }
      });

    } catch (e: any) {
      const msg = String(e?.message || '');

      // ถ้าเป็น error ที่เราโยนเอง จะขึ้นต้นด้วย CONFLICT|
      if (msg.startsWith('CONFLICT|')) {
        const text = msg.replace('CONFLICT|', '');
        setConflictMessage(text);
        setShowConflictAlert(true);
        return;
      }

      setConflictMessage('บันทึกการจองไม่สำเร็จ\n\n' + msg);
      setShowConflictAlert(true);
    }
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

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#FFD700', fontSize: '0.9rem', marginBottom: '5px' }}>ชื่อปาร์ตี้ (จะแสดงบนตั๋ว)</div>
            <IonInput
              value={partyName}
              onIonChange={e => setPartyName(e.detail.value!)}
              className="lux-input"
              placeholder="ตั้งชื่อทีม..."
              style={{ '--background': '#222', color: 'white', padding: '10px', borderRadius: '10px' } as any}
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
                <span style={{ color: '#888' }}>เวลา:</span> <br />
                <span style={{ color: 'white', fontWeight: 'bold' }}>{bookingData.startTime} - {bookingData.endTime}</span>
              </div>
              <div>
                <span style={{ color: '#888' }}>{isFootball ? 'สนาม:' : 'สนาม:'}</span> <br />
                <span style={{ color: 'white', fontWeight: 'bold' }}>
                  {isFootball ? `Field ${courtIds.join(', ')}` : `เบอร์ ${courtIds.join(', ')}`}
                </span>
              </div>
              <div>
                <span style={{ color: '#888' }}>จำนวนคน:</span> <br />
                <span style={{ color: 'white' }}>{members.length} คน</span>
              </div>
            </div>

            <div style={{ borderBottom: '1px dashed #555', margin: '15px 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>ราคารวมทั้งหมด</div>
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
              const personalPrice = basePricePerHead + (!isFootball && m.hasShoes ? 20 : 0);

              return (
                <IonItem
                  key={m.id}
                  lines="none"
                  className="party-item"
                  style={{ marginBottom: '10px', borderRadius: '10px', '--background': '#1a1a1a' } as any}
                >
                  <IonAvatar
                    slot="start"
                    style={{
                      background: '#333',
                      color: '#FFD700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      border: '1px solid #FFD700'
                    }}
                  >
                    {m.name.charAt(0)}
                  </IonAvatar>

                  <IonLabel>
                    <h3 style={{ color: '#fff' }}>{m.name}</h3>
                    <p style={{ color: '#888', fontSize: '0.8rem' }}>
                      จ่าย: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>฿{personalPrice}</span>
                    </p>
                  </IonLabel>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {!isFootball && (
                      <div style={{ display: 'flex', alignItems: 'center', color: '#aaa', fontSize: '0.8rem' }}>
                        <IonIcon icon={shirtOutline} style={{ marginRight: 5 }} />
                        <span style={{ marginRight: 5 }}>รองเท้า (+20฿)</span>
                        <IonCheckbox
                          checked={m.hasShoes}
                          onIonChange={() => toggleShoes(m.id)}
                          color="warning"
                          style={{ '--size': '18px', '--checkbox-background': '#333' } as any}
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

        {/* ✅ แก้เฉพาะป็อปอัพ: ไม่ใช้ <br/> แล้วใช้ CSS ให้ขึ้นบรรทัดใหม่ */}
        <IonAlert
          isOpen={showConflictAlert}
          onDidDismiss={() => setShowConflictAlert(false)}
          header="ไม่สามารถจองได้"
          message={conflictMessage}
          cssClass="lux-alert-preline"
          buttons={['ตกลง']}
        />
      </IonContent>

      <IonFooter className="ion-no-border">
        <IonToolbar className="lux-toolbar" style={{ padding: '10px' }}>
          <IonButton
            expand="block"
            color="success"
            size="large"
            onClick={handleConfirmBooking}
            style={{ fontWeight: 'bold', '--color': 'white', '--border-radius': '15px' } as any}
          >
            <IonIcon icon={walletOutline} slot="start" />
            ยืนยันการจอง ฿{grandTotal}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default BookingDetail;