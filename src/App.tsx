import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import ConfirmationPage from './pages/ConfirmationPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'registration' | 'confirmation'>('landing');
  const [userData, setUserData] = useState({ name: '', phone: '', email: '' });

  const handleNavigateToHome = () => {
    setCurrentPage('landing');
  };

  const handleNavigateToRegistration = () => {
    setCurrentPage('registration');
  };

  const handleRegistrationComplete = (data: { name: string; phone: string; email: string }) => {
    setUserData(data);
    setCurrentPage('confirmation');
  };

  return (
    <>
      {currentPage === 'landing' && <LandingPage onNavigate={handleNavigateToRegistration} onNavigateToHome={handleNavigateToHome} />}
      {currentPage === 'registration' && <RegistrationPage onComplete={handleRegistrationComplete} onNavigateToHome={handleNavigateToHome} />}
      {currentPage === 'confirmation' && <ConfirmationPage userData={userData} onNavigateToHome={handleNavigateToHome} />}
    </>
  );
}

export default App;
