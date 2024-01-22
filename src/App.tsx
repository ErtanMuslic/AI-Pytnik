import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeView from './views/HomeView.jsx'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/"  Component={HomeView} />
      </Routes>
    </Router>
  );
};

export default App;
