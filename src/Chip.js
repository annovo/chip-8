class Chip8 {
   #memory;
   #registers;
   #pc;
   #iRegister;
   #stack;
   #display;

   static #WIDTH = 64;
   static #HEIGHT = 32;
   static #KEYBOARD = ["Digit1", "Digit2", "Digit2", "Digit4",
   "KeyQ", "KeyW", "KeyE", "KeyR",
   "KeyA", "KeyS", "KeyD", "KeyF",
   "KeyZ", "KeyX", "KeyC", "KeyV"];       // scan codes for keyboard 
   static FONT = new Uint8Array([                            // default font
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

   static SHIFT = 512;                             // first 512 is missing from the memory exept for the font
   static MAX_MEM = 0x1000 - Chip8.SHIFT;

   constructor(program) {
      this.#memory = [...Chip8.FONT];
      this.#memory[Chip8.SHIFT - 1] = 0;          
      this.#memory = [...this.#memory, ...program];
      this.#pc = Chip8.SHIFT;
      this.#registers = [];
      this.initRegisters();
      this.#iRegister = 0;
      this.dTimer = 0;
      this.sTimer = 0;
      this.#stack = [];
      this.#display = [];
   }

   initRegisters() {
      for(let i = 0; i <= 0xf; i++) 
         this.#registers[i] = 0;
   }

   run(key , cntx) {
      const instr  = (this.#memory[this.#pc] << 8) | this.#memory[this.#pc + 1];
      this.#pc += 2;
      this.decode(instr, key, cntx);
   }

   decode(instruction, key, cntx) {
      const firstNibble = (instruction & 0b1111000000000000) >> 12;  // first half bit
      const secondNibble = (instruction & 0b0000111100000000) >> 8;  // second half bit
      const thirdNibble = (instruction & 0b0000000011110000) >> 4;   // third half bit
      const fourthNibble = (instruction & 0b0000000000001111);
      const secondByte = (instruction & 0b0000000011111111);         // NN
      const addr = (instruction & 0b0000111111111111);               // NNN

      switch(firstNibble) {
         case 0:
            if(secondNibble === 0 && fourthNibble === 0 && thirdNibble === 0xe){
               this.#display = [];
               this.render(cntx);
            } else if(secondNibble === 0 && fourthNibble === 0xe && thirdNibble === 0xe){
               this.#pc = this.#stack[this.#stack.length - 1];
               this.#stack = this.#stack.slice(0, this.#stack.length - 1);
            }
            break;
         case 1:
            this.#pc = addr;
            break;
         case 2:
            this.#stack =[...this.#stack, this.#pc];
            this.#pc = addr;
            break;
         case 3:
            if(this.#registers[secondNibble] === secondByte)
               this.#pc += 2;
            break;
         case 4:
            if(this.#registers[secondNibble] !== secondByte)
               this.#pc += 2;
            break;
         case 5:
            if(this.#registers[secondNibble] === this.#registers[thirdNibble])
               this.#pc += 2;
            break;
         case 6:
            this.#registers[secondNibble] = secondByte;
            break;
         case 7:
            this.#registers[secondNibble] = (this.#registers[secondNibble] + secondByte) % (1 << 8);  // in case of overflow
            break;
         case 8: 
            const vx = secondNibble;
            const vy = thirdNibble;
            switch(fourthNibble) {
               case 0:
                  this.#registers[vx] = this.#registers[vy];
                  break;
               case 1:
                  this.#registers[vx] = this.#registers[vx] | this.#registers[vy];
                  break;
               case 2:
                  this.#registers[vx] = this.#registers[vx] & this.#registers[vy];
                  break;
               case 3:
                  this.#registers[vx] = this.#registers[vx] ^ this.#registers[vy];
                  break;
               case 4:
                  const val = this.#registers[vx] + this.#registers[vy];
                  const vf = val >= (1 << 8) ? 1 : 0;    // in case of overflow set flag register to 1
                  this.#registers[vx] = val % (1 << 8);
                  this.#registers[0xf] = vf;  
                  break;
               case 5:
                  if(this.#registers[vx] >= this.#registers[vy]) {
                     this.#registers[0xf] = 1;
                     this.#registers[vx] = this.#registers[vx] - this.#registers[vy];
                  } else {
                     this.#registers[0xf] = 0;
                     this.#registers[vx] = (1 << 8) - (this.#registers[vy] - this.#registers[vx]); // in case of underflow
                  }
                  break;
               case 6:
                  // this.#registers[vx] = this.#registers[vy];      // configurable for superChip
                  this.#registers[0xf] = this.#registers[vx] & 1;
                  this.#registers[vx] = this.#registers[vx] >> 1;
                  break;
               case 7:
                  if(this.#registers[vy] >= this.#registers[vx]) {
                     this.#registers[0xf] = 1;
                     this.#registers[vx] = this.#registers[vy] - this.#registers[vx];
                  } else {
                     this.#registers[0xf] = 0;
                     this.#registers[vx] = (1 << 8) - (this.#registers[vx] - this.#registers[vy]); // in case of underflow
                  }
                  break;
               case 0xE:
                  // this.#registers[vx] = this.#registers[vy];      // configurable for superChip
                  this.#registers[0xf] = (this.#registers[vx] >> 7) & 1;
                  this.#registers[vx] = (this.#registers[vx] << 1) % (1 << 8); // in case of overflow
                  break;
               default:
                  break;
            }
            break;
         case 9:
            if(this.#registers[secondNibble] !== this.#registers[thirdNibble])
               this.#pc += 2;
            break;
         case 0xA:
            this.#iRegister = addr;
            break;
         case 0xB:
            this.#pc = addr + this.#registers[0x0];
            break;
         case 0xC:
            this.#registers[secondNibble] = Math.floor(Math.random() * (1 << 8)) & secondByte;
            break;
         case 0xD:
            this.changeDisplay(secondNibble, thirdNibble, fourthNibble);
            this.render(cntx);
            break;
         case 0xE:
            if(thirdNibble === 9 && fourthNibble === 0xe && key === Chip8.#KEYBOARD[this.#registers[secondNibble]]) {
               this.#pc += 2;
            } else if(thirdNibble === 0xa && fourthNibble === 1 && key !== Chip8.#KEYBOARD[this.#registers[secondNibble]]) {
               this.#pc += 2;
            }
            break;
         case 0xF: 
            switch(secondByte) {
               case 0x07: 
                  this.#registers[secondNibble] = this.dTimer;
                  break;
               case 0x15: 
                  this.dTimer = this.#registers[secondNibble];
                  break;
               case 0x18:
                  this.sTimer = this.#registers[secondNibble];
                  break;
               case 0x1E:
                  if((this.#registers[secondNibble] + this.#iRegister) >= Chip8.MAX_MEM) {    // overflow outside the memory
                     this.#registers[0xf] = 1;
                  }
                  this.#iRegister = (this.#iRegister + this.#registers[secondNibble]) % Chip8.MAX_MEM;
                  break;
               case 0x0A:
                  if(key && Chip8.#KEYBOARD.includes(key)) {
                     this.#registers[secondNibble] = Chip8.#KEYBOARD.indexOf(key);
                  } else  
                     this.#pc += 2;
                  break;
               case 0x29:
                  // characters 
                  this.#iRegister = (this.#registers[secondNibble] & (0b0000000000001111))*5; // take only last 4bits 
                  break;
               case 0x33:
                  const idx = this.#iRegister;
                  this.#memory[idx % Chip8.MAX_MEM] = Math.floor(this.#registers[secondNibble] / 100);
                  this.#memory[(idx + 1)% Chip8.MAX_MEM] = Math.floor(this.#registers[secondNibble] / 10) % 10;
                  this.#memory[(idx + 2)%Chip8.MAX_MEM] = this.#registers[secondNibble] % 10;
                  break;
               case 0x55:  // configurable to set iregister to the value of I + X + 1
                  for(let i = 0; i <= secondNibble; i++) {
                     this.#memory[(this.#iRegister + i)%Chip8.MAX_MEM] = this.#registers[i];
                  }
                  break;
               case 0x65:  // configurable to set iregister to the value of I + X + 1
                  for(let i = 0; i <= secondNibble; i++) {
                     this.#registers[i] = this.#memory[(this.#iRegister + i)%Chip8.MAX_MEM];
                  }
                  break;
               default:
                  break;
            }
            break;
         default:
            break;
      }
   }

   render(cntx) {
      const width = cntx.canvas.width;
      const height = cntx.canvas.height;
      const canvasData = cntx.getImageData(0, 0, width, height);
      const ratioX = width / Chip8.#WIDTH; 
      const ratioY = height / Chip8.#HEIGHT;
      
      for(let j = 0; j < height; j++) {
         for(let i = 0; i < width; i++) {
            const displayX = Math.floor(i / ratioX);
            const displayY = Math.floor(j / ratioY);
            let pixel1 = this.#display[displayY] && this.#display[displayY][displayX] ? 0 : 255;
            let point = 4*(i + width * j);
            let pixel0 = canvasData.data[point];
            let t = pixel1 - pixel0 > 0 ? 0.5 : 0.95;
            let c = pixel0 + (pixel1 - pixel0)*t;

            canvasData.data[point] = c;
            canvasData.data[point + 1] = c;
            canvasData.data[point + 2] = c;
         }
      }
      cntx.putImageData(canvasData, 0, 0);
   }

   changeDisplay(VX, VY, N) {
      let y = this.#registers[VY] & (Chip8.#HEIGHT - 1);
      let i = this.#iRegister;
      const lastRow = N + i;
      let regVF = 0; // setting flag register to 0;

      for(i, y; i < lastRow && y < Chip8.#HEIGHT; i++, y++) {
         const sprite = this.#memory[i];
         for(let j = 1 << 7, x = this.#registers[VX] & (Chip8.#WIDTH - 1); j > 0 && x < Chip8.#WIDTH; j >>= 1, x++) {  
            if(!this.#display[y])
            this.#display[y] = [];

            if((sprite & j) === 0)
               continue;

            if(this.#display[y][x])
               regVF = 1;
               this.#display[y][x] = !this.#display[y][x];
         }
      }
      this.#registers[0xf] = regVF;
   }
}
export default Chip8