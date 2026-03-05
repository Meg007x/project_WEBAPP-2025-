import React, { useEffect, useState } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Pages */
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

import BadmintonCourts from './pages/BadmintonCourts';
import BadmintonVenue from './pages/BadmintonVenue';
import CourtSelect from './pages/CourtSelect';
import BookingDetail from './pages/BookingDetail';
import BookingTicket from './pages/BookingTicket';
import TicketList from './pages/TicketList';

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

        {/* Private */}
        <PrivateRoute exact path="/home" component={Home} />

        {/* Badminton flow */}
        <PrivateRoute exact path="/badminton-list" component={BadmintonCourts} />
        <PrivateRoute exact path="/badminton-venue" component={BadmintonVenue} />
        <PrivateRoute exact path="/court-select" component={CourtSelect} />
        <PrivateRoute exact path="/booking-detail" component={BookingDetail} />
        <PrivateRoute exact path="/booking-ticket" component={BookingTicket} />
        <PrivateRoute exact path="/ticket-list" component={TicketList} />

        {/* Football flow */}
        <PrivateRoute exact path="/football-list" component={FootballFields} />
        <PrivateRoute exact path="/football-venue" component={FootballVenue} />
        <PrivateRoute exact path="/football-select" component={FootballSelect} />

        {/* Search / Map */}
        <PrivateRoute exact path="/venue-search" component={VenueSearch} />
        <PrivateRoute exact path="/venue/:id" component={VenueDetail} />

        {/* Default */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        {/* Fallback (กันเข้าลิงก์ผิด) */}
        <Redirect to="/login" />

      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;