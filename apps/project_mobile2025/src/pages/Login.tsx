import React, { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonIcon, IonText, useIonToast } from '@ionic/react';
import { lockClosedOutline, mailOutline, logInOutline } from 'ionicons/icons';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();
  const [present] = useIonToast();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      present({ message: 'เข้าสู่ระบบสำเร็จ!', duration: 2000, color: 'success' });
      history.push('/home');
    } catch (error: any) {
      present({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', duration: 2000, color: 'danger' });
    }
  };

  return (
    <IonPage>
      <IonContent className="lux-page">
        <div className="lux-container" style={{ marginTop: '10vh', textAlign: 'center' }}>
          <h1 style={{ color: '#FFD700', fontSize: '2.5rem', fontWeight: 'bold' }}>LUX SPORT</h1>
          <p style={{ color: '#888' }}>เข้าสู่ระบบเพื่อจองสนาม</p>

          <div style={{ marginTop: '40px' }}>
            <div className="sport-card" style={{ marginBottom: '15px', padding: '5px 15px' }}>
              <IonInput 
                placeholder="อีเมล" 
                value={email} 
                onIonInput={(e) => setEmail(e.detail.value!)}
              >
                <IonIcon icon={mailOutline} slot="start" style={{ marginRight: '10px' }} />
              </IonInput>
            </div>

            <div className="sport-card" style={{ marginBottom: '30px', padding: '5px 15px' }}>
              <IonInput 
                type="password" 
                placeholder="รหัสผ่าน" 
                value={password} 
                onIonInput={(e) => setPassword(e.detail.value!)}
              >
                <IonIcon icon={lockClosedOutline} slot="start" style={{ marginRight: '10px' }} />
              </IonInput>
            </div>

            <IonButton expand="block" color="warning" className="lux-button" onClick={handleLogin}>
              <IonIcon icon={logInOutline} slot="start" /> เข้าสู่ระบบ
            </IonButton>

            <IonText color="medium" style={{ marginTop: '20px', display: 'block' }}>
              ยังไม่มีบัญชี? <span style={{ color: '#FFD700' }} onClick={() => history.push('/register')}>สมัครสมาชิก</span>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;