import './App.css'
import Content from './Content';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import React from 'react';
function App() {
  return (
    <div>
      <React.StrictMode>
      <Content />
      <div className ="footer-basic">
        <footer>
            <div className="social">
              <a href="https://www.linkedin.com/in/anastasiia-novoselova-7b1b2a218/">
                <FontAwesomeIcon icon = {faLinkedin} />
              </a>
              <a href="https://github.com/annovo">
                <FontAwesomeIcon icon = {faGithub}/>
              </a>
            </div>
            <p className="copyright">Anastasiia Novoselova © 2021</p>
        </footer>
    </div>
    </React.StrictMode>
    </div>
  );
}

export default App;
