import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthFrame from '../components/AuthFrame';
import Button from '../components/Button';
import { ErrorMessage } from '../components/Feedback';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { thaiError } from '../utils/errors';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate('/account');
    else setError(thaiError(result.error, 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง'));
  };
  return (
    <AuthFrame
      title="เข้าสู่ระบบ"
      description="ยินดีต้อนรับกลับมา กรอกข้อมูลเพื่อเข้าใช้งาน"
      footer={
        <>
          ยังไม่มีบัญชี?{' '}
          <Link className="font-semibold text-brand underline" to="/register">
            สมัครสมาชิก
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {searchParams.get('registered') === '1' && (
          <p role="status" className="notice notice-info">
            สมัครสมาชิกเรียบร้อยแล้ว เข้าสู่ระบบเพื่อเริ่มใช้งาน
          </p>
        )}
        {error && <ErrorMessage message={error} />}
        <Input
          label="อีเมล"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="กรอกอีเมลของคุณ"
          autoComplete="username"
          required
        />
        <div className="relative">
          <Input
            label="รหัสผ่าน"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="!pr-14"
            placeholder="กรอกรหัสผ่าน"
            autoComplete="current-password"
            required
          />
          <button
            className="absolute bottom-0.5 right-1 flex h-11 w-11 items-center justify-center rounded-xl text-muted"
            type="button"
            aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังเข้าสู่ระบบ…
            </>
          ) : (
            <>
              เข้าสู่ระบบ
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthFrame>
  );
};
export default Login;
