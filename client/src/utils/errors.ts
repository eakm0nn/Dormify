import axios from 'axios';
const messages: Record<string, string> = {
  'Food service must be a boolean': 'กรุณาระบุว่าหอพักมีบริการอาหารหรือไม่',
  'ID must be a positive integer': 'รหัสรายการต้องเป็นจำนวนเต็มบวก',
  'Start date must be valid': 'กรุณาระบุวันเริ่มต้นให้ถูกต้อง',
  'End date must be valid': 'กรุณาระบุวันสิ้นสุดให้ถูกต้อง',
  'End date must be after start date': 'วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น',
  'Price must be a non-negative number': 'ราคาต้องเป็นตัวเลขตั้งแต่ศูนย์ขึ้นไป',
  'Capacity must be a positive integer': 'จำนวนผู้พักต้องเป็นจำนวนเต็มตั้งแต่หนึ่งคนขึ้นไป',
  'Room number is required': 'กรุณาระบุเลขห้อง',
  'Room number already exists in this property': 'เลขห้องนี้มีอยู่ในหอพักแล้ว กรุณาใช้เลขห้องอื่น',
  'Booking changed. Refresh and try again': 'สถานะรายการเปลี่ยนแล้ว กรุณาตรวจสอบข้อมูลล่าสุดแล้วลองอีกครั้ง',
  'Invalid credentials': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง',
  'User already exists': 'อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น',
  'Please include a valid email': 'กรุณากรอกอีเมลให้ถูกต้อง',
  'Password must be at least 8 characters': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
  'Password must be at most 72 UTF-8 bytes': 'รหัสผ่านยาวเกินกำหนด กรุณาลดจำนวนตัวอักษร',
  'Name is required': 'กรุณากรอกชื่อและนามสกุล',
  'Public registration only supports USER': 'สมัครสมาชิกได้เฉพาะบัญชีผู้ใช้งานทั่วไป',
  'This account role requires administrator review': 'บัญชีนี้ต้องให้ผู้ดูแลตรวจสอบสิทธิ์ก่อนใช้งาน',
  'Authentication required': 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
  'Invalid or expired session': 'การเข้าสู่ระบบหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',
  'Invalid session': 'กรุณาเข้าสู่ระบบอีกครั้ง',
  'Not authorized': 'คุณไม่มีสิทธิ์ใช้งานส่วนนี้',
  'Room not available': 'ห้องนี้ไม่ว่างแล้ว กรุณาเลือกห้องอื่น',
  'Invalid booking status': 'สถานะรายการเช่าไม่ถูกต้อง',
  'Booking not found': 'ไม่พบรายการเช่านี้',
  'Property not found': 'ไม่พบข้อมูลหอพัก',
  'Only users can book rooms': 'เฉพาะผู้ใช้งานทั่วไปเท่านั้นที่ส่งคำขอเช่าได้',
  'Login failed': 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองอีกครั้ง',
  'Registration failed': 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองอีกครั้ง',
  'Sign out failed. Please try again.': 'ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง',
};
export const thaiError = (error: unknown, fallback = 'ไม่สามารถดำเนินการได้ กรุณาลองอีกครั้ง') => {
  const response = axios.isAxiosError<{ error?: string }>(error) ? error.response : undefined;
  const message = typeof error === 'string' ? error : response?.data?.error;
  if (message && messages[message]) return messages[message];
  if (message && /[ก-๙]/.test(message)) return message;
  if (response?.status === 401) return 'กรุณาเข้าสู่ระบบอีกครั้ง';
  if (response?.status === 403) return 'คุณไม่มีสิทธิ์ใช้งานส่วนนี้';
  if (axios.isAxiosError(error) && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED'))
    return 'เชื่อมต่อระบบไม่ได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง';
  return fallback;
};
