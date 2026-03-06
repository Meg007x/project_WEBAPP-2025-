import React, { useEffect, useState } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Pages */
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import BookingHistory from './pages/BookingHistory';

import BadmintonCourts from './pages/BadmintonCourts';
import BadmintonVenue from './pages/BadmintonVenue';
import CourtSelect from './pages/CourtSelect';
import BookingDetail from './pages/BookingDetail';
import BookingTicket from './pages/BookingTicket';
import TicketList from './pages/TicketList';
import BadmintonVenuePCR from './pages/BadmintonVenuePCR';
import CourtSelectPS from './pages/CourtSelectPS';
import CourtSelectPCR from './pages/CourtSelectPCR';
import BadmintonVenueBlueZone from './pages/BadmintonVenueBlueZone';
import CourtSelectBlueZone from './pages/CourtSelectBlueZone';

import FootballFields from './pages/FootballFields';
import FootballVenue from './pages/FootballVenue';
import FootballSelect from './pages/FootballSelect';

import VenueSearch from './pages/VenueSearch';
import VenueDetail from './pages/VenueDetail';

/* Firebase */
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

/* CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

/** ✅ PrivateRoute: บังคับล็อกอินก่อนเข้า */
type PrivateRouteProps = RouteProps & {
  component: React.ComponentType<any>;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthed(!!u);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (checking) return null; // จะทำ loading ก็ได้
        return authed ? <Component {...props} /> : <Redirect to="/login" />;
      }}
    />
  );
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>

        {/* Public */}
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/history" component={BookingHistory} />
        

        {/* Private */}
        <PrivateRoute exact path="/home" component={Home} />

        {/* Badminton flow */}
        <PrivateRoute exact path="/badminton-list" component={BadmintonCourts} />
        <PrivateRoute exact path="/badminton-venue" component={BadmintonVenue} />
        <PrivateRoute exact path="/court-select" component={CourtSelect} />
        <PrivateRoute exact path="/booking-detail" component={BookingDetail} />
        {/* ✅ ปรับเป็น PrivateRoute เพื่อให้เข้าถึงข้อมูล User ได้ในการออกตั๋ว */}
        <PrivateRoute exact path="/booking-ticket" component={BookingTicket} /> 
        <PrivateRoute exact path="/ticket-list" component={TicketList} />

        {/* ✅ ปรับเป็น PrivateRoute ทั้งหมดเพื่อป้องกัน User หลุดจากระบบขณะเลือกสนาม */}
        <PrivateRoute exact path="/venue-pcr" component={BadmintonVenuePCR} />
        {/* หน้าเลือกว่าจะเอาคอร์ทไหน (แยก PS และ PCR) */}
        <PrivateRoute exact path="/ps-booking" component={CourtSelectPS} />
        <PrivateRoute exact path="/pcr-booking" component={CourtSelectPCR} />
        <PrivateRoute exact path="/venue-bluezone" component={BadmintonVenueBlueZone} />
        <PrivateRoute exact path="/booking-bluezone" component={CourtSelectBlueZone} />

        {/* Football flow */}
        <PrivateRoute exact path="/football-list" component={FootballFields} />
        <PrivateRoute exact path="/football-venue" component={FootballVenue} />
        <PrivateRoute exact path="/football-select" component={FootballSelect} />

        {/* Search / Map */}
        <PrivateRoute exact path="/venue-search" component={VenueSearch} />
        {/* ✅ ปรับ Path ให้ตรงกับฟังก์ชันนำทางในหน้า Search และ Home */}
        {/* เปลี่ยนจาก VenueDetail เป็น FootballVenue เพื่อใช้รูปแบบเดียวกับแบตมินตัน */}
        <PrivateRoute exact path="/venue-detail/:id" component={FootballVenue} />

        {/* Default */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        {/* Fallback (กันเข้าลิงก์ผิด) */}
        <Route render={() => <Redirect to="/home" />} />

      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;