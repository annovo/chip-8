import React, { useRef, useEffect, useState, useCallback } from 'react'
import './App.css'

const Canvas = ({draw, ...rest}) => {
   const [x, setX] = useState(0);
   const [y, setY] = useState(0);

   const canvasRef = useRef(null)

   const handleKey = useCallback((e) => {
      const cntx = canvasRef.current.getContext('2d');
      let dirX, dirY;
      switch(e.keyCode) {
         case 37:
            dirX = -1;
            break;
         case 39:
            dirX = 1;
            break;
         case 40:
            dirY = 1;
            break;
         case 38:
            dirY = -1;
            break;
         default:
            dirX = 0;
            dirY = 0;
      }
      if(dirX === 0 && dirY === 0) 
        return;
      
      const canvasData = cntx.getImageData(0, 0, cntx.canvas.width, cntx.canvas.height);
      const data = canvasData.data;
      if(dirX === 1) {
        for(let j = 0; j < 16; j++) {
          let idx = j*cntx.canvas.width*4;
          
          data[idx + x + 1] = 255;
          data[idx + x + 2] = 255;
  
          data[idx + (x + 4*16) + 1] = 0;
          data[idx + (x + 4*16) + 2] = 0;
        }
        setX(x + 4);
      } else if(dirX === -1) {
        for(let j = 0; j < 16; j++) {
          let idx = j*cntx.canvas.width*4;
          
          data[idx + (x + 4*16) + 1] = 255;
          data[idx + (x + 4*16) + 2] = 255;
  
          data[idx + x + 1] = 0;
          data[idx + x + 2] = 0;
        }
        setX(x - 4);
      } else if(dirY === 1) {
         setY(y + 4);
      } else if(dirY === -1) {
         for(let j = 0; j < 16; j++) {
            let idx = j*cntx.canvas.width*4;
            
            data[idx + (x + 4*16) + 1] = 255;
            data[idx + (x + 4*16) + 2] = 255;
    
            data[idx + x + 1] = 0;
            data[idx + x + 2] = 0;
          }
         setY(y - 4);
      }
      cntx.putImageData(canvasData, 0, 0);
   }, [x,y]);

   useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      draw(context);
   },[]);

   useEffect(() => {
      document.addEventListener('keydown', handleKey);

      return () => {
        document.removeEventListener('keydown', handleKey);
      }
  },[handleKey]);
  
  return (
     <div>
        <canvas ref={canvasRef} {...rest}/>
     </div>
  )
}

export default Canvas