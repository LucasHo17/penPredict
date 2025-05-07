import { useState } from 'react';
import SetupForm from './components/SetupForm';
import GameBoard from './components/GameBoard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export default function App() {

  return (
    <Router>
      <Routes>
        <Route path = "/" element={<SetupForm/>}/>
        <Route path = "/game" element={<GameBoard/>}/>
      </Routes>
    </Router>
  );
}
