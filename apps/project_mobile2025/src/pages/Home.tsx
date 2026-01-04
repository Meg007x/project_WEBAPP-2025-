import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar ,  IonSearchbar, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonCardContent, IonIcon, IonText, 
  IonButton, IonBadge, IonAvatar, IonButtons } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import React from 'react';
import { 
  footballOutline, alertCircleOutline, locationOutline, 
  searchOutline, notificationsOutline, personCircleOutline 
} from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';

const Home: React.FC = () => {
  const router = useIonRouter();
  return (
    <IonPage>
      {/* --- Header ส่วนบน --- */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="home-toolbar">
          <div className="header-container">
            <div>
              <IonText color="medium">
                <small>👋 สวัสดีตอนเย็น</small>
              </IonText>
              <h2 className="user-name">Meg007x</h2>
            </div>
            <IonButtons slot="end">
              <IonButton className="notify-btn">
                <IonIcon icon={notificationsOutline} />
                <span className="dot"></span>
              </IonButton>
            </IonButtons>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding-horizontal home-content">
        
        {/* --- Search Bar --- */}
        <div className="search-section">
          <IonSearchbar 
            placeholder="ค้นหาสนาม, กีฬา..." 
            className="custom-search"
            searchIcon={searchOutline}
          ></IonSearchbar>
        </div>

        {/* --- Hero Banner (โปรโมชั่นหรือไฮไลท์) --- */}
        <div className="hero-banner">
          <div className="hero-text">
            <h3>เตะบอลกันมั้ย?</h3>
            <p>จองสนามใกล้ ม. วันนี้<br/>รับส่วนลด 10%</p>
            <IonButton size="small" color="light" shape="round">
              ดูเลย
            </IonButton>
          </div>
          <img src="https://cdn-icons-png.flaticon.com/512/3214/3214648.png" alt="sport" className="hero-img" />
        </div>

        {/* --- หมวดหมู่กีฬา (Category) --- */}
        <div className="section-title">
          <h3>เลือกกีฬา</h3>
        </div>
        
        <IonGrid className="category-grid">
          <IonRow>
            {/* กล่องแบดมินตัน */}
          <IonCol size="6">
            <div className="sport-card" onClick={() => router.push('/badminton')}>
              <div className="icon-bg">🏸</div>
              <h4>แบดมินตัน</h4>
              <p>12 สนาม</p>
            </div>
          </IonCol>

            {/* กล่องฟุตบอล */}
            <IonCol size="6">
              <div className="sport-card football-card">
                <div className="icon-bg">⚽</div>
                <h4>ฟุตบอล</h4>
                <p>8 สนาม</p>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* --- สนามแนะนำ (Recommended) --- */}
        <div className="section-header">
          <h3>สนามยอดฮิต 🔥</h3>
          <IonButton fill="clear" size="small">ดูทั้งหมด</IonButton>
        </div>

        {/* Card สนามที่ 1 */}
        <IonCard className="field-card">
          <div className="card-img-wrapper">
             {/* ใส่รูปจริงแทน src นี้ได้เลย */}
            <img src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="field" />
            <IonBadge color="warning" className="rating-badge">⭐ 4.8</IonBadge>
          </div>
          <IonCardHeader>
            <IonCardSubtitle className="field-type">ฟุตบอลหญ้าเทียม (7 คน)</IonCardSubtitle>
            <IonCardTitle className="field-title">สนาม KS Soccer Club</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="field-info">
              <span><IonIcon icon={locationOutline} /> 1.2 กม.</span>
              <span className="price">฿800 / ชม.</span>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Card สนามที่ 2 */}
        <IonCard className="field-card">
          <div className="card-img-wrapper">
            <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3xY_ZSFMhPL9kE0poDTYtijzEDCHfJfjmX5Y_36hC790mTXsjh3CE6tRudLCi_a1LCbgzmauRhJv5aAA7kDubm46SJLULYtHtUxL9bcAicbs0_xh4j82WufpFLeGtoXtMxojnVuHq9iyuWVpGlRfCb5oZJcLgQiMUHEW21q3WEC3GHwgXz9OUHAhmyzg/s1360/PS01.jpg" alt="field" />
            <IonBadge color="warning" className="rating-badge">⭐ 4.5</IonBadge>
          </div>
          <IonCardHeader>
            <IonCardSubtitle className="field-type">แบดมินตัน (ในร่ม)</IonCardSubtitle>
            <IonCardTitle className="field-title">Complex Court</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="field-info">
              <span><IonIcon icon={locationOutline} /> 0.8 กม.</span>
              <span className="price">฿120 / ชม.</span>
            </div>
          </IonCardContent>
        </IonCard>

        <div style={{ height: '50px' }}></div> {/* Spacer ด้านล่าง */}
      </IonContent>
    </IonPage>
  );
};

export default Home;
