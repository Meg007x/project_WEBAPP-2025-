import React, { useState } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, 
  IonCard, IonCardContent, IonIcon, IonButton, IonBadge, IonSearchbar 
} from '@ionic/react';
import { locationOutline, timeOutline, star, walletOutline, arrowForward } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Home.css';

const BadmintonCourts: React.FC = () => {
  const history = useHistory();
  const [searchText, setSearchText] = useState('');

  // ฟังก์ชันกลางสำหรับเปลี่ยนหน้า: รับ id เพื่อบอกว่าเป็นสนามไหน
  const goToVenue = (id: number) => {
    history.push({
      pathname: '/badminton-venue', 
      state: { venue: { id: id } }
    });
  };
  
  // ฟังก์ชันเช็คว่าชื่อสนามตรงกับคำค้นหาไหม (ถ้าไม่ได้พิมพ์อะไรเลย ให้แสดงทั้งหมด)
  const matchSearch = (name: string) => {
    if (!searchText) return true;
    return name.toLowerCase().includes(searchText.toLowerCase());
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

          {/* ✅ เพิ่มช่องค้นหาตรงนี้ (สีเข้มเข้ากับธีม) */}
          <IonSearchbar 
            value={searchText} 
            onIonInput={(e) => setSearchText(e.detail.value!)} 
            placeholder="ค้นหาชื่อสนาม..." 
            animated={true}
            style={{ '--background': '#222', '--color': '#fff', padding: '0', paddingBottom: '15px' } as any}
          />
          
          {/* --- การ์ดที่ 1: PS Badminton --- */}
          {matchSearch('PS Badminton') && (
            <IonCard className="lux-card" style={{ marginBottom: '20px', borderRadius: '15px', overflow: 'hidden' }}>
              <div style={{ height: '200px', position: 'relative' }}>
                 <img 
                   src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3xY_ZSFMhPL9kE0poDTYtijzEDCHfJfjmX5Y_36hC790mTXsjh3CE6tRudLCi_a1LCbgzmauRhJv5aAA7kDubm46SJLULYtHtUxL9bcAicbs0_xh4j82WufpFLeGtoXtMxojnVuHq9iyuWVpGlRfCb5oZJcLgQiMUHEW21q3WEC3GHwgXz9OUHAhmyzg/s1360/PS01.jpg" 
                   alt="PS Badminton" 
                   style={{ width:'100%', height:'100%', objectFit:'cover' }} 
                 />
                 <div style={{ position: 'absolute', top: 10, right: 10 }}>
                   <IonBadge color="warning" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                      <IonIcon icon={star} style={{ marginRight: '3px' }}/> 4.8
                   </IonBadge>
                 </div>
                 <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px 15px 10px' }}>
                   <h2 style={{ color: 'white', fontWeight: 'bold', margin: 0, fontSize: '1.5rem', textShadow: '2px 2px 4px black' }}>PS Badminton</h2>
                   <div style={{ color: '#ccc', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                      <IonIcon icon={locationOutline} style={{ marginRight: '5px', color: '#FFD700' }}/> 
                      6.5 กม. • โซนบึงทุ่งสร้าง
                   </div>
                 </div>
              </div>
              
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
                    onClick={() => goToVenue(1)} 
                    style={{ '--color': 'black', fontWeight: 'bold', '--border-radius': '8px' }}
                  >
                    ดูรายละเอียด & จอง <IonIcon icon={arrowForward} slot="end" />
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {/* --- การ์ดที่ 2: PCR Badminton --- */}
          {matchSearch('PCR Badminton') && (
            <IonCard className="lux-card" style={{ marginBottom: '20px', borderRadius: '15px', overflow: 'hidden' }}>
              <div style={{ height: '200px', position: 'relative' }}>
                 <img 
                   src="https://static.wixstatic.com/media/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp/v1/fill/w_568,h_378,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/7bfec5_647d39a988e74a2d956dac2f8e1d70af~mv2.webp" 
                   alt="PCR Badminton" 
                   style={{ width:'100%', height:'100%', objectFit:'cover' }} 
                 />
                 <div style={{ position: 'absolute', top: 10, right: 10 }}>
                   <IonBadge color="warning" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                      <IonIcon icon={star} style={{ marginRight: '3px' }}/> 4.2
                   </IonBadge>
                 </div>
                 <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px 15px 10px' }}>
                   <h2 style={{ color: 'white', fontWeight: 'bold', margin: 0, fontSize: '1.5rem', textShadow: '2px 2px 4px black' }}>PCR Badminton</h2>
                   <div style={{ color: '#ccc', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                      <IonIcon icon={locationOutline} style={{ marginRight: '5px', color: '#FFD700' }}/> 
                      2.8 กม. • โซนกังสดาล/โนนม่วง
                   </div>
                 </div>
              </div>
              
              <IonCardContent style={{ paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem', color: '#ddd' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={timeOutline} style={{ marginRight: '6px', color: '#2dd36f' }} />
                    10:00 - 24:00 น.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={walletOutline} style={{ marginRight: '6px', color: '#FFD700' }} />
                    120 - 170 บาท/ชม.
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                  <IonButton 
                    expand="block" 
                    color="warning" 
                    onClick={() => goToVenue(2)} 
                    style={{ '--color': 'black', fontWeight: 'bold', '--border-radius': '8px' }}
                  >
                    ดูรายละเอียด & จอง <IonIcon icon={arrowForward} slot="end" />
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {/* --- การ์ดที่ 3: Blue Zone Badminton --- */}
          {matchSearch('Blue Zone Badminton') && (
            <IonCard className="lux-card" style={{ marginBottom: '20px', borderRadius: '15px', overflow: 'hidden' }}>
              <div style={{ height: '200px', position: 'relative' }}>
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgtIP-eO9f2hmYfvejHsMfl_mHOIxCe1Wl4Q&s" 
                  alt="Blue Zone Badminton" 
                  style={{ width:'100%', height:'100%', objectFit:'cover' }} 
                />
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <IonBadge color="warning" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                      <IonIcon icon={star} style={{ marginRight: '3px' }}/> 4.5
                  </IonBadge>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px 15px 10px' }}>
                  <h2 style={{ color: 'white', fontWeight: 'bold', margin: 0, fontSize: '1.5rem', textShadow: '2px 2px 4px black' }}>Blue Zone Badminton</h2>
                  <div style={{ color: '#ccc', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                      <IonIcon icon={locationOutline} style={{ marginRight: '5px', color: '#FFD700' }}/> 
                      8.2 กม. • โซนศิลา/เลี่ยงเมือง
                  </div>
                </div>
              </div>
              
              <IonCardContent style={{ paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem', color: '#ddd' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={timeOutline} style={{ marginRight: '6px', color: '#2dd36f' }} />
                    09:00 - 24:00 น.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={walletOutline} style={{ marginRight: '6px', color: '#FFD700' }} />
                    120 - 180 บาท/ชม.
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                  {/* ตรงปุ่มของการ์ด Blue Zone */}
                  <IonButton 
                    expand="block" 
                    color="warning" 
                    onClick={() => history.push('/venue-bluezone')} 
                    style={{ '--color': 'black', fontWeight: 'bold', '--border-radius': '8px' }}
                  >
                    ดูรายละเอียด & จอง <IonIcon icon={arrowForward} slot="end" />
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default BadmintonCourts;