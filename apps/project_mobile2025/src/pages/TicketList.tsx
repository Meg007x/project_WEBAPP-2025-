// src/pages/TicketList.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonAlert,
  IonButton,
  IonText,
} from '@ionic/react';
import {
  timeOutline,
  trashOutline,
  footballOutline,
  locationOutline,
  calendarOutline,
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
  limit,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

type TicketDoc = {
  docId: string;
  id?: string;
  userId?: string;
  userEmail?: string | null;

  venue?: any;
  venueName?: string;
  partyName?: string;

  date?: string;
  dateKey?: string;

  startTime?: string;
  endTime?: string;
  startMin?: number;
  endMin?: number;

  courtIds?: number[];
  totalPrice?: number;

  createdAt?: any;
  reservationIds?: string[];
};

const TicketList: React.FC = () => {
  const history = useHistory();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [tickets, setTickets] = useState<TicketDoc[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [showAlert, setShowAlert] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<{ docId: string; reservationIds?: string[] } | null>(null);

  // ✅ DEBUG PANEL (เปิดด้วย ?debug=1)
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
    time: '',
  });

  useEffect(() => {
    const enabled = new URLSearchParams(window.location.search).get('debug') === '1';
    setDbg(d => ({ ...d, enabled }));
  }, []);

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

      // cleanup listener เก่า
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
          time: new Date().toLocaleTimeString(),
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
        time: new Date().toLocaleTimeString(),
      }));

      const bookingsRef = collection(db, 'bookings');

      const qWithOrder: Query<DocumentData> = query(
        bookingsRef,
        where('userId', '==', u.uid),
        orderBy('createdAt', 'desc')
      );

      const qNoOrder: Query<DocumentData> = query(
        bookingsRef,
        where('userId', '==', u.uid)
      );

      const subscribe = (qObj: Query<DocumentData>, mode: 'ORDER' | 'NO_ORDER') => {
        setDbg(d => ({ ...d, mode, time: new Date().toLocaleTimeString() }));

        return onSnapshot(
          qObj,
          (snap) => {
            const list: TicketDoc[] = snap.docs.map((d) => {
              const data = d.data() as any;
              return { docId: d.id, ...data };
            });

            const first = list[0] as any;
            setDbg(d => ({
              ...d,
              snapSize: snap.size,
              sampleDocId: first?.docId ?? '',
              sampleUserId: first?.userId ?? '',
              lastErrorCode: '',
              lastErrorMsg: '',
              time: new Date().toLocaleTimeString(),
            }));

            if (mode === 'NO_ORDER') {
              list.sort((a: any, b: any) => toMillis(b.createdAt) - toMillis(a.createdAt));
            }

            setTickets(list);
            setLoadingTickets(false);
          },
          async (err: any) => {
            setDbg(d => ({
              ...d,
              lastErrorCode: String(err?.code ?? ''),
              lastErrorMsg: String(err?.message ?? ''),
              time: new Date().toLocaleTimeString(),
            }));

            // missing index -> fallback
            if (
              mode === 'ORDER' &&
              (err?.code === 'failed-precondition' || String(err?.message || '').toLowerCase().includes('index'))
            ) {
              if (unsubBookings) {
                unsubBookings();
                unsubBookings = null;
              }
              unsubBookings = subscribe(qNoOrder, 'NO_ORDER');
              return;
            }

            // probe getDocs
            try {
              const probeQ = query(bookingsRef, where('userId', '==', u.uid), limit(5));
              const probeSnap = await getDocs(probeQ);
              setDbg(d => ({
                ...d,
                ranProbe: true,
                probeSize: probeSnap.size,
                probeError: '',
                time: new Date().toLocaleTimeString(),
              }));
            } catch (pe: any) {
              setDbg(d => ({
                ...d,
                ranProbe: true,
                probeSize: -1,
                probeError: `${pe?.code ?? ''} ${pe?.message ?? ''}`.trim(),
                time: new Date().toLocaleTimeString(),
              }));
            }

            setTickets([]);
            setLoadingTickets(false);
          }
        );
      };

      unsubBookings = subscribe(qWithOrder, 'ORDER');
    });

    return () => {
      if (unsubBookings) unsubBookings();
      stop();
    };
  }, [history]);

  const getSportType = (venueName: string = '') => {
    const lowerName = venueName.toLowerCase();
    const isFootball = [
      'soccer', 'football', 'field', 'arena', 'kick', 'stadium',
      'ฟุตบอล', 'บอล', 'หญ้าเทียม',
    ].some(k => lowerName.includes(k));

    if (isFootball) return { type: 'Football', icon: footballOutline, color: '#2dd36f' };
    return { type: 'Badminton', icon: undefined, color: '#FFD700' };
  };

  const openTicket = (t: TicketDoc) => {
    history.push({
      pathname: '/booking-ticket',
      state: { ...t, isJustBooked: false },
    });
  };

  const confirmDelete = async () => {
    if (!ticketToDelete?.docId) return;

    try {
      const batch = writeBatch(db);

      // 1) delete booking
      batch.delete(doc(db, 'bookings', ticketToDelete.docId));

      // 2) delete reservations
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
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" color="light" />
          </IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
            ตั๋วของฉัน (Wallet)
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">

          {/* ✅ DEBUG PANEL */}
          {dbg.enabled && (
            <div style={{
              border: '1px solid #444',
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              background: '#111',
              color: '#ddd',
              fontSize: 12,
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

              {/* เผื่อกรณี auth ยังไม่มา */}
              {!loadingTickets && !user && (
                <IonButton
                  color="warning"
                  style={{ marginTop: 12, '--color': '#000' } as any}
                  onClick={() => history.replace('/login')}
                >
                  ไปหน้าเข้าสู่ระบบ
                </IonButton>
              )}
            </div>
          ) : (
            tickets.map((t) => {
              const venueName = (t as any).venue?.name || t.venueName || 'Unknown Venue';
              const sport = getSportType(venueName);

              const d = new Date(t.date || new Date().toISOString());
              const day = d.getDate();
              const mon = d.toLocaleString('en-US', { month: 'short' });

              return (
                <div
                  key={t.docId}
                  style={{ marginBottom: '20px', position: 'relative' }}
                  onClick={() => openTicket(t)}
                >
                  {/* แถบวันที่ */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '80px',
                    background: sport.color,
                    borderRadius: '20px 0 0 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#000',
                    fontWeight: 'bold',
                    zIndex: 1,
                  }}>
                    <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{day}</span>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{mon}</span>
                    {sport.icon
                      ? <IonIcon icon={sport.icon} style={{ marginTop: 10, fontSize: '1.5rem' }} />
                      : <span style={{ marginTop: 6, fontSize: '1.2rem' }}>🏸</span>
                    }
                  </div>

                  {/* เนื้อหา */}
                  <div style={{
                    marginLeft: '70px',
                    background: '#1a1a1a',
                    padding: '20px 20px 20px 25px',
                    borderRadius: '0 20px 20px 0',
                    minHeight: '120px',
                    border: '1px solid #333',
                    borderLeft: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}>
                    <div style={{ width: '100%' }}>
                      <div style={{
                        color: '#888',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}>
                        <IonIcon icon={locationOutline} style={{ marginRight: 4, color: sport.color }} />
                        {venueName}
                      </div>

                      <h2 style={{
                        margin: '0 0 8px 0',
                        color: '#fff',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                      }}>
                        {t.partyName || 'My Booking'}
                      </h2>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{
                          background: '#333',
                          padding: '4px 8px',
                          borderRadius: 6,
                          color: '#ccc',
                          fontSize: '0.85rem',
                        }}>
                          <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          {t.startTime} - {t.endTime}
                        </div>

                        {Array.isArray(t.courtIds) && (
                          <div style={{ color: '#666', fontSize: '0.85rem' }}>
                            {t.courtIds.length} {sport.type === 'Football' ? 'สนาม' : 'คอร์ด'}
                          </div>
                        )}

                        {typeof t.totalPrice === 'number' && (
                          <IonText color="medium">
                            <small style={{ color: '#FFD700' }}>฿{t.totalPrice}</small>
                          </IonText>
                        )}
                      </div>
                    </div>

                    {/* ปุ่มลบ */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setTicketToDelete({ docId: t.docId, reservationIds: t.reservationIds || [] });
                        setShowAlert(true);
                      }}
                      style={{ padding: '10px', color: '#ff4961', opacity: 0.9 }}
                      title="ลบตั๋ว"
                    >
                      <IonIcon icon={trashOutline} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Alert ยืนยันการลบ */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="ยืนยันการลบ"
          message="ต้องการลบตั๋วใบนี้ใช่หรือไม่?"
          buttons={[
            { text: 'ยกเลิก', role: 'cancel' },
            { text: 'ลบ', handler: () => { void confirmDelete(); } },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default TicketList;