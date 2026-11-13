import { ArrowRight, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthFrame from '../components/AuthFrame';
import Button from '../components/Button';
import { ErrorMessage } from '../components/Feedback';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { thaiError } from '../utils/errors';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setFormData({ ...formData, [event.target.name]: event.target.value });
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (new TextEncoder().encode(formData.password).length > 72) {
      setError('รหัสผ่านยาวเกินกำหนด กรุณาลดจำนวนตัวอักษร');
      return;
    }
    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    if (result.success) navigate('/login?registered=1');
    else setError(thaiError(result.error, 'สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง'));
  };
  return (
    <AuthFrame
      title="สมัครสมาชิก"
      description="สร้างบัญชีเพื่อส่งคำขอเช่าและติดตามรายการของคุณ"
      footer={
        <>
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="font-semibold text-brand underline">
            เข้าสู่ระบบ
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} />}
        <Input
          label="ชื่อและนามสกุล"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="กรอกชื่อและนามสกุล"
          autoComplete="name"
          maxLength={100}
          required
        />
        <Input
          label="อีเมล"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="กรอกอีเมลของคุณ"
          autoComplete="email"
          required
        />
        <Input
          label="รหัสผ่าน"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="อย่างน้อย 8 ตัวอักษร"
          hint="ควรใช้ตัวอักษรและตัวเลขผสมกัน และไม่ใช้รหัสผ่านซ้ำกับบริการอื่น"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label="เบอร์โทรศัพท์ (ไม่บังคับ)"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="กรอกเบอร์โทรศัพท์"
          autoComplete="tel"
          maxLength={30}
        />
        <Button type="submit" className="!mt-6 w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังสมัครสมาชิก…
            </>
          ) : (
            <>
              สมัครสมาชิก
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthFrame>
  );
};
export default Register;
