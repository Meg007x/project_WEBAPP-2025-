import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Import หน้าต่างๆ ให้ครบ (เช็คชื่อไฟล์ให้ตรงกับในโฟลเดอร์ pages เป๊ะๆ นะครับ) */
import Home from './pages/Home';

import BadmintonVenue from './pages/BadmintonVenue'; // หน้ารายละเอียดสนาม
import CourtSelect from './pages/CourtSelect';       // หน้าเลือก Grid คอร์ด
import BookingDetail from './pages/BookingDetail';   // หน้าบิล/ปาร์ตี้
import BadmintonCourts from './pages/BadmintonCourts'; // เพิ่ม Import
import BookingTicket from './pages/BookingTicket'; // Import หน้าใหม่
import TicketList from './pages/TicketList';





/* CSS Imports */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';
import FootballFields from './pages/FootballFields';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        
        <Route exact path="/home" component={Home} />

        {/* 2. หน้าเลือกสนาม (List) - เพิ่มอันนี้ */}
        <Route exact path="/badminton-list" component={BadmintonCourts} />

        {/* 3. หน้ารายละเอียดสนาม (PS Badminton) */}
        <Route exact path="/badminton-venue" component={BadmintonVenue} />
        
        {/* 3. หน้าเลือกคอร์ด (Grid 8 ช่อง) */}
        <Route exact path="/court-select" component={CourtSelect} />
        
        {/* 4. หน้าสรุปยอด/ปาร์ตี้ */}
        <Route exact path="/booking-detail" component={BookingDetail} />

        {/* 5. หน้าตั๋ว */}
        <Route exact path="/booking-ticket" component={BookingTicket} />
        
        {/* 6. หน้ารายการตั๋วของฉัน */}
        <Route exact path="/ticket-list" component={TicketList} />


        {/* ถ้าเข้าแอพมาเฉยๆ ให้เด้งไป Home */}
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>






      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;