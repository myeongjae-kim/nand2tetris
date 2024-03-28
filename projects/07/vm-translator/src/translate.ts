export type TranslateOptions = {
  jumpCount: number;
  setJumpCount: (jc: number) => void;
};

const indent = '   ';
const fixIndent = (code: string) => {
  return code
    .split('\n')
    .map((eachLine) => {
      if (eachLine.trim().length === 0) {
        return '';
      }

      if (eachLine.startsWith('(') || eachLine.startsWith('//') || eachLine.startsWith(indent)) {
        return eachLine;
      }

      return indent + eachLine;
    })
    .join('\n');
};

export const translate = (code: string, options: TranslateOptions): string => {
  const _translate = (code: string, options: TranslateOptions): string => {
    if (code.includes('\n')) {
      throw new Error('Not supported');
    }

    if (code.startsWith('push constant ')) {
      const value = code.split('push constant ')[1];

      return `
  // push constant ${value}
@${value}
D=A
@SP
A=M
M=D
// SP++
@SP
M=M+1
  `.trim();
    }

    if (code === 'add') {
      return `// add
// pop to D
@SP
M=M-1
A=M
D=M

// pop to A
@SP
M=M-1
A=M

// add
D=D+M

// push
@SP
A=M
M=D
// SP++
@SP
M=M+1`;
    }

    if (code === 'sub') {
      return `// sub
// pop to D
@SP
M=M-1
A=M
D=M

// pop to A
@SP
M=M-1
A=M

// sub
D=M-D

// push
@SP
A=M
M=D
// SP++
@SP
M=M+1`;
    }

    if (code === 'eq') {
      const asm = `// eq
// pop
   @SP
   M=M-1
   A=M
   D=M
   
// pop
   @SP
   M=M-1
   A=M
   
// eq
   D=M-D
   @TRUE${options.jumpCount}
   D;JEQ

   @SP
   A=M
   M=0
   
   @END${options.jumpCount}
   0;JEQ
   
(TRUE${options.jumpCount})
   @0
   A=A-1
   D=A
   @SP
   A=M
   M=D
   
   @SP
   A=M
   M=D
// SP++
(END${options.jumpCount})
   @SP
   M=M+1
   `.trim();

      options.setJumpCount(options.jumpCount + 1);
      return asm;
    }

    if (code === 'lt') {
      const asm = `// lt
// pop
   @SP
   M=M-1
   A=M
   D=M
   
// pop
   @SP
   M=M-1
   A=M
   
// lt
   D=M-D
   @TRUE${options.jumpCount}
   D;JLT

   @SP
   A=M
   M=0
   
   @END${options.jumpCount}
   0;JEQ
   
(TRUE${options.jumpCount})
   @0
   A=A-1
   D=A
   @SP
   A=M
   M=D
   
   @SP
   A=M
   M=D
// SP++
(END${options.jumpCount})
   @SP
   M=M+1
   `.trim();

      options.setJumpCount(options.jumpCount + 1);
      return asm;
    }

    if (code === 'gt') {
      const asm = `// gt
// pop
   @SP
   M=M-1
   A=M
   D=M
   
// pop
   @SP
   M=M-1
   A=M
   
// gt
   D=M-D
   @TRUE${options.jumpCount}
   D;JGT

   @SP
   A=M
   M=0
   
   @END${options.jumpCount}
   0;JEQ
   
(TRUE${options.jumpCount})
   @0
   A=A-1
   D=A
   @SP
   A=M
   M=D
   
   @SP
   A=M
   M=D
// SP++
(END${options.jumpCount})
   @SP
   M=M+1
   `.trim();

      options.setJumpCount(options.jumpCount + 1);
      return asm;
    }

    if (code === 'neg') {
      const asm = `// neg
// pop
   @SP
   M=M-1
   A=M
   D=M

// neg
   @0
   D=A-D

// push D to stack
   @SP
   A=M
   M=D
// SP++
   @SP
   M=M+1`.trim();

      options.setJumpCount(options.jumpCount + 1);
      return asm;
    }

    if (code === 'and') {
      return `// and
// pop to D
@SP
M=M-1
A=M
D=M

// pop to A
@SP
M=M-1
A=M

// and
D=M&D

// push
@SP
A=M
M=D
// SP++
@SP
M=M+1`;
    }

    throw new Error('Not implemented');
  };

  return fixIndent(_translate(code, options));
};