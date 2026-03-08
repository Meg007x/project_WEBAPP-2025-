import React, { useState } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonFooter, useIonToast, IonSpinner } from '@ionic/react';
import { walletOutline, cloudUploadOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';

const Payment: React.FC = () => {
  const location = useLocation<any>();
  const history = useHistory();
  const [present] = useIonToast();
  
  // State จำลองการอัปโหลดสลีป
  const [isUploading, setIsUploading] = useState(false);
  const [hasSlip, setHasSlip] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // รับข้อมูลที่โยนมาจากหน้า BookingDetail
  const ticketPayload = location?.state?.ticketPayload;
  const courtIds = location?.state?.courtIds || [];

  if (!ticketPayload) {
    return <IonPage><IonContent>ไม่พบข้อมูลการจอง ถอยทัพกลับไปซะ!</IonContent></IonPage>;
  }

  // ฟังก์ชันสร้าง ID ของ Reservation (ก๊อปมาจากหน้าเก่าแกนั่นแหละ)
  const makeReservationDocId = (venueId: string, dKey: string, courtId: string | number, slot: number) => {
    return `${venueId}_${dKey}_court${String(courtId)}_slot${slot}`;
  };

  const buildSlotKeys = (startMin: number, endMin: number) => {
    const slots: number[] = [];
    for (let m = startMin; m < endMin; m += 60) slots.push(Math.floor(m / 60));
    return slots;
  };

  // ⭐️ จำลองการอัปโหลดสลีป (Mock)
  const handleMockUploadSlip = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setHasSlip(true);
      present({ message: 'อัปโหลดสลีปสำเร็จ!', duration: 2000, color: 'success' });
    }, 1500);
  };

  // ⭐️ ฟังก์ชันบันทึกข้อมูลจริง (ย้ายมาจากหน้าเก่า)
  const handleConfirmPayment = async () => {
    if (!hasSlip) {
      present({ message: 'กรุณาแนบสลีปก่อนยืนยัน!', duration: 2000, color: 'warning' });
      return;
    }

    setIsProcessing(true);
    const user = auth.currentUser;
    const venueId = ticketPayload.venueId;
    const dKey = ticketPayload.dateKey;
    const slots = buildSlotKeys(ticketPayload.startMin, ticketPayload.endMin);

    try {
      const bookingsCol = collection(db, 'bookings');
      const reservationsCol = collection(db, 'court_reservations');
      const bookingRef = doc(bookingsCol);

      const reservationIds: string[] = [];
      for (const cId of courtIds) {
        for (const s of slots) {
          reservationIds.push(makeReservationDocId(venueId, dKey, cId, s));
        }
      }

      await runTransaction(db, async (tx) => {
        // เช็คการจองซ้อน
        for (const rid of reservationIds) {
          const rRef = doc(reservationsCol, rid);
          const snap = await tx.get(rRef);
          if (snap.exists()) {
            throw new Error(`คิวนี้มีคนปาดหน้าจองไปแล้วเฟ้ย!`);
          }
        }
        
        // บันทึกบิล
        tx.set(bookingRef, {
          ...ticketPayload,
          id: bookingRef.id,
          reservationIds,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        // บันทึกคิว
        for (const cId of courtIds) {
          for (const s of slots) {
            const rid = makeReservationDocId(venueId, dKey, cId, s);
            tx.set(doc(reservationsCol, rid), {
              bookingId: bookingRef.id,
              userId: user!.uid,
              venueId,
              venueName: ticketPayload.venueName,
              dateKey: dKey,
              courtId: cId,
              slot: s,
              startTime: ticketPayload.startTime,
              endTime: ticketPayload.endTime,
              createdAt: serverTimestamp(),
            });
          }
        }
      });

      // ถ้าสำเร็จ เด้งไปหน้าตั๋ว
      present({ message: 'ชำระเงินและจองสนามสำเร็จ!', duration: 2000, color: 'success' });
      history.push({
        pathname: '/booking-ticket',
        state: { ...ticketPayload, id: bookingRef.id, isJustBooked: true }
      });

    } catch (e: any) {
      present({ message: e.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', duration: 3000, color: 'danger' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="lux-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/booking" color="light" /></IonButtons>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>ชำระเงิน (Payment)</div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="lux-page">
        <div className="lux-container" style={{ textAlign: 'center', padding: '20px' }}>
          
          <h2 style={{ color: '#FFD700', fontWeight: 'bold' }}>สแกน QR Code เพื่อชำระเงิน</h2>
          <p style={{ color: '#888' }}>พร้อมเพย์ (PromptPay)</p>

          {/* รูป QR Code จำลอง */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', display: 'inline-block', marginBottom: '20px', border: '3px solid #FFD700' }}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
              alt="Mock QR Code" 
              style={{ width: '200px', height: '200px' }} 
            />
          </div>

          <h1 style={{ color: 'white', fontWeight: 'bold' }}>ยอดชำระ: ฿{ticketPayload.totalPrice}</h1>
          <p style={{ color: '#aaa', marginBottom: '30px' }}>ชื่อบัญชี: บจก. สปอร์ตฮับ บุกกิ้ง (จำลอง)</p>

          {/* ปุ่มแนบสลีป (Mock) */}
          <IonButton 
            expand="block" 
            color={hasSlip ? "success" : "medium"} 
            onClick={handleMockUploadSlip}
            disabled={isUploading || hasSlip}
            style={{ fontWeight: 'bold', marginBottom: '15px' }}
          >
            <IonIcon icon={hasSlip ? checkmarkCircleOutline : cloudUploadOutline} slot="start" />
            {isUploading ? <IonSpinner name="dots" /> : hasSlip ? 'แนบสลีปสำเร็จแล้ว' : 'จำลองแนบสลีปโอนเงิน'}
          </IonButton>

        </div>
      </IonContent>

      <IonFooter className="ion-no-border">
        <IonToolbar className="lux-toolbar" style={{ padding: '10px' }}>
          <IonButton 
            expand="block" 
            color="warning" 
            size="large" 
            onClick={handleConfirmPayment} 
            disabled={!hasSlip || isProcessing}
            style={{ fontWeight: 'bold', '--color': 'black', '--border-radius': '15px' } as any}
          >
            <IonIcon icon={walletOutline} slot="start" />
            {isProcessing ? 'กำลังยืนยันการจอง...' : 'ยืนยันการชำระเงิน'}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Payment;