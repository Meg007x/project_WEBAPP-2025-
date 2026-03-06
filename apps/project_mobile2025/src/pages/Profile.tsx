// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonInput, IonItem, IonLabel
} from '@ionic/react';
import { personCircleOutline, logOutOutline, saveOutline, lockClosedOutline, timeOutline } from 'ionicons/icons'; // ⭐️ เพิ่ม timeOutline
import { useHistory } from 'react-router-dom';
import { getAuth, updateProfile, updatePassword, signOut } from 'firebase/auth';
import './Home.css';

const Profile: React.FC = () => {
  const history = useHistory();
  const auth = getAuth();
  const user = auth.currentUser;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    } else {
      history.replace('/login');
    }
  }, [user, history]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
        // บังคับให้หน้าจอนี้อัปเดตชื่อตามทันที
        setDisplayName(displayName); 
      }
      
      if (newPassword.length > 0) {
        if (newPassword.length < 6) {
          alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
          setLoading(false);
          return;
        }
        await updatePassword(user, newPassword);
        setNewPassword('');
      }

      alert('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!');
    } catch (error: any) {
      console.error("Profile update error:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert('เพื่อความปลอดภัย กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้งก่อนเปลี่ยนรหัสผ่านครับ');
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      try {
        await signOut(auth);
        history.replace('/login');
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/home" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>โปรไฟล์ของฉัน</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container" style={{ textAlign: 'center', marginTop: '20px' }}>
          
          <IonIcon icon={personCircleOutline} style={{ fontSize: '100px', color: '#FFD700' }} />
          <h2 style={{ color: 'white', marginTop: '10px' }}>{displayName || 'ผู้ใช้งาน'}</h2>

          <div className="lux-card" style={{ padding: '20px', marginTop: '30px', textAlign: 'left' }}>
            
            <div style={{ marginBottom: '15px' }}>
              <IonLabel style={{ color: '#FFD700', fontSize: '0.9rem' }}>ชื่อที่แสดง</IonLabel>
              <IonItem lines="none" style={{ '--background': '#222', borderRadius: '10px', marginTop: '5px' }}>
                <IonInput 
                  value={displayName} 
                  onIonChange={e => setDisplayName(e.detail.value!)} 
                  style={{ color: 'white' }}
                />
              </IonItem>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <IonLabel style={{ color: '#aaa', fontSize: '0.9rem' }}>อีเมล (ไม่สามารถเปลี่ยนได้)</IonLabel>
              <IonItem lines="none" style={{ '--background': '#111', borderRadius: '10px', marginTop: '5px' }}>
                <IonInput value={email} readonly style={{ color: '#666' }} />
              </IonItem>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <IonLabel style={{ color: '#FFD700', fontSize: '0.9rem' }}>
                <IonIcon icon={lockClosedOutline} /> เปลี่ยนรหัสผ่านใหม่ (ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)
              </IonLabel>
              <IonItem lines="none" style={{ '--background': '#222', borderRadius: '10px', marginTop: '5px' }}>
                <IonInput 
                  type="password" 
                  placeholder="รหัสผ่านใหม่..."
                  value={newPassword} 
                  onIonChange={e => setNewPassword(e.detail.value!)} 
                  style={{ color: 'white' }}
                />
              </IonItem>
            </div>

            <IonButton expand="block" color="warning" onClick={handleSave} disabled={loading} style={{ fontWeight: 'bold' }}>
              <IonIcon icon={saveOutline} slot="start" />
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </IonButton>

          </div>

          {/* ⭐️ ปุ่มไปดูประวัติการจอง ย้ายมาอยู่ตรงนี้ */}
          <IonButton 
            expand="block" 
            color="tertiary" 
            onClick={() => history.push('/history')} 
            style={{ marginTop: '20px', fontWeight: 'bold' }}
          >
            <IonIcon icon={timeOutline} slot="start" />
            ดูประวัติการจองทั้งหมด
          </IonButton>

          <IonButton 
            expand="block" 
            color="danger" 
            fill="outline"
            onClick={handleLogout} 
            style={{ marginTop: '15px', fontWeight: 'bold', '--border-color': '#ff4961', '--color': '#ff4961' } as any}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            ออกจากระบบ
          </IonButton>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;