import React, { useState } from 'react'
import Chip from './Chip'
import ibmLogo from './files/IBMLogo.ch8'
import spaceInvaders from './files/SpaceInvaders.ch8'
import { DropdownButton, Dropdown } from 'react-bootstrap'
import './App.css'

const Canvas = () => {
   const [file, setFile] = useState([]);

   const render = (cntx, display, dW, dH) => {
      const width = cntx.canvas.width;
      const height = cntx.canvas.height;
      const canvasData = cntx.getImageData(0, 0, width, height);
      const ratioX = width / dW; 
      const ratioY = height / dH;
      
      for(let j = 0; j < height; j++) {
         for(let i = 0; i < width; i++) {
            const displayX = Math.floor(i / ratioX);
            const displayY = Math.floor(j / ratioY);
            let pixel1 = display[displayY] && display[displayY][displayX] ? 0 : 255;
            let point = 4*(i + width * j);
            let pixel0 = canvasData.data[point];
            let t = pixel1 - pixel0 > 0 ? 0.2 : 0.7;
            let c = pixel0 + (pixel1 - pixel0)*t;

            canvasData.data[point] = c;
            canvasData.data[point + 1] = c;
            canvasData.data[point + 2] = c;
         }
      }
      cntx.putImageData(canvasData, 0, 0);
   }

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
      <Chip file = {file} render = {render} />
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