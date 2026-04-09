import { useState } from 'react';
import viteLogo from '../assets/vite.svg';
import '../App.css';

function Register({ onNavigate }) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    
    console.log("Đăng ký thành công với:", { fullName, role, email, password });
    alert("Đăng ký tài khoản thành công!");
    
    // Nếu đăng kí thành công thì chuyển về trang đăng nhập
    onNavigate('login');
  };

  return (
    <div className="layout-container">
      <header className="topbar">
        <div className="topbar-brand">
          <img src={viteLogo} alt="Logo" className="topbar-logo" />
          <span className="topbar-name">frontend</span>
        </div>
      </header>
      
      <main className="main-content">
        <div className="auth-container">
          <h2 className="auth-title">Đăng ký tài khoản mới</h2>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="input-group">
              <label>Họ và tên</label>
              <input 
                type="text" 
                placeholder="Nhập họ và tên của bạn" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)} 
                required
              />
            </div>

            <div className="input-group">
              <label>Vai trò</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="student">Sinh viên</option>
                <option value="teacher">Giảng viên</option>
              </select>
            </div>

            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="Ví dụ: example@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>

            <div className="input-group">
              <label>Mật khẩu</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>
            
            <div className="input-group">
              <label>Nhập lại mật khẩu</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required
              />
            </div>
            
            <button type="submit" className="auth-btn" style={{ marginTop: '12px' }}>
              Đăng ký
            </button>
          </form>

          <div className="auth-footer">
            Đã có tài khoản? 
            <button type="button" onClick={() => onNavigate('login')}>
              Đăng nhập
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;
