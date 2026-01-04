import React from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonCard, IonCardHeader,
  IonCardSubtitle, IonCardTitle, IonCardContent,
  IonIcon, IonBadge, IonButton, IonSearchbar
} from '@ionic/react';
import { locationOutline, navigateCircleOutline } from 'ionicons/icons';
import './Home.css';

const FootballFields: React.FC = () => {

  // 🔹 Mock Data สนามฟุตบอล
  const fields = [
    {
      id: 1,
      name: '98 ARENA Cafe’ (สนามฟุตบอลหญ้าเทียม&คาเฟ่)',
      type: 'ฟุตบอลหญ้าเทียม 7 คน',
      location: 'อ.เมือง ขอนแก่น',
      distance: '1.2 กม.',
      price: 800,
      rating: 4.9,
      image: 'https://lh3.googleusercontent.com/p/AF1QipPSODeBEH_SOanKQWiMK5OSHCw4z_B5IN4vZlOU=s1360-w1360-h1020-rw',
      status: 'Open'
    },
    {
      id: 2,
      name: 'KKU Arena',
      type: 'ฟุตบอลหญ้าเทียม 5 คน',
      location: 'ใกล้มหาวิทยาลัยขอนแก่น',
      distance: '0.9 กม.',
      price: 600,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d',
      status: 'Full'
    }
  ];

  return (
    <IonPage>

      {/* Header */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#121212' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle style={{ color: '#fff', fontWeight: 'bold' }}>
            เลือกสนามฟุตบอล
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding" style={{ '--background': '#121212' }}>

        {/* Search */}
        <IonSearchbar
          placeholder="ค้นหาสนามฟุตบอล..."
          className="custom-search"
        />

        {/* รายการสนาม */}
        {fields.map(field => (
          <IonCard
            key={field.id}
            className="field-card"
            routerLink={`/football-detail/${field.id}`}   // 🔥 กดแล้วต้องขึ้น
          >

            <div className="card-img-wrapper">
              <img src={field.image} alt={field.name} />
              <IonBadge className="rating-badge">⭐ {field.rating}</IonBadge>

              {field.status === 'Full' && (
                <IonBadge color="danger" style={{ position: 'absolute', top: 10, left: 10 }}>
                  เต็มแล้ว
                </IonBadge>
              )}
            </div>

            <IonCardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <IonCardSubtitle style={{ color: '#D4AF37' }}>
                  FOOTBALL
                </IonCardSubtitle>
                <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  ฿{field.price}
                </span>
              </div>

              <IonCardTitle>{field.name}</IonCardTitle>
              <IonCardSubtitle>{field.type}</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
              <div style={{ borderTop: '1px solid #000000ff', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IonIcon icon={locationOutline} />
                  {field.location}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <IonIcon icon={navigateCircleOutline} />
                  <span style={{ color: '#ffffffff' }}>
                    ห่างจากคุณ {field.distance}
                  </span>
                </div>
              </div>

              <IonButton
                expand="block"
                style={{
                  marginTop: 15,
                  '--background': '#D4AF37',
                  '--color': '#000000ff',
                  fontWeight: 'bold'
                }}
              >
                จองสนามนี้
              </IonButton>
            </IonCardContent>

          </IonCard>
        ))}

      </IonContent>
    </IonPage>
  );
};

export default FootballFields;
