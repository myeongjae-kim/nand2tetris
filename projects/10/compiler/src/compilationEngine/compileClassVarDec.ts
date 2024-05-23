import { indentation } from '../utils/indentation';
import { handleVarDecs } from './handleVarDecs';

export const compileClassVarDec = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  print(indentation('<classVarDec>', indentLevel - 1));
  const cursorProcessed = handleVarDecs(xmls, indentLevel, print, printVm).cursorProcessed;
  print(indentation('</classVarDec>', indentLevel - 1));

  return cursorProcessed;
};
