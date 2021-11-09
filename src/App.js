import './App.css'
import Canvas from './Canvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
function App() {
  return (
    <div>
      <Canvas />
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
    </div>
  );
}

export default App;
