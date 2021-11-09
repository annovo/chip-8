import React, { useState } from 'react'
import Chip from './Chip'
import ibmLogo from './files/IBMLogo.ch8'
import spaceInvaders from './files/SpaceInvaders.ch8'
import { DropdownButton, Dropdown } from 'react-bootstrap'
import './App.css'

const Canvas = () => {
   const [file, setFile] = useState([]);

   const handleSelected = async (e) => {
      switch(e.target.value) {
         case "ibmLogo":
            upload(await fetch(ibmLogo).then(r => r.blob()));
            break;
         case "spaceInv":
            upload(await fetch(spaceInvaders).then(r => r.blob()));
            break;
         default:
            break;
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
  
  return (
   <>
      <Chip file = {file} />
      <div className = "upload">
         <DropdownButton id="dropdown-item-button" title="Select a game" onClick = {handleSelected} >
            <Dropdown.Item as="button" value = "ibmLogo">IBM logo</Dropdown.Item>
            <Dropdown.Item as="button" value = "spaceInv">Space Invaders</Dropdown.Item>
         </DropdownButton>
      </div>
   </>
  )
}

export default Canvas