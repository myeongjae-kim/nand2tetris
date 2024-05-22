import { indentation } from '../utils/indentation';
import { handleVarDecs } from './handleVarDecs';

export const compileVarDec = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  print(indentation('<varDec>', indentLevel - 1));
  const cursorProcessed = handleVarDecs(xmls, indentLevel, print, printVm);
  print(indentation('</varDec>', indentLevel - 1));

  return cursorProcessed;
};
