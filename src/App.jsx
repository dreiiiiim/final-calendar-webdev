import React from 'react';
import MonthlyCalendar from './Components/MonthlyCalendar';
import Welcomepage from './Components/Welcomepage';
import AuthRedirect from './Components/AuthRedirect'; // ✅ Don't forget this!
import { HashRouter as Router } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div className='h-screen w-screen'>
      <Routes>
        <Route path='/' element={<Welcomepage />} />
        <Route path='/MonthlyCalendar' element={<MonthlyCalendar />} />
      </Routes>

      <AuthRedirect /> 
    </div>
  );
};

export default App;
