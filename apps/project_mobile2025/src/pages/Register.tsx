import React, { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonIcon, IonText, useIonToast, IonHeader, IonToolbar, IonButtons, IonBackButton } from '@ionic/react';
import { lockClosedOutline, mailOutline, personAddOutline } from 'ionicons/icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useHistory } from 'react-router-dom';
import './Home.css';
import { auth, db } from '../firebaseConfig'; // เพิ่ม db
import { doc, setDoc } from 'firebase/firestore'; // เพิ่ม firestore functions

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const history = useHistory();
  const [present] = useIonToast();

const handleRegister = async () => {
  if (password !== confirmPassword) {
     present({ message: 'รหัสผ่านไม่ตรงกัน', duration: 2000, color: 'danger' });
     return;
  }

  try {
    // 1. สร้าง User ใน Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // บันทึกข้อมูลผู้ใช้ลงฐานข้อมูล "ทันที" ที่สมัครสำเร็จ
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: email.split('@')[0], // ใช้ชื่อหน้าอีเมลเป็นชื่อเล่นไปก่อน
      role: 'user',
      createdAt: new Date().toISOString()
    });

    present({ message: 'สมัครสมาชิกสำเร็จ!', duration: 2000, color: 'success' });
    history.push('/home');
  } catch (error: any) {
    present({ message: 'เกิดข้อผิดพลาด: ' + error.message, duration: 3000, color: 'danger' });
  }
};

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/login" color="light" /></IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="lux-page">
        <div className="lux-container" style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#FFD700', fontSize: '2rem', fontWeight: 'bold' }}>สมัครสมาชิก</h1>
          <p style={{ color: '#888' }}>สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>

          <div style={{ marginTop: '30px' }}>
            <div className="sport-card" style={{ marginBottom: '15px', padding: '5px 15px' }}>
              <IonInput placeholder="อีเมล" value={email} onIonInput={(e) => setEmail(e.detail.value!)}>
                <IonIcon icon={mailOutline} slot="start" style={{ marginRight: '10px' }} />
              </IonInput>
            </div>

            <div className="sport-card" style={{ marginBottom: '15px', padding: '5px 15px' }}>
              <IonInput type="password" placeholder="รหัสผ่าน" value={password} onIonInput={(e) => setPassword(e.detail.value!)}>
                <IonIcon icon={lockClosedOutline} slot="start" style={{ marginRight: '10px' }} />
              </IonInput>
            </div>

            <div className="sport-card" style={{ marginBottom: '30px', padding: '5px 15px' }}>
              <IonInput type="password" placeholder="ยืนยันรหัสผ่าน" value={confirmPassword} onIonInput={(e) => setConfirmPassword(e.detail.value!)}>
                <IonIcon icon={lockClosedOutline} slot="start" style={{ marginRight: '10px' }} />
              </IonInput>
            </div>

            <IonButton expand="block" color="warning" onClick={handleRegister} style={{ fontWeight: 'bold', '--color': 'black' }}>
              <IonIcon icon={personAddOutline} slot="start" /> ยืนยันสมัครสมาชิก
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;