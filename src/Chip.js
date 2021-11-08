import { useCallback, useEffect, useRef, useState } from "react";

const WIDTH = 64;
const HEIGHT = 32;
const KEYBOARD = ["Digit1", "Digit2", "Digit2", "Digit4",
   "KeyQ", "KeyW", "KeyE", "KeyR",
   "KeyA", "KeyS", "KeyD", "KeyF",
   "KeyZ", "KeyX", "KeyC", "KeyV"];       // scan codes for keyboard 
const FONT = new Uint8Array([                            // default font
   0xF0, 0x90, 0x90, 0x90, 0xF0,
   0x20, 0x60, 0x20, 0x20, 0x70,
   0xF0, 0x10, 0xF0, 0x80, 0xF0,
   0xF0, 0x10, 0xF0, 0x10, 0xF0,
   0x90, 0x90, 0xF0, 0x10, 0x10,
   0xF0, 0x80, 0xF0, 0x10, 0xF0,
   0xF0, 0x80, 0xF0, 0x90, 0xF0,
   0xF0, 0x10, 0x20, 0x40, 0x40,
   0xF0, 0x90, 0xF0, 0x90, 0xF0,
   0xF0, 0x90, 0xF0, 0x10, 0xF0,
   0xF0, 0x90, 0xF0, 0x90, 0x90,
   0xE0, 0x90, 0xE0, 0x90, 0xE0,
   0xF0, 0x80, 0x80, 0x80, 0xF0,
   0xE0, 0x90, 0x90, 0x90, 0xE0,
   0xF0, 0x80, 0xF0, 0x80, 0xF0,
   0xF0, 0x80, 0xF0, 0x80, 0x80
]);

const SHIFT = 512 - FONT.length;                        // first 512 is missing from the memory exept for the font
const Chip = ({ file, render }) => {
   const [memory, setMemory] = useState([...FONT]);
   const [registers, setRegisters] = useState([]);
   const [display, setDisplay] = useState([]);
   const [pc, setPC] = useState({counter: FONT.length, stack: []});
   const [iRegister, setIregister] = useState(0);
   const [key, setKey] = useState();
   const [dTimer, setDTimer] = useState(0);
   const [sTimer, setSTimer] = useState(0);
   const [beep, setBeep] = useState();
   const canvasRef = useRef(null);

   const changeDisplay = useCallback((VX, VY, N) => {
      let y = registers[VY] & (HEIGHT - 1);
      let i = iRegister - SHIFT;
      const lastRow = N + i;
      let regVF = 0; // setting flag register to 0;
      let newDisplay = [...display];

      for(i, y; i < lastRow && y < HEIGHT; i++, y++) {
         const sprite = memory[i];
         for(let j = 1 << 7, x = registers[VX] & (WIDTH - 1); j > 0 && x < WIDTH; j >>= 1, x++) {  
            if(!newDisplay[y])
               newDisplay[y] = [];

            if((sprite & j) === 0)
               continue;

            if(newDisplay[y][x])
               regVF = 1;
            newDisplay[y][x] = !newDisplay[y][x];
         }
      }
      
      setDisplay(newDisplay);
      setRegisters([...registers.slice(0, 0xf), regVF]);
   },[display, iRegister, memory, registers]);

   const decode = useCallback((instruction) => {
      const firstNibble = (instruction & 0b1111000000000000) >> 12;  // first half bit
      const secondNibble = (instruction & 0b0000111100000000) >> 8;  // second half bit
      const thirdNibble = (instruction & 0b0000000011110000) >> 4;   // third half bit
      const fourthNibble = (instruction & 0b0000000000001111);
      const secondByte = (instruction & 0b0000000011111111);         // NN
      const addr = (instruction & 0b0000111111111111);               // NNN
      let newReg = [...registers];
      
      switch(firstNibble) {
         case 0:
            if(secondNibble === 0 && fourthNibble === 0 && thirdNibble === 0xe){
               setDisplay([]);
               render(canvasRef.current.getContext('2d'), display);
            } else if(secondNibble === 0 && fourthNibble === 0xe && thirdNibble === 0xe){
               setPC(pc => ({
                  counter: pc.stack[pc.stack.length - 1], 
                  stack: [...pc.stack.slice(0, pc.stack.length - 1)]
               }));
            }
            break;
         case 1:
            setPC(p => ({ ...p, counter : addr - SHIFT}));
            break;
         case 2:
            setPC(pc => ({
               stack: [...pc.stack, pc.counter],
               counter: addr - SHIFT 
            }));
            break;
         case 3:
            if(registers[secondNibble] === secondByte)
               setPC(p => ({...p, counter: p.counter + 2}));
            break;
         case 4:
            if(registers[secondNibble] !== secondByte)
               setPC(p => ({...p, counter: p.counter + 2}));
            break;
         case 5:
            if(registers[secondNibble] === registers[thirdNibble])
               setPC(p => ({...p, counter: p.counter + 2}));
            break;
         case 6:
            newReg[secondNibble] = secondByte;
            setRegisters(newReg);
            break;
         case 7:
            newReg[secondNibble] = (newReg[secondNibble] + secondByte) % (1 << 8);  // in case of overflow
            setRegisters(newReg);
            break;
         case 8: 
            const vx = secondNibble;
            const vy = thirdNibble;
            switch(fourthNibble) {
               case 0:
                  newReg[vx] = newReg[vy];
                  break;
               case 1:
                  newReg[vx] = newReg[vx] | newReg[vy];
                  break;
               case 2:
                  newReg[vx] = newReg[vx] & newReg[vy];
                  break;
               case 3:
                  newReg[vx] = newReg[vx] ^ newReg[vy];
                  break;
               case 4:
                  const val = newReg[vx] + newReg[vy];
                  const vf = val >= (1 << 8) ? 1 : 0;    // in case of overflow set flag register to 1
                  newReg[vx] = val % (1 << 8);
                  newReg[0xf] = vf;          
                  break;
               case 5:
                  if(newReg[vx] >= newReg[vy]) {
                     newReg[0xf] = 1;
                     newReg[vx] = newReg[vx] - newReg[vy];
                  } else {
                     newReg[0xf] = 0;
                     newReg[vx] = (1 << 8) - (newReg[vy] - newReg[vx]); // in case of underflow
                  }
                  break;
               case 6:
                  // newReg[vx] = newReg[vy];      // configurable for superChip
                  newReg[0xf] = newReg[vx] & 1;
                  newReg[vx] = newReg[vx] >> 1;
                  break;
               case 7:
                  if(newReg[vy] >= newReg[vx]) {
                     newReg[0xf] = 1;
                     newReg[vx] = newReg[vy] - newReg[vx];
                  } else {
                     newReg[0xf] = 0;
                     newReg[vx] = (1 << 8) - (newReg[vx] - newReg[vy]); // in case of underflow
                  }
                  break;
               case 0xE:
                  // newReg[vx] = newReg[vy];      // configurable for superChip
                  newReg[0xf] = (newReg[vx] >> 7) & 1;
                  newReg[vx] = (newReg[vx] << 1) % (1 << 8); // in case of overflow
                  break;
               default:
                  break;
            }
            setRegisters(newReg);
            break;
         case 9:
            if(registers[secondNibble] !== registers[thirdNibble])
               setPC(p => ({...p, counter: p.counter + 2}));
            break;
         case 0xA:
            setIregister(addr);
            break;
         case 0xB:
            setPC(p => ({...p, counter: (addr + registers[0x0]) - SHIFT }));
            break;
         case 0xC:
            newReg[secondNibble] = Math.floor(Math.random() * (1 << 8)) & secondByte;
            setRegisters(newReg);
            break;
         case 0xD:
            changeDisplay(secondNibble, thirdNibble, fourthNibble);
            render(canvasRef.current.getContext('2d'), display, WIDTH, HEIGHT);
            break;
         case 0xE:
            if(thirdNibble === 9 && fourthNibble === 0xe && key === KEYBOARD[registers[secondNibble]]) {
               setPC(p => ({...p, counter: p.counter + 2}));
            } else if(thirdNibble === 0xa && fourthNibble === 1 && key !== KEYBOARD[registers[secondNibble]]) {
               setPC(p => ({...p, counter: p.counter + 2}));
            }
            break;
         case 0xF: 
            let newMem; 
            switch(secondByte) {
               case 0x07: 
                  newReg[secondNibble] = dTimer;
                  setRegisters(newReg);
                  break;
               case 0x15: 
                  setDTimer(registers[secondNibble]);
                  break;
               case 0x18:
                  setSTimer(registers[secondNibble]);
                  break;
               case 0x1E:
                  if((registers[secondNibble] + iRegister) >= 0x1000) {    // overflow outside the memory
                     newReg[0xf] = 1;
                  }
                  setIregister((iRegister + registers[secondNibble]) % 0x1000);
                  break;
               case 0x0A:
                  if(key && KEYBOARD.includes(key)) {
                     newReg[secondNibble] = KEYBOARD.indexOf(key);
                     setRegisters(newReg);
                  } else  
                     setPC(p => ({...p, counter: p.counter + 2}));
                  break;
               case 0x29:
                  // characters 
                  setIregister((registers[secondNibble] & (0b0000000000001111))*5); // take only last 4bits 
                  break;
               case 0x33:
                  newMem = [...memory];
                  const idx = iRegister - SHIFT;
                  newMem[idx] = Math.floor(registers[secondNibble] / 100);
                  newMem[idx + 1] = Math.floor(registers[secondNibble] / 10) % 10;
                  newMem[idx + 2] =registers[secondNibble] % 10;
                  setMemory(newMem);
                  break;
               case 0x55:  // configurable to set iregister to the value of I + X + 1
                  newMem = [...memory];
                  for(let i = 0; i <= secondNibble; i++) {
                     newMem[iRegister - SHIFT + i] = registers[i];
                  }
                  setMemory(newMem);
                  break;
               case 0x65:  // configurable to set iregister to the value of I + X + 1
                  for(let i = 0; i <= secondNibble; i++) {
                     newReg[i] = memory[iRegister - SHIFT + i];
                  }
                  setRegisters(newReg);
                  break;
               default:
                  break;
            }
            break;
         default:
            break;
      }
   }, [dTimer, iRegister, registers, display, key, memory, render, changeDisplay]);

   useEffect(() => {
      const canvas = canvasRef.current;
      const cntx = canvas.getContext('2d');
      cntx.fillStyle = '#FFFFFF';
      cntx.fillRect(0, 0, cntx.canvas.width, cntx.canvas.height);
      setBeep(new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="));  
   },[]);

   useEffect(() => {
      setMemory([...FONT, ...file]);
      setDisplay([]);
      setPC({counter: FONT.length, stack: []});
      let newReg = [];
      for(let i = 0; i <= 0xf; i++) 
         newReg[i] = 0;
      setRegisters(newReg);
   }, [file]);
   
   useEffect(() => {
      document.addEventListener('keydown', (e) => setKey(e.code));

      return () => {
         document.removeEventListener('keydown', () => setKey(null));
      }
   },[]);

   useEffect(() => {
      const interval = setInterval(() => {
         if(memory.length <= FONT.length) {
            return;
         }
         const instr = (memory[pc.counter] << 8) | memory[pc.counter + 1];
         setPC(p => ({...p, counter: p.counter + 2}));
         decode(instr);
      }, 2);   
      
      return () => clearInterval(interval);
   }, [memory, pc, decode]);

   useEffect(() => {
      const intervalTimer = setInterval(() => {
         if(dTimer > 0) 
            setDTimer(dTimer - 1);
         
         if(sTimer > 0) {
            setSTimer(sTimer - 1);
            beep.play();
         }

         if(display)
            render(canvasRef.current.getContext('2d'), display, WIDTH, HEIGHT);
      }, 17);   
      
      return () => clearInterval(intervalTimer);
   }, [dTimer, sTimer, beep, display, render]);

   return(
      <>
         <canvas ref = {canvasRef} />
      </>
   );
}

export default Chip;