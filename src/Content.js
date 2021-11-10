import React, { useEffect, useRef, useState } from 'react'
import Canvas from './Canvas'
import ibmLogo from './files/IBMLogo.ch8'
import spaceInvaders from './files/SpaceInvaders.ch8'
import airplane from './files/Airplane.ch8'
import astro from './files/AstroDodge.ch8'
import brick from './files/Brick.ch8'
import tank from './files/Tank.ch8'
import kaleidoscope from './files/Kaleidoscope.ch8'
import { DropdownButton, Dropdown, Button } from 'react-bootstrap'
import './App.css'
import Control from './Control'

const Content = () => {
   const [file, setFile] = useState([]);
   const [title, setTitle] = useState("Space Invaders");
   const [keyPressed, setKey] = useState();
   const inputRef = useRef(null);

   const handleSelected = async (e) => {
      switch(e.target.value) {
         case "ibmLogo":
            upload(await fetch(ibmLogo).then(r => r.blob()));
            setTitle("IBM Logo");
            break;
         case "spaceInv":
            upload(await fetch(spaceInvaders).then(r => r.blob()));
            setTitle("Space Invaders");
            break;
         case "airplane":
            upload(await fetch(airplane).then(r => r.blob()));
            setTitle("Airplane");
            break;
         case "astro":
            upload(await fetch(astro).then(r => r.blob()));
            setTitle("Astro Dodge");
            break;
         case "tank":
            upload(await fetch(tank).then(r => r.blob()));
            setTitle("Tank");
            break;
         case "brick":
            upload(await fetch(brick).then(r => r.blob()));
            setTitle("Brick");
            break;
         case "kaleidoscope":
            upload(await fetch(kaleidoscope).then(r => r.blob()));
            setTitle("Kaleidoscope");
            break;
         default:
            if (e.target && e.target.files) {
               upload(e.target.files[0]);
               setTitle("Select Game");
            }
      }
   }

   const upload = (f) => {
      if(!f)
         return;
      f.arrayBuffer().then(buffer => {  
         let data = new Uint8Array(buffer);
         setFile(data);
      }).catch(e => console.log(e));    
   }
  
   const handleInput = () => {
      inputRef.current?.click();
   }

   useEffect(() => {
      (async function() {
         upload(await fetch(spaceInvaders).then(r => r.blob()));   
      })();
   }, [])

  return (
   <>
      <div className = "header">
         <h1>CHIP-8 Emulator</h1>
      </div>
      <div className = "container">
         <div className = "container__media" > 
            <div className = "three-dimensions-card">
               <Canvas file = {file} keyPressed = {keyPressed} setKey = {setKey} />
            </div>
         </div>
         <div className = "container__content">
            <Control setKey = {setKey} />
            <div className = "control-btns">
               <div id = "uploadBtn">
                  <Button variant = "outline-secondary" onClick = {handleInput}> Upload </Button>
               </div>
               <input ref={inputRef} style = {{display: 'none'}} type="file" onChange = {handleSelected} />
               <DropdownButton id="dropdown-item-button" variant = "outline-secondary" title={title} onClick = {handleSelected} >
                     <Dropdown.Item as="button" value = "spaceInv">Space Invaders</Dropdown.Item>
                     <Dropdown.Item as="button" value = "ibmLogo">IBM logo</Dropdown.Item>
                     <Dropdown.Item as="button" value = "airplane">Airplane</Dropdown.Item>
                     <Dropdown.Item as="button" value = "astro">Astro Dodge</Dropdown.Item>
                     <Dropdown.Item as="button" value = "brick">Brick</Dropdown.Item>
                     <Dropdown.Item as="button" value = "kaleidoscope">Kaleidoscope</Dropdown.Item>
                     <Dropdown.Item as="button" value = "tank">Tank</Dropdown.Item>
               </DropdownButton>
            </div>
         </div>     
      </div>
   </>
  )
}

export default Content