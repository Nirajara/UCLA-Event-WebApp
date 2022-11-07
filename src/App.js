import logo from './logo.svg';
import './App.css';
import Post from './Post'
import Signup from './Signup'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
          <Routes>
            <Route exact path='/' element={<Signup/>}></Route>
            <Route exact path='/Post' element={<Post/>}></Route>
        </Routes>
      </div>
    </Router>
  );
}


export default App;
