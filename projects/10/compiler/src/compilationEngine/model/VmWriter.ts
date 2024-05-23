class VmWriter {
  public writePush(segment: string, index: number | string): string {
    return `push ${segment} ${index}`;
  }

  public writePop(segment: string, index: number): string {
    return `pop ${segment} ${index}`;
  }

  public writeArithmetic(command: string): string {
    return command;
  }

  public writeLabel(label: string): string {
    return `label ${label}`;
  }

  public writeGoto(label: string): string {
    return `goto ${label}`;
  }

  public writeIf(label: string): string {
    return `if-goto ${label}`;
  }

  public writeCall(name: string, nArgs: number): string {
    return `call ${name} ${nArgs}`;
  }

  public writeFunction(className: string, subroutineName: string, nLocals: number): string {
    return `function ${className}.${subroutineName} ${nLocals}`;
  }

  public writeReturn(): string {
    return 'return';
  }
}

export const vmWriter = new VmWriter();
