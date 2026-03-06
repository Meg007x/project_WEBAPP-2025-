// ฟังก์ชันเช็คว่าเวลา 2 ช่วง ทับซ้อนกันหรือไม่
export const isTimeOverlap = (
  reqStart: string, reqEnd: string, // เวลาที่เรากำลังจะจอง (เช่น "17:00", "19:00")
  bookedStart: string, bookedEnd: string // เวลาที่มีคนจองไว้แล้วในระบบ
) => {
  // แปลงเวลา "HH:mm" เป็นตัวเลขนาที เพื่อให้เปรียบเทียบง่ายๆ
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const rs = toMinutes(reqStart);
  const re = toMinutes(reqEnd);
  const bs = toMinutes(bookedStart);
  const be = toMinutes(bookedEnd);

  // กฎการทับซ้อน: เวลาเริ่มของเรา < เวลาจบของเขา AND เวลาจบของเรา > เวลาเริ่มของเขา
  // (ถ้าจองต่อกันพอดี เช่น เขาจบ 17:00 เราเริ่ม 17:00 จะไม่เข้าเงื่อนไขนี้ ถือว่าจองได้!)
  return rs < be && re > bs;
};