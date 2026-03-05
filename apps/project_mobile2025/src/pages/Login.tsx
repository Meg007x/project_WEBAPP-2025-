// src/pages/Login.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  useIonToast,
} from "@ionic/react";
import {
  lockClosedOutline,
  mailOutline,
  logInOutline,
  logoGoogle,
  callOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./Home.css";

import { auth } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const Login: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();

  // Email login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone login
  const [phone, setPhone] = useState(""); // รูปแบบ +66...
  const [otp, setOtp] = useState("");
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);

  // ป้องกัน render ซ้ำ
  const recaptchaReadyRef = useRef(false);

  useEffect(() => {
    // สร้าง RecaptchaVerifier แค่ครั้งเดียว
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved - จะถูกเรียกตอนส่ง OTP
        },
      });
    }

    // render แค่ครั้งเดียว
    if (!recaptchaReadyRef.current) {
      recaptchaReadyRef.current = true;
      window.recaptchaVerifier
        .render()
        .catch(() => {
          // ถ้าเคย render แล้ว บางที firebase จะ throw - ให้เงียบไว้
        });
    }

    return () => {
      // กัน Hot reload / เปลี่ยนหน้าแล้วกลับมา render ซ้ำ
      try {
        window.recaptchaVerifier?.clear();
      } catch {}
      window.recaptchaVerifier = undefined;
      recaptchaReadyRef.current = false;
    };
  }, []);

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      present({ message: "เข้าสู่ระบบสำเร็จ!", duration: 2000, color: "success" });
      history.replace("/home");
    } catch {
      present({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", duration: 2000, color: "danger" });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      present({ message: "เข้าสู่ระบบด้วย Google สำเร็จ!", duration: 2000, color: "success" });
      history.replace("/home");
    } catch (e: any) {
      present({
        message: "Google Login ไม่สำเร็จ: " + (e?.message || ""),
        duration: 2500,
        color: "danger",
      });
    }
  };

  const handleSendOtp = async () => {
    if (!phone.startsWith("+")) {
      present({ message: "กรุณาใส่เบอร์แบบสากล เช่น +66812345678", duration: 2500, color: "warning" });
      return;
    }

    try {
      setSendingOtp(true);

      const verifier = window.recaptchaVerifier;
      if (!verifier) {
        present({ message: "reCAPTCHA ยังไม่พร้อม ลองใหม่อีกครั้ง", duration: 2000, color: "danger" });
        setSendingOtp(false);
        return;
      }

      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmResult(result);

      present({ message: "ส่ง OTP แล้ว", duration: 2000, color: "success" });
    } catch (e: any) {
      // เคลียร์ verifier แล้วสร้างใหม่กันค้าง
      try {
        window.recaptchaVerifier?.clear();
      } catch {}
      window.recaptchaVerifier = undefined;
      recaptchaReadyRef.current = false;

      present({
        message: "ส่ง OTP ไม่สำเร็จ: " + (e?.message || ""),
        duration: 3000,
        color: "danger",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmResult) {
      present({ message: "ยังไม่ได้ส่ง OTP", duration: 2000, color: "warning" });
      return;
    }
    try {
      await confirmResult.confirm(otp);
      present({ message: "ยืนยัน OTP สำเร็จ!", duration: 2000, color: "success" });
      history.replace("/home");
    } catch {
      present({ message: "OTP ไม่ถูกต้อง", duration: 2000, color: "danger" });
    }
  };

  return (
    <IonPage>
      <IonContent className="lux-page">
        <div className="lux-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Logo / Title */}
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <h1 style={{ color: "#FFD700", fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>LUX SPORT</h1>
            <p style={{ color: "#888", marginTop: 6, marginBottom: 0 }}>เข้าสู่ระบบเพื่อจองสนาม</p>
          </div>

          {/* สำคัญ: div นี้ต้องมีอยู่จริง และต้องไม่ซ้ำ id */}
          <div id="recaptcha-container" />

          {/* ===== Card: Email & Google ===== */}
          <div
            className="lux-card"
            style={{
              padding: 16,
              borderRadius: 18,
              border: "1px solid #333",
              marginBottom: 18,
            }}
          >
            <IonText color="medium">
              <small>เข้าสู่ระบบด้วยอีเมล</small>
            </IonText>

            <div style={{ marginTop: 12 }}>
              <div className="sport-card" style={{ marginBottom: 12, padding: "6px 14px", borderRadius: 14 }}>
                <IonInput
                  placeholder="อีเมล"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value as string)}
                >
                  <IonIcon icon={mailOutline} slot="start" style={{ marginRight: "10px" }} />
                </IonInput>
              </div>

              <div className="sport-card" style={{ marginBottom: 14, padding: "6px 14px", borderRadius: 14 }}>
                <IonInput
                  type="password"
                  placeholder="รหัสผ่าน"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value as string)}
                >
                  <IonIcon icon={lockClosedOutline} slot="start" style={{ marginRight: "10px" }} />
                </IonInput>
              </div>

              <IonButton expand="block" color="warning" onClick={handleEmailLogin} style={{ fontWeight: "bold", "--color": "#000" } as any}>
                <IonIcon icon={logInOutline} slot="start" /> เข้าสู่ระบบด้วยอีเมล
              </IonButton>

              {/* Google (ทำให้เด่นขึ้น: solid + กรอบทองบางๆ ตามธีม) */}
              <IonButton
                expand="block"
                onClick={handleGoogleLogin}
                className="google-btn"
                style={{
                  marginTop: 10,
                  fontWeight: "bold",
                  "--background": "#1a1a1a",
                  "--color": "#ffffff",
                  "--border-color": "#FFD700",
                  "--border-width": "1px",
                  "--border-style": "solid",
                } as any}
              >
                <IonIcon icon={logoGoogle} slot="start" /> เข้าสู่ระบบด้วย Google
              </IonButton>
            </div>
          </div>

          {/* Divider "หรือ" */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ height: 1, flex: 1, background: "#333" }} />
            <div style={{ color: "#aaa", fontSize: 14 }}>หรือ</div>
            <div style={{ height: 1, flex: 1, background: "#333" }} />
          </div>

          {/* ===== Card: Phone OTP ===== */}
          <div
            className="lux-card"
            style={{
              padding: 16,
              borderRadius: 18,
              border: "1px solid #333",
            }}
          >
            <IonText color="medium">
              <small>เข้าสู่ระบบด้วยเบอร์โทร (OTP)</small>
            </IonText>

            <div style={{ marginTop: 12 }}>
              <div className="sport-card" style={{ padding: "6px 14px", borderRadius: 14 }}>
                <IonInput
                  placeholder="เบอร์โทร เช่น +66812345678"
                  value={phone}
                  onIonInput={(e) => setPhone(e.detail.value as string)}
                >
                  <IonIcon icon={callOutline} slot="start" style={{ marginRight: "10px" }} />
                </IonInput>
              </div>

              <IonButton
                expand="block"
                color="medium"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                style={{ marginTop: 10, fontWeight: "bold" }}
              >
                ส่ง OTP
              </IonButton>

              <div className="sport-card" style={{ marginTop: 10, padding: "6px 14px", borderRadius: 14 }}>
                <IonInput
                  placeholder="กรอก OTP"
                  value={otp}
                  onIonInput={(e) => setOtp(e.detail.value as string)}
                />
              </div>

              <IonButton
                expand="block"
                color="success"
                onClick={handleVerifyOtp}
                style={{ marginTop: 10, fontWeight: "bold" }}
                disabled={!confirmResult || !otp}
              >
                ยืนยัน OTP
              </IonButton>
            </div>
          </div>

          {/* Footer link */}
          <IonText color="medium" style={{ marginTop: 18, display: "block", textAlign: "center" }}>
            ยังไม่มีบัญชี?{" "}
            <span style={{ color: "#FFD700", fontWeight: 700, cursor: "pointer" }} onClick={() => history.push("/register")}>
              สมัครสมาชิก
            </span>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;