import React, { useState } from 'react'
import Chip from './Chip'
import ibmLogo from './files/IBMLogo.ch8'
import spaceInvaders from './files/SpaceInvaders.ch8'
import './App.css'

const Canvas = () => {
   const [file, setFile] = useState([]);
   const [selected, setSelected] = useState();

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
            let pixel = display[displayY] && display[displayY][displayX] ? 0 : 255;
            let point = 4*(i + width * j);
            
            canvasData.data[point] = pixel;
            canvasData.data[point + 1] = pixel;
            canvasData.data[point + 2] = pixel;
         }
      }
      cntx.putImageData(canvasData, 0, 0);
   }

   const handleSelected = async (e) => {
      setSelected(e.target.value);
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
         <select value = {selected} onChange = {handleSelected}>
            <option value = "none" >Select a game</option>
            <option value = "ibmLogo" >IBM logo</option>
            <option value = "spaceInv">Space Invaders</option>
         </select>
      </div>
   </>
  )
}

export default Canvas