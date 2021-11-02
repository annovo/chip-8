import { useCallback, useEffect, useRef, useState } from "react";

//const memory = [];   // 4kb memory
const SHIFT = 512;   // first 512 is missing from the memory
//const display = []; 
const WIDTH = 64;
const HEIGHT = 32;
// let pc = 0;          // pointer to the memory addr
// let iregister = 0;
// const stack = []
// let dTimer = 0;
// let sTimer = 0;
// const registers = [];  // 16 registers


const FONT = {         // default font
   0 : [0xF0, 0x90, 0x90, 0x90, 0xF0],
   1 : [0x20, 0x60, 0x20, 0x20, 0x70],
   2 : [0xF0, 0x10, 0xF0, 0x80, 0xF0],
   3 : [0xF0, 0x10, 0xF0, 0x10, 0xF0],
   4 : [0x90, 0x90, 0xF0, 0x10, 0x10],
   5 : [0xF0, 0x80, 0xF0, 0x10, 0xF0],
   6 : [0xF0, 0x80, 0xF0, 0x90, 0xF0],
   7 : [0xF0, 0x10, 0x20, 0x40, 0x40],
   8 : [0xF0, 0x90, 0xF0, 0x90, 0xF0],
   9 : [0xF0, 0x90, 0xF0, 0x10, 0xF0],
   A : [0xF0, 0x90, 0xF0, 0x90, 0x90],
   B : [0xE0, 0x90, 0xE0, 0x90, 0xE0],
   C : [0xF0, 0x80, 0x80, 0x80, 0xF0],
   D : [0xE0, 0x90, 0x90, 0x90, 0xE0],
   E : [0xF0, 0x80, 0xF0, 0x80, 0xF0],
   F : [0xF0, 0x80, 0xF0, 0x80, 0x80],
}

const Chip = ({ file, render }) => {
   const [memory, setMemory] = useState(null);
   const [registers, setRegisters] = useState([]);
   const [display, setDisplay] = useState([]);
   const [pc, setPC] = useState(0);
   const [iRegister, setIregister] = useState(0);
   const canvasRef = useRef(null);

   const changeDisplay = useCallback((VX, VY, N) => {
      let y = registers[VY] & (HEIGHT - 1);
      let i = iRegister;
      const lastRow = N + i;
      let regVF = 0; // setting flag register to 0;
      let newDisplay = [...display];
      
      for(i, y; i < lastRow && y < HEIGHT; i++, y++) {
         const sprite = memory[i];
         console.log(sprite.toString(2));
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
      const thirdNibble = (instruction & 0b0000000011110000) >> 4;   //third half bit
      const fourthNibble = (instruction & 0b0000000000001111);
      const secondByte = (instruction & 0b0000000011111111);
      const addr = (instruction & 0b0000111111111111);
      let newReg = null;
      
      switch(firstNibble) {
         case 0:
            if(secondNibble === 0 && fourthNibble === 0 && thirdNibble === 14){
               setDisplay([]);
               render(canvasRef.current.getContext('2d'), display);
            }
            break;
         case 1:
            setPC(addr - SHIFT);
            break;
         case 2:
         case 3:
         case 4:
         case 5:
         case 6:
            newReg = registers;
            newReg[secondNibble] = secondByte;
            setRegisters(newReg);
            break;
         case 7:
            newReg = registers;
            newReg[secondNibble] = newReg[secondNibble] ? newReg[secondNibble] + secondByte : secondByte;
            setRegisters(newReg);
            break;
         case 8:
         case 9:
         case 10:
            setIregister(addr - SHIFT);
            break;
         case 11:
         case 12:
         case 13:
            changeDisplay(secondNibble, thirdNibble, fourthNibble);
            render(canvasRef.current.getContext('2d'), display, WIDTH, HEIGHT);
            break;
         case 14:
         case 15:  
         default:
            break;
      }

   }, [pc, registers, display, render, changeDisplay]);

   useEffect(() => {
      const canvas = canvasRef.current;
      const cntx = canvas.getContext('2d');
      cntx.fillStyle = '#FFFFFF';
      cntx.fillRect(0, 0, cntx.canvas.width, cntx.canvas.height);
   },[]);

   useEffect(() => {
      setMemory(file);
   }, [file]);
   
   useEffect(() => {
      const interval = setInterval(() => {
         if(memory.length < 1) {
            return;
         }
         const instr = (memory[pc] << 8) | memory[pc + 1];
         
         setPC(pc + 2);
         decode(instr);
      }, 100);   
      
      return () => clearInterval(interval);
   }, [memory, pc]);

   return(
      <>
         <canvas ref = {canvasRef} />
      </>
   );
}

export default Chip;
//export {load, decode, fetch, display, init, memory, pc};