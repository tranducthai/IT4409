import { useState } from 'react';
import viteLogo from '../assets/vite.svg'; // Sử dụng logo Vite cho icon
import '../App.css';

function Login({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Đang đăng nhập với:", email, password);
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
          <h2 className="auth-title">Đăng nhập</h2>
          
          <button type="button" className="social-btn">Đăng nhập bằng Google</button>
          <button type="button" className="social-btn">Đăng nhập bằng HUST</button>

          <div className="divider">Hoặc</div>

          <form className="auth-form" onSubmit={handleLogin}>
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
            
            <div className="forgot-password">
              <a href="#">Quên mật khẩu?</a>
            </div>
            
            <button type="submit" className="auth-btn">Đăng nhập</button>
          </form>

          <div className="auth-footer">
            Chưa có tài khoản? 
            <button type="button" onClick={() => onNavigate('register')}>
              Đăng ký ngay
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
