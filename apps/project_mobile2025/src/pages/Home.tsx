import { 
  IonContent, IonPage, IonSearchbar, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonCardContent, IonIcon, 
  IonText, IonButton, IonBadge, IonButtons 
} from '@ionic/react';
import './Home.css';
import React from 'react';
import { 
  locationOutline, searchOutline, notificationsOutline, 
  qrCodeOutline, flashOutline 
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { seedDatabase } from '../data/seed'; // import มาจากไฟล์ที่เราสร้าง

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      {/* ❌ เอา IonHeader ออกไปเลย เพื่อให้ข้างบนไม่ Fix */}

      <IonContent fullscreen className="lux-page">
        
        {/* ✅ สร้าง Wrapper ใหญ่สุด ใส่ padding 20px รอบทิศ */}
        <div style={{ padding: '20px', paddingBottom: '40px' }}>

          {/* --- ส่วนหัว (Header) ย้ายมาอยู่ที่นี่แทน --- */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '10px' }}>
            <div>
              <IonText color="medium"><small>👋 สวัสดีตอนเย็น</small></IonText>
              <h2 className="user-name" style={{ margin: 0, fontSize: '1.8rem' }}>Meg007x</h2>
            </div>
            <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '50%', border: '1px solid #333' }}>
                <IonIcon icon={notificationsOutline} color="warning" style={{ fontSize: '1.2rem' }} />
            </div>
          </div>

          {/* Search */}
          <div className="search-section" style={{ marginBottom: '25px' }}>
            <IonSearchbar 
              placeholder="ค้นหาสนาม, กีฬา..." 
              className="custom-search" 
              searchIcon={searchOutline}
              style={{ padding: 0 }} // ล้าง padding เดิมของ searchbar
            ></IonSearchbar>
          </div>

          {/* ปุ่ม Wallet */}
          <div style={{ marginBottom: '25px' }}>
            <div 
              onClick={() => history.push('/ticket-list')}
              style={{ 
                padding: '20px', 
                background: 'linear-gradient(90deg, #FFD700 0%, #b8860b 100%)', 
                borderRadius: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                color: '#000', boxShadow: '0 8px 20px rgba(255, 215, 0, 0.25)', cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <IonIcon icon={qrCodeOutline} style={{ fontSize: '2.2rem' }} />
                <div>
                    <h4 style={{ margin: 0, fontWeight: '900', fontSize: '1.1rem' }}>ตั๋วของฉัน (Wallet)</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>ดูประวัติการจองทั้งหมด</p>
                </div>
              </div>
              <IonIcon icon={flashOutline} style={{ fontSize: '1.4rem' }} />
            </div>
          </div>

          {/* Hero Banner */}
          <div className="hero-banner" style={{ borderRadius: '20px', marginBottom: '25px' }}>
            <div className="hero-text" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.5rem' }}>เตะบอลกันมั้ย?</h3>
              <p>จองสนามใกล้ ม. วันนี้<br/>รับส่วนลด 10%</p>
              <IonButton size="small" color="light" shape="round">ดูเลย</IonButton>
            </div>
            <img src="https://cdn-icons-png.flaticon.com/512/3214/3214648.png" alt="sport" className="hero-img" style={{ right: '15px' }} />
          </div>

          {/* Category Grid */}
          <div className="section-title" style={{ marginBottom: '15px' }}><h3>เลือกกีฬา</h3></div>
          
          <IonGrid style={{ padding: 0, marginBottom: '25px' }}>
            <IonRow>
              <IonCol size="6" style={{ paddingRight: '8px' }}>
                <div className="sport-card" onClick={() => history.push('/badminton-list')} style={{ borderRadius: '20px' }}>
                  <div className="icon-bg">🏸</div>
                  <h4>แบดมินตัน</h4>
                  <p>12 สนาม</p>
                </div>
              </IonCol>
              <IonCol size="6" style={{ paddingLeft: '8px' }}>
                <div className="sport-card" onClick={() => alert('🚧')} style={{ borderRadius: '20px' }}>
                  <div className="icon-bg">⚽</div>
                  <h4>ฟุตบอล</h4>
                  <p>8 สนาม</p>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Recommended Fields */}
          <div className="section-header" style={{ marginBottom: '15px' }}>
            <h3>สนามยอดฮิต 🔥</h3>
            <IonButton fill="clear" size="small" color="warning">ดูทั้งหมด</IonButton>
          </div>
          
          <IonButton fill="clear" color="medium" onClick={seedDatabase}>
            (Admin) กดเพื่อสร้างฐานข้อมูลสนามครั้งแรก
          </IonButton>

          <IonCard className="field-card" onClick={() => history.push('/badminton-venue')} style={{ borderRadius: '24px', margin: 0, width: '100%' }}>
            <div className="card-img-wrapper">
              <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3xY_ZSFMhPL9kE0poDTYtijzEDCHfJfjmX5Y_36hC790mTXsjh3CE6tRudLCi_a1LCbgzmauRhJv5aAA7kDubm46SJLULYtHtUxL9bcAicbs0_xh4j82WufpFLeGtoXtMxojnVuHq9iyuWVpGlRfCb5oZJcLgQiMUHEW21q3WEC3GHwgXz9OUHAhmyzg/s1360/PS01.jpg" alt="field" />
              <IonBadge color="warning" className="rating-badge" style={{ top: '15px', right: '15px' }}>⭐ 4.5</IonBadge>
            </div>
            <IonCardHeader>
              <IonCardSubtitle className="field-type">แบดมินตัน (ในร่ม)</IonCardSubtitle>
              <IonCardTitle className="field-title">PS Badminton</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="field-info">
                <span><IonIcon icon={locationOutline} /> 0.8 กม.</span>
                <span className="price">฿120 / ชม.</span>
              </div>
            </IonCardContent>
          </IonCard>
          
        </div> {/* จบ Wrapper */}
      </IonContent>
    </IonPage>
  );
};

export default Home;