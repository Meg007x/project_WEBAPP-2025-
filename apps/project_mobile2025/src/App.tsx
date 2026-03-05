import React, { useEffect, useState } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';


import Home from './pages/Home';

import BadmintonVenue from './pages/BadmintonVenue'; // หน้ารายละเอียดสนาม
import CourtSelect from './pages/CourtSelect';       // หน้าเลือก Grid คอร์ด
import BookingDetail from './pages/BookingDetail';   // หน้าบิล/ปาร์ตี้
import BadmintonCourts from './pages/BadmintonCourts'; // เพิ่ม Import
import BookingTicket from './pages/BookingTicket'; // Import หน้าใหม่
import TicketList from './pages/TicketList';
import Register from './pages/Register';

/* CSS Imports */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

import FootballFields from './pages/FootballFields';
import FootballVenue from './pages/FootballVenue';
import FootballSelect from './pages/FootballSelect';

import Login from './pages/Login';

// ✅ เพิ่ม: auth guard
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// ✅ เพิ่ม: หน้าค้นหา/รายละเอียดสนาม (Leaflet)
import VenueSearch from './pages/VenueSearch';
import VenueDetail from './pages/VenueDetail';

setupIonicReact();

// ✅ PrivateRoute: บังคับล็อกอินก่อนเข้า page อื่น
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
        if (checking) return null; // หรือจะทำ Loading ก็ได้
        return authed ? <Component {...props} /> : <Redirect to="/login" />;
      }}
    />
  );
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>

        {/* หน้าหลัก & Auth */}
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />

        {/* ✅ ป้องกันทุกหน้าหลัง login */}
        <PrivateRoute exact path="/home" component={Home} />

        {/* 2. หน้าเลือกสนาม (List) - เพิ่มอันนี้ */}
        <PrivateRoute exact path="/badminton-list" component={BadmintonCourts} />

        {/* 3. หน้ารายละเอียดสนาม (PS Badminton) */}
        <PrivateRoute exact path="/badminton-venue" component={BadmintonVenue} />

        {/* 3. หน้าเลือกคอร์ด (Grid 8 ช่อง) */}
        <PrivateRoute exact path="/court-select" component={CourtSelect} />

        {/* 4. หน้าสรุปยอด/ปาร์ตี้ */}
        <PrivateRoute exact path="/booking-detail" component={BookingDetail} />

        {/* 5. หน้าตั๋ว */}
        <PrivateRoute exact path="/booking-ticket" component={BookingTicket} />

        {/* 6. หน้ารายการตั๋วของฉัน */}
        <PrivateRoute exact path="/ticket-list" component={TicketList} />

        {/* ✅ ฟุตบอล: list / venue / select */}
        <PrivateRoute exact path="/football-list" component={FootballFields} />
        <PrivateRoute exact path="/football-venue" component={FootballVenue} />
        <PrivateRoute exact path="/football-select" component={FootballSelect} />

        {/* ✅ ค้นหา/สนามใกล้เคียง + รายละเอียดสนาม (Leaflet) */}
        <PrivateRoute exact path="/venue-search" component={VenueSearch} />
        <PrivateRoute exact path="/venue/:id" component={VenueDetail} />

        {/* ถ้าเข้าแอพมาเฉยๆ ให้เด้งไป Login ก่อน */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        <Redirect exact from="/" to="/login" />

      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;