import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import TeamPage from './components/TeamPage';
import logo from './logo.png';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white text-black p-4 shadow-md">
          <div className="container flex mx-auto items-center space-x-2">
            <img src={logo} className='w-10 l-10' alt="Logo" />
            <h1 className="text-2xl font-bold">Bullpen Budgets</h1>
          </div>
        </header>
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/team" element={<TeamPage />} />
          </Routes>
        </main>
        <footer className="bg-gray-200 p-4 text-center mt-8">
          <p>&copy; {new Date().getFullYear()} Bullpen Budgets</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;