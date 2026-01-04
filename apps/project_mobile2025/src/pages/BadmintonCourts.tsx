import React from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonButtons, IonBackButton, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonCardContent, 
  IonIcon, IonBadge, IonButton, IonSearchbar
} from '@ionic/react';
import { locationOutline, timeOutline, navigateCircleOutline } from 'ionicons/icons';
import './Home.css'; // ใช้ CSS เดียวกับหน้า Home เพื่อคุมธีมให้เหมือนกันเป๊ะ

const BadmintonCourts: React.FC = () => {
  // ข้อมูลสมมติ (Mock Data)
  const courts = [
    {
      id: 1,
      name: 'PS Badminton ขอนแก่น',
      location: 'อ.เมือง ขอนแก่น (ใกล้ มข.)',
      distance: '1.5 กม.',
      price: 150,
      rating: 4.8,
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3xY_ZSFMhPL9kE0poDTYtijzEDCHfJfjmX5Y_36hC790mTXsjh3CE6tRudLCi_a1LCbgzmauRhJv5aAA7kDubm46SJLULYtHtUxL9bcAicbs0_xh4j82WufpFLeGtoXtMxojnVuHq9iyuWVpGlRfCb5oZJcLgQiMUHEW21q3WEC3GHwgXz9OUHAhmyzg/s1360/PS01.jpg', // รูปแทน
      status: 'Open'
    },
    {
      id: 2,
      name: 'Complex Court KKU',
      location: 'ภายในมหาวิทยาลัยขอนแก่น',
      distance: '0.8 กม.',
      price: 120,
      rating: 4.5,
      image: 'https://badmintonthaimatch.com/2026/firstshot/9722531760988200.png',
      status: 'Full' // ลองใส่สถานะเต็มดูบ้าง
    }
  ];

  return (
    <IonPage>
      {/* Header พร้อมปุ่มย้อนกลับ */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#121212' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" color="primary" text="" />
          </IonButtons>
          <IonTitle style={{ color: '#fff', fontWeight: 'bold' }}>เลือกสนามแบดมินตัน</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding" style={{ '--background': '#121212' }}>
        
        {/* Search Bar */}
        <IonSearchbar 
          placeholder="ค้นหาชื่อสนาม..." 
          className="custom-search"
        ></IonSearchbar>

        {/* Loop แสดงรายการสนาม */}
        {courts.map((court) => (
          <IonCard key={court.id} className="field-card" routerLink={`/court-detail/${court.id}`}>
            <div className="card-img-wrapper">
              <img src={court.image} alt={court.name} />
              <IonBadge className="rating-badge">⭐ {court.rating}</IonBadge>
              {court.status === 'Full' && (
                <IonBadge color="danger" style={{ position: 'absolute', top: 10, left: 10 }}>
                  เต็มแล้ว
                </IonBadge>
              )}
            </div>
            
            <IonCardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IonCardSubtitle className="field-type" style={{ color: '#D4AF37' }}>
                  BADMINTON
                </IonCardSubtitle>
                <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  ฿{court.price}
                </span>
              </div>
              <IonCardTitle className="field-title">{court.name}</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <div className="field-info" style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IonIcon icon={locationOutline} /> {court.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                  <IonIcon icon={navigateCircleOutline} style={{ color: '#D4AF37' }} /> 
                  <span style={{ color: '#aaa' }}>ห่างจากคุณ {court.distance}</span>
                </div>
              </div>
              
              <IonButton expand="block" style={{ marginTop: '15px', '--background': '#D4AF37', '--color': 'black', fontWeight: 'bold' }}>
                จองสนามนี้
              </IonButton>
            </IonCardContent>
          </IonCard>
        ))}

      </IonContent>
    </IonPage>
  );
};

export default BadmintonCourts;