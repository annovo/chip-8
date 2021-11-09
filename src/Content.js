import React, { useEffect, useRef, useState } from 'react'
import Chip from './Canvas'
import ibmLogo from './files/IBMLogo.ch8'
import spaceInvaders from './files/SpaceInvaders.ch8'
import { DropdownButton, Dropdown, Button } from 'react-bootstrap'
import './App.css'

const Canvas = () => {
   const [file, setFile] = useState([]);
   const [title, setTitle] = useState("Space Invaders");
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
               <Chip file = {file} />
            </div>
         </div>
         <div className = "container__content">
            <div id = "uploadBtn">
               <Button variant = "outline-secondary" onClick = {handleInput}> Upload </Button>
            </div>
            <input ref={inputRef} style = {{display: 'none'}} type="file" onChange = {handleSelected} />
            <DropdownButton id="dropdown-item-button" variant = "outline-secondary" title={title} onClick = {handleSelected} >
                  <Dropdown.Item as="button" value = "ibmLogo">IBM logo</Dropdown.Item>
                  <Dropdown.Item as="button" value = "spaceInv">Space Invaders</Dropdown.Item>
            </DropdownButton>
         </div>     
      </div>
   </>
  )
}

export default Canvas