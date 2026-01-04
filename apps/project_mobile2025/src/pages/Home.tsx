import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';


const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>โปรเจคใหม่ของฉัน</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>สวัสดีครับ!</h1>
        <p>นี่คือหน้าแรกที่ฉันเริ่มเขียนเอง</p>
      </IonContent>
    </IonPage>
  );
};

export default Home;
