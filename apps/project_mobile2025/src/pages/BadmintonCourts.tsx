import React from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, 
  IonCard, IonCardContent, IonIcon, IonButton, IonBadge 
} from '@ionic/react';
import { locationOutline, timeOutline, star, walletOutline, arrowForward } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Home.css';

const BadmintonCourts: React.FC = () => {
  const history = useHistory();

  // แก้ Link: กดแล้วไปหน้า "รายละเอียดสนาม (Venue)" ก่อน (ตาม Flow เดิม)
  const openVenueDetail = () => {
    history.push({
      pathname: '/badminton-venue', // ชื่อ route ตามที่คุณตั้ง
      state: { venue: { id: 1, name: 'PS Badminton' } }
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/home" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>สนามแบดมินตัน</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container">
          
          {/* การ์ดสนาม PS Badminton */}
          <IonCard className="lux-card" style={{ marginBottom: '20px', borderRadius: '15px', overflow: 'hidden' }}>
            
            {/* ส่วนรูปภาพ */}
            <div style={{ height: '200px', position: 'relative' }}>
               <img 
                 src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3xY_ZSFMhPL9kE0poDTYtijzEDCHfJfjmX5Y_36hC790mTXsjh3CE6tRudLCi_a1LCbgzmauRhJv5aAA7kDubm46SJLULYtHtUxL9bcAicbs0_xh4j82WufpFLeGtoXtMxojnVuHq9iyuWVpGlRfCb5oZJcLgQiMUHEW21q3WEC3GHwgXz9OUHAhmyzg/s1360/PS01.jpg" 
                 alt="court" 
                 style={{ width:'100%', height:'100%', objectFit:'cover' }} 
               />
               <div style={{ position: 'absolute', top: 10, right: 10 }}>
                 <IonBadge color="warning" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                    <IonIcon icon={star} style={{ marginRight: '3px' }}/> 4.8
                 </IonBadge>
               </div>
               <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px 15px 10px' }}>
                 <h2 style={{ color: 'white', fontWeight: 'bold', margin: 0, fontSize: '1.5rem', textShadow: '2px 2px 4px black' }}>
                   PS Badminton
                 </h2>
                 <div style={{ color: '#ccc', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={locationOutline} style={{ marginRight: '5px', color: '#FFD700' }}/> 
                    6.5 กม. จาก มข. ถนน บางกอกน้อย
                 </div>
               </div>
            </div>
            
            {/* ส่วนข้อมูลสังเขป (ที่บอกว่าหายไป ผมเติมให้แล้วครับ) */}
            <IonCardContent style={{ paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem', color: '#ddd' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IonIcon icon={timeOutline} style={{ marginRight: '6px', color: '#2dd36f' }} />
                  15:00 - 24:00 น.
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IonIcon icon={walletOutline} style={{ marginRight: '6px', color: '#FFD700' }} />
                  120 - 180 บาท/ชม.
                </div>
              </div>

              <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                <IonButton 
                  expand="block" 
                  color="warning" 
                  onClick={openVenueDetail} 
                  style={{ '--color': 'black', fontWeight: 'bold', '--border-radius': '8px' }}
                >
                  ดูรายละเอียด & จอง <IonIcon icon={arrowForward} slot="end" />
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default BadmintonCourts;