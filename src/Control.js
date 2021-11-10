const Control = ({ setKey }) => {
   return (
      <>
         <div>
            <p className = "cntr-p">Controls</p>
         </div>
         <div className = "grid">
            <div onClick = {() => setKey("Digit1")} className ="box one">1</div>
            <div onClick = {() => setKey("Digit2")} className ="box two">2</div>
            <div onClick = {() => setKey("Digit3")} className ="box three">3</div>
            <div onClick = {() => setKey("Digit4")} className ="box four">4</div>
            <div onClick = {() => setKey("KeyQ")} className ="box q">Q</div>
            <div onClick = {() => setKey("KeyW")} className ="box w">W</div>
            <div onClick = {() => setKey("KeyE")} className ="box e">E</div>
            <div onClick = {() => setKey("KeyR")} className ="box r">R</div>
            <div onClick = {() => setKey("KeyA")} className ="box a">A</div>
            <div onClick = {() => setKey("KeyS")} className ="box s">S</div>
            <div onClick = {() => setKey("KeyD")} className ="box d">D</div>
            <div onClick = {() => setKey("KeyF")} className ="box f">F</div>
         </div>
      </>
   )
}

export default Control