import { useState } from "react";

const Control = ({ setKey }) => {
   const [timeOut, setTime] = useState(false);
   const handleClick = (e, key) => {
      e.preventDefault();
      setKey(key);
      if(!timeOut) {
         setTime(true);
         setTimeout(() => { setKey(null); setTime(false); }, 200);
      }
   }

   return (
      <>
         <div>
            <p className = "cntr-p">Controls</p>
         </div>
         <div className = "grid">
            <div onClick = {(e) => handleClick(e,"Digit1")} className ="box one">1</div>
            <div onClick = {(e) => handleClick(e,"Digit2")} className ="box two">2</div>
            <div onClick = {(e) => handleClick(e,"Digit3")} className ="box three">3</div>
            <div onClick = {(e) => handleClick(e,"Digit4")} className ="box four">4</div>
            <div onClick = {(e) => handleClick(e,"KeyQ")} className ="box q">Q</div>
            <div onClick = {(e) => handleClick(e,"KeyW")} className ="box w">W</div>
            <div onClick = {(e) => handleClick(e,"KeyE")} className ="box e">E</div>
            <div onClick = {(e) => handleClick(e,"KeyR")} className ="box r">R</div>
            <div onClick = {(e) => handleClick(e,"KeyA")} className ="box a">A</div>
            <div onClick = {(e) => handleClick(e,"KeyS")} className ="box s">S</div>
            <div onClick = {(e) => handleClick(e,"KeyD")} className ="box d">D</div>
            <div onClick = {(e) => handleClick(e,"KeyF")} className ="box f">F</div>
         </div>
      </>
   )
}

export default Control