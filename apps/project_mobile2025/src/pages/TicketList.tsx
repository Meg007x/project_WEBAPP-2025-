// src/pages/TicketList.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonIcon, IonAlert
} from '@ionic/react';
import {
  timeOutline, trashOutline, footballOutline,
  locationOutline, calendarOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Home.css';

// ✅ Firebase
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  writeBatch,
  Timestamp,
  Query,
  DocumentData,
  getDocs,
  limit
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const TicketList: React.FC = () => {
  const history = useHistory();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [showAlert, setShowAlert] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<{ docId: string; reservationIds?: string[] } | null>(null);

  // ✅ DEBUG STATE (ไว้โชว์บนหน้าจอด้วย)
  const [dbg, setDbg] = useState({
    enabled: false,
    uid: '',
    email: '',
    mode: '' as '' | 'ORDER' | 'NO_ORDER',
    snapSize: 0,
    lastErrorCode: '',
    lastErrorMsg: '',
    sampleUserId: '',
    sampleDocId: '',
    ranProbe: false,
    probeSize: -1,
    probeError: '',
    time: ''
  });

  // เปิด debug แบบง่าย: เติม ?debug=1 ที่ท้าย URL เช่น /ticket-list?debug=1
  useEffect(() => {
    const enabled = new URLSearchParams(window.location.search).get('debug') === '1';
    setDbg(d => ({ ...d, enabled }));
  }, []);

  // helper: createdAt อาจเป็น Timestamp/undefined
  const toMillis = (v: any) => {
    if (!v) return 0;
    if (v instanceof Timestamp) return v.toMillis();
    if (typeof v?.toMillis === 'function') return v.toMillis();
    if (v instanceof Date) return v.getTime();
    return 0;
  };

  useEffect(() => {
    let unsubBookings: null | (() => void) = null;

    const stop = onAuthStateChanged(auth, (u) => {
      setAuthReady(true);

      // cleanup listener เก่า (ตอนสลับ user / logout)
      if (unsubBookings) {
        unsubBookings();
        unsubBookings = null;
      }

      if (!u) {
        setUser(null);
        setTickets([]);
        setLoadingTickets(false);
        setDbg(d => ({
          ...d,
          uid: '',
          email: '',
          mode: '',
          snapSize: 0,
          lastErrorCode: '',
          lastErrorMsg: '',
          sampleUserId: '',
          sampleDocId: '',
          time: new Date().toLocaleTimeString()
        }));
        history.replace('/login');
        return;
      }

      setUser(u);
      setLoadingTickets(true);

      setDbg(d => ({
        ...d,
        uid: u.uid,
        email: u.email ?? '',
        lastErrorCode: '',
        lastErrorMsg: '',
        sampleUserId: '',
        sampleDocId: '',
        time: new Date().toLocaleTimeString()
      }));

      console.log('[TicketList] AUTH -> uid=', u.uid, 'email=', u.email);

      // ✅ IMPORTANT: เอกสารคุณอยู่ใน collection "bookings"
      const bookingsRef = collection(db, 'bookings');

      // ตัวเลือก A (อยากได้ newest first)
      const qWithOrder: Query<DocumentData> = query(
        bookingsRef,
        where('userId', '==', u.uid),
        orderBy('createdAt', 'desc')
      );

      // ตัวเลือก B (fallback ถ้าโดน index)
      const qNoOrder: Query<DocumentData> = query(
        bookingsRef,
        where('userId', '==', u.uid)
      );

      const subscribe = (qObj: Query<DocumentData>, mode: 'ORDER' | 'NO_ORDER') => {
        setDbg(d => ({ ...d, mode, time: new Date().toLocaleTimeString() }));
        console.log('[TicketList] SUBSCRIBE mode=', mode);

        return onSnapshot(
          qObj,
          (snap) => {
            const list = snap.docs.map((d) => {
              const data = d.data();
              return { docId: d.id, ...data };
            });

            // ✅ DEBUG: ดูผล snapshot
            console.log('[TicketList] SNAP', mode, 'size=', snap.size, 'docs=', list);

            // ถ้ามี doc แรก: โชว์ userId ใน doc เทียบกับ uid ที่ล็อกอิน
            const first = list[0] as any;
            setDbg(d => ({
              ...d,
              snapSize: snap.size,
              sampleDocId: first?.docId ?? '',
              sampleUserId: first?.userId ?? '',
              lastErrorCode: '',
              lastErrorMsg: '',
              time: new Date().toLocaleTimeString()
            }));

            // ถ้าเป็น NO_ORDER ให้ sort ในเครื่องแทน
            if (mode === 'NO_ORDER') {
              list.sort((a: any, b: any) => toMillis(b.createdAt) - toMillis(a.createdAt));
            }

            setTickets(list);
            setLoadingTickets(false);
          },
          async (err: any) => {
            console.error('[TicketList] onSnapshot error:', err?.code, err?.message);

            setDbg(d => ({
              ...d,
              lastErrorCode: String(err?.code ?? ''),
              lastErrorMsg: String(err?.message ?? ''),
              time: new Date().toLocaleTimeString()
            }));

            // ถ้า error เพราะไม่มี index -> fallback ไป query แบบไม่ orderBy
            if (
              mode === 'ORDER' &&
              (err?.code === 'failed-precondition' || String(err?.message || '').toLowerCase().includes('index'))
            ) {
              console.warn('[TicketList] Missing index -> fallback to NO_ORDER');
              if (unsubBookings) {
                unsubBookings();
                unsubBookings = null;
              }
              unsubBookings = subscribe(qNoOrder, 'NO_ORDER');
              return;
            }

            // ✅ EXTRA DEBUG: ลอง probe getDocs แบบ where เดียว (กัน snapshot แปลก)
            try {
              const probeQ = query(bookingsRef, where('userId', '==', u.uid), limit(5));
              const probeSnap = await getDocs(probeQ);
              console.log('[TicketList] PROBE getDocs size=', probeSnap.size, probeSnap.docs.map(d => ({ id: d.id, ...d.data() })));

              setDbg(d => ({
                ...d,
                ranProbe: true,
                probeSize: probeSnap.size,
                probeError: '',
                time: new Date().toLocaleTimeString()
              }));
            } catch (pe: any) {
              console.error('[TicketList] PROBE getDocs error:', pe?.code, pe?.message);
              setDbg(d => ({
                ...d,
                ranProbe: true,
                probeSize: -1,
                probeError: `${pe?.code ?? ''} ${pe?.message ?? ''}`.trim(),
                time: new Date().toLocaleTimeString()
              }));
            }

            setTickets([]);
            setLoadingTickets(false);
          }
        );
      };

      // เริ่มจาก ORDER ก่อน
      unsubBookings = subscribe(qWithOrder, 'ORDER');
    });

    return () => {
      if (unsubBookings) unsubBookings();
      stop();
    };
  }, [history]);

  const getSportType = (venueName: string = "") => {
    const lowerName = venueName.toLowerCase();
    const isFootball = [
      'soccer', 'football', 'field', 'arena', 'kick', 'stadium',
      'ฟุตบอล', 'บอล', 'หญ้าเทียม'
    ].some(keyword => lowerName.includes(keyword));

    if (isFootball) return { type: 'Football', icon: footballOutline, color: '#2dd36f' };
    return { type: 'Badminton', icon: undefined, color: '#FFD700' };
  };

  const openTicket = (t: any) => {
    history.push({
      pathname: '/booking-ticket',
      state: { ...t, isJustBooked: false }
    });
  };

  const confirmDelete = async () => {
    if (!ticketToDelete?.docId) return;

    try {
      const batch = writeBatch(db);

      // 1) ลบ booking
      batch.delete(doc(db, 'bookings', ticketToDelete.docId));

      // 2) ลบ reservation slots (ปลดล็อกเวลา)
      const reservationIds = ticketToDelete.reservationIds || [];
      for (const rid of reservationIds) {
        batch.delete(doc(db, 'court_reservations', rid));
      }

      await batch.commit();
    } catch (e) {
      console.error('[TicketList] delete booking error:', e);
    } finally {
      setShowAlert(false);
      setTicketToDelete(null);
    }
  };

  const emptyState = useMemo(() => {
    if (!authReady) return true;
    if (loadingTickets) return true;
    return tickets.length === 0;
  }, [authReady, loadingTickets, tickets.length]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/home" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>ตั๋วของฉัน</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">

          {/* ✅ DEBUG PANEL (เปิดด้วย ?debug=1) */}
          {dbg.enabled && (
            <div style={{
              border: '1px solid #444',
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              background: '#111',
              color: '#ddd',
              fontSize: 12
            }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>DEBUG TicketList</div>
              <div>time: {dbg.time}</div>
              <div>authReady: {String(authReady)} | loading: {String(loadingTickets)}</div>
              <div>uid: {dbg.uid}</div>
              <div>email: {dbg.email}</div>
              <div>mode: {dbg.mode} | snapSize: {dbg.snapSize}</div>
              <div>sampleDocId: {dbg.sampleDocId}</div>
              <div>sampleUserId(in doc): {dbg.sampleUserId}</div>
              <div style={{ marginTop: 6, color: dbg.lastErrorCode ? '#ff6b6b' : '#9ae6b4' }}>
                lastError: {dbg.lastErrorCode ? `${dbg.lastErrorCode} ${dbg.lastErrorMsg}` : 'NONE'}
              </div>
              <div style={{ marginTop: 6 }}>
                probe(getDocs): {dbg.ranProbe ? (dbg.probeError ? `ERR ${dbg.probeError}` : `size=${dbg.probeSize}`) : 'not run'}
              </div>
              <div style={{ marginTop: 6 }}>tickets(state): {tickets.length}</div>
            </div>
          )}

          {emptyState ? (
            <div style={{ textAlign: 'center', marginTop: '50%', color: '#666' }}>
              <IonIcon icon={calendarOutline} style={{ fontSize: '4rem', opacity: 0.5 }} />
              <p>{loadingTickets ? 'กำลังโหลดตั๋ว...' : 'ยังไม่มีประวัติการจอง'}</p>
            </div>
          ) : (
            tickets.map((t) => {
              const venueName = t.venue?.name || t.venueName || "Unknown Venue";
              const sport = getSportType(venueName);

              const d = new Date(t.date);
              const day = d.getDate();
              const mon = d.toLocaleString('en-US', { month: 'short' });

              return (
                <div
                  key={t.docId || t.id}
                  style={{ marginBottom: '20px', position: 'relative' }}
                  onClick={() => openTicket(t)}
                >
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px',
                    background: sport.color,
                    borderRadius: '20px 0 0 20px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    color: '#000', fontWeight: 'bold', zIndex: 1
                  }}>
                    <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{day}</span>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{mon}</span>
                    {sport.icon
                      ? <IonIcon icon={sport.icon} style={{ marginTop: 10, fontSize: '1.5rem' }} />
                      : <span style={{ marginTop: 5, fontSize: '1.2rem' }}>🏸</span>
                    }
                  </div>

                  <div style={{
                    marginLeft: '70px', background: '#1a1a1a', padding: '20px 20px 20px 25px',
                    borderRadius: '0 20px 20px 0', minHeight: '120px',
                    border: '1px solid #333', borderLeft: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer'
                  }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ color: '#888', fontSize: '0.8rem', display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <IonIcon icon={locationOutline} style={{ marginRight: 4, color: sport.color }} />
                        {venueName}
                      </div>

                      <h2 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {t.partyName || "My Booking"}
                      </h2>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ background: '#333', padding: '4px 8px', borderRadius: 6, color: '#ccc', fontSize: '0.85rem' }}>
                          <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          {t.startTime} - {t.endTime}
                        </div>

                        {t.courtIds && (
                          <div style={{ color: '#666', fontSize: '0.85rem' }}>
                            {t.courtIds.length} {sport.type === 'Football' ? 'สนาม' : 'คอร์ด'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setTicketToDelete({ docId: t.docId, reservationIds: t.reservationIds || [] });
                        setShowAlert(true);
                      }}
                      style={{ padding: '10px', color: '#ff4961', opacity: 0.8 }}
                    >
                      <IonIcon icon={trashOutline} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="ยืนยันการลบ"
          message="ต้องการลบตั๋วใบนี้ใช่หรือไม่?"
          buttons={[
            'ยกเลิก',
            { text: 'ลบ', handler: () => { void confirmDelete(); } }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default TicketList;