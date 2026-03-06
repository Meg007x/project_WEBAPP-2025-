// src/pages/Home.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  IonContent, IonPage, IonSearchbar, IonGrid, IonRow, IonCol, IonCard, 
  IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonIcon,
  IonText, IonButton, IonBadge, IonToast, useIonViewWillEnter // ⭐️ เพิ่มตัวนี้เข้ามา
} from '@ionic/react';
import {
  locationOutline, searchOutline, notificationsOutline,
  qrCodeOutline, flashOutline, cloudUploadOutline, personCircleOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { seedDatabase } from '../data/seed'; 
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [recommendedVenues, setRecommendedVenues] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);

  const greetingText = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return '👋 สวัสดีตอนเช้า';
    if (h < 18) return '👋 สวัสดีตอนบ่าย';
    return '👋 สวัสดีตอนเย็น';
  }, []);

  const fetchVenues = async () => {
    try {
      const q = query(collection(db, 'venues'), limit(5));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecommendedVenues(list);
    } catch (err) {
      console.error("Error fetching venues:", err);
    }
  };

  // ⭐️ หมัดเด็ด: บังคับให้อัปเดตชื่อใหม่ทุกครั้งที่กลับมาหน้า Home
  useIonViewWillEnter(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setDisplayName(currentUser.displayName || currentUser.email?.split('@')[0] || 'User');
    }
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        history.replace('/login');
        return;
      }
      setUser(u);
      setDisplayName(u.displayName || u.email?.split('@')[0] || 'User');
    });

    fetchVenues();
    return () => unsub();
  }, [history]);

  const handleSeedData = async () => {
    const confirmAction = window.confirm("คุณต้องการอัปเดตข้อมูลสนามเข้าสู่ Firestore ใช่หรือไม่?");
    if (confirmAction) {
      await seedDatabase();
      setShowToast(true);
      fetchVenues();
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="lux-page">
        <div style={{ padding: '20px', paddingBottom: '40px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <IonText color="medium"><small>{greetingText}</small></IonText>
              <h2 className="user-name" style={{ margin: 0, fontSize: '1.8rem', color: 'white' }}>
                {displayName || '...'}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div onClick={handleSeedData} style={{ background: '#1a1a1a', padding: '10px', borderRadius: '50%', border: '1px solid #333', cursor: 'pointer' }}>
                <IonIcon icon={cloudUploadOutline} color="success" />
              </div>
              <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '50%', border: '1px solid #333', cursor: 'pointer' }}>
                <IonIcon icon={notificationsOutline} color="warning" />
              </div>
              <div onClick={() => history.push('/profile')} style={{ background: '#1a1a1a', padding: '10px', borderRadius: '50%', border: '1px solid #FFD700', cursor: 'pointer' }}>
                <IonIcon icon={personCircleOutline} color="warning" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="search-section" style={{ marginBottom: '25px' }} onClick={() => history.push('/venue-search')}>
            <IonSearchbar placeholder="ค้นหาสนาม, กีฬา..." className="custom-search" searchIcon={searchOutline} disabled />
          </div>

          {/* Wallet - ⭐️ เปลี่ยนกลับให้ไปที่ /ticket-list */}
          <div style={{ marginBottom: '25px', cursor: 'pointer' }} onClick={() => history.push('/ticket-list')}>
            <div style={{
              padding: '20px', background: 'linear-gradient(90deg, #FFD700 0%, #b8860b 100%)',
              borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#000',
              boxShadow: '0 8px 20px rgba(255, 215, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <IonIcon icon={qrCodeOutline} style={{ fontSize: '2.2rem' }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: '900' }}>ตั๋วของฉัน (Wallet)</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>สแกนคิวอาร์โค้ดเข้าสนาม</p>
                </div>
              </div>
              <IonIcon icon={flashOutline} style={{ fontSize: '1.4rem' }} />
            </div>
          </div>

          {/* Hero Banner */}
          <div className="hero-banner" style={{ borderRadius: '20px', marginBottom: '25px', position: 'relative', overflow: 'hidden' }}>
            <div className="hero-text" style={{ padding: '24px', position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: '1.5rem', color: 'white', fontWeight: 'bold' }}>เตะบอลกันมั้ย?</h3>
              <p style={{ color: 'white', opacity: 0.9 }}>จองสนามใกล้ ม. วันนี้<br />รับส่วนลด 10%</p>
              <IonButton
                size="small"
                color="light"
                shape="round"
                onClick={() => history.push('/football-list')}
                style={{ '--color': 'black', fontWeight: 'bold' }}
              >
                ดูเลย
              </IonButton>
            </div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3214/3214648.png"
              alt="sport"
              className="hero-img"
              style={{ position: 'absolute', right: '15px', bottom: '10px', width: '100px', opacity: 0.8 }}
            />
          </div>

          {/* Category Grid */}
          <div className="section-title" style={{ marginBottom: '15px' }}><h3 style={{color:'white'}}>เลือกกีฬา</h3></div>
          <IonGrid style={{ padding: 0, marginBottom: '25px' }}>
            <IonRow>
              <IonCol size="6">
                <div className="sport-card" onClick={() => history.push('/badminton-list')}>
                  <div className="icon-bg">🏸</div>
                  <h4>แบดมินตัน</h4>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="sport-card" onClick={() => history.push('/football-list')}>
                  <div className="icon-bg">⚽</div>
                  <h4>ฟุตบอล</h4>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Recommended Fields */}
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{color:'white'}}>สนามยอดฮิต 🔥</h3>
            <IonButton fill="clear" color="warning" onClick={() => history.push('/venue-search')}>ดูทั้งหมด</IonButton>
          </div>

          {recommendedVenues.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
              ยังไม่มีข้อมูลสนาม กดปุ่มก้อนเมฆเพื่ออัปเดต
            </div>
          ) : (
            recommendedVenues.map((v) => (
              <IonCard 
                key={v.id} 
                className="field-card" 
                onClick={() => {
                  const path = v.type === 'football' ? `/football-venue/${v.id}` : `/badminton-venue`;
                  history.push(path, { venueId: v.id });
                }}
                style={{ borderRadius: '24px', margin: '0 0 20px 0', width: '100%', background: '#1a1a1a', cursor: 'pointer' }}
              >
                <div style={{ height: '180px', position: 'relative' }}>
                  <img src={v.imageUrl} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <IonBadge color="warning" style={{ position: 'absolute', top: '15px', right: '15px' }}>⭐ {v.rating || '5.0'}</IonBadge>
                </div>
                <IonCardHeader>
                  <IonCardSubtitle>{v.type === 'football' ? 'ฟุตบอล' : 'แบดมินตัน'}</IonCardSubtitle>
                  <IonCardTitle style={{ color: 'white' }}>{v.name}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc' }}>
                    <span><IonIcon icon={locationOutline} /> {v.zone}</span>
                    <span style={{ color: '#FFD700', fontWeight: 'bold' }}>฿{v.priceRange} / ชม.</span>
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="อัปเดตข้อมูลสำเร็จ!"
          duration={2000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;