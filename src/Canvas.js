import React, { useState } from 'react'
import Chip from './Chip'
import './App.css'

const Canvas = () => {
   // const [x, setX] = useState(0);
   // const [y, setY] = useState(0);
   const [file, setFile] = useState([]);
   const [message, setMessage] = useState("");
   const [visible, setVisible] = useState();

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

   // const handleKey = useCallback((e) => {
   //    const cntx = canvasRef.current.getContext('2d');
   //    let dirX, dirY;
   //    switch(e.keyCode) {
   //       case 37:
   //          dirX = -1;
   //          break;
   //       case 39:
   //          dirX = 1;
   //          break;
   //       case 40:
   //          dirY = 1;
   //          break;
   //       case 38: //ArrowUp
   //          dirY = -1;
   //          break;
   //       default:
   //          dirX = 0;
   //          dirY = 0;
   //    }
   //    if(dirX === 0 && dirY === 0) 
   //      return;
      
   //    const canvasData = cntx.getImageData(0, 0, cntx.canvas.width, cntx.canvas.height);
   //    const data = canvasData.data;
   //    const width = cntx.canvas.width*4;
   //    if(dirX === 1) {
   //      for(let j = 0; j <= 16; j++) {
   //        let idx = (y+j)*width;
          
   //        data[idx + x + 1] = 255;
   //        data[idx + x + 2] = 255;
  
   //        data[idx + (x + 4*17) + 1] = 0;
   //        data[idx + (x + 4*17) + 2] = 0;
   //      }
   //      setX(x + 4);
   //    } else if(dirX === -1) {
   //      for(let j = 0; j <= 16; j++) {
   //        let idx = (y+j)*width;
          
   //        data[idx + (x + 4*17) + 1] = 255;
   //        data[idx + (x + 4*17) + 2] = 255;
  
   //        data[idx + x + 1] = 0;
   //        data[idx + x + 2] = 0;
   //      }
   //      setX(x - 4);
   //    } else if(dirY === -1) {
   //       for(let j = 0; j <= 16*4; j+=4) {
   //          let idx = (x+j);
   //          data[idx + (y + 16)*width + 1] = 255;
   //          data[idx + (y + 16)*width + 2] = 255;
    
   //          data[idx + (y - 1) * width + 1] = 0;
   //          data[idx + (y - 1) * width + 2] = 0;
   //       }
   //       setY(y - 1);
   //    } else if(dirY === 1) {
   //       for(let j = 0; j <= 16*4; j+=4) {
   //          let idx = (x+j);
   //          data[idx + y*width + 1] = 255;
   //          data[idx + y*width + 2] = 255;
    
   //          data[idx + (y + 16 + 1) * width + 1] = 0;
   //          data[idx + (y + 16 + 1) * width + 2] = 0;
   //       }
   //       setY(y + 1);
   //    }
   //    cntx.putImageData(canvasData, 0, 0);
   // }, [x,y]);

   const uploadGame = (e) => {
      const newFile = e.target.files[0];
      if(newFile == null)
         return;
      setVisible(true);
      newFile.arrayBuffer().then(buffer => {  // need to check if valid file
         let data = new Uint8Array(buffer);
         setFile(data);
      }).catch(e => console.log(e));
      setMessage(newFile.name + " uploaded");
      setTimeout(() => {
         setVisible(false);
         setMessage("");
      }, 3000);
   };

//    useEffect(() => {
//       document.addEventListener('keydown', handleKey);

//       return () => {
//         document.removeEventListener('keydown', handleKey);
//       }
//   },[handleKey]);
  
  return (
   <>
      <Chip file = {file} render = {render} />
      <div className = "upload">
         <input type = "file" onChange = {(e) => uploadGame(e)}/>
         <span style = {{visibility: visible ? 'visible' : 'hidden'}}>{message}</span>
      </div>
   </>
  )
}

export default Canvas