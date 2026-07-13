import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Manager from './components/Manager'  
import Footer from './components/Footer'
import Login from './components/Login'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setIsLoggedIn(true);
      setUsername(currentUser);
    }
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem('currentUser', user);
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUsername('');
    setIsLoggedIn(false);
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} />
      <div className='min-h-[calc(100vh-7rem)] [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]'>
        {isLoggedIn ? <Manager username={username} /> : <Login onLogin={handleLogin} />}
      </div>
      <Footer />
    </>
  )
}

export default App

