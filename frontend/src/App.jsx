import { useState } from 'react';
import Login from './pages/login';
import Register from './pages/register';

function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' | 'register'

  return (
    <>
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}
      {currentPage === 'register' && <Register onNavigate={setCurrentPage} />}
    </>
  );
}

export default App;
