import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import ConfirmationPage from './pages/ConfirmationPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'registration' | 'confirmation'>('landing');
  const [userData, setUserData] = useState({ name: '', phone: '', email: '' });

  const handleNavigateToRegistration = () => {
    setCurrentPage('registration');
  };

  const handleRegistrationComplete = (data: { name: string; phone: string; email: string }) => {
    setUserData(data);
    setCurrentPage('confirmation');
  };

  return (
    <>
      {currentPage === 'landing' && <LandingPage onNavigate={handleNavigateToRegistration} />}
      {currentPage === 'registration' && <RegistrationPage onComplete={handleRegistrationComplete} />}
      {currentPage === 'confirmation' && <ConfirmationPage userData={userData} />}
    </>
  );
}

export default App;
