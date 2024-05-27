import { indentation } from '../utils/indentation';
import { handleVarDecs } from './handleVarDecs';
import { ClassSymbolTable } from './model/ClassSymbolTable';
import { SymbolKind } from './model/SymbolTable';

export const compileClassVarDec = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  symbolKind: SymbolKind,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  print(indentation('<classVarDec>', indentLevel - 1));
  const cursorProcessed = handleVarDecs(
    xmls,
    indentLevel,
    classSymbolTable,
    symbolKind,
    print,
    printVm,
  ).cursorProcessed;
  print(indentation('</classVarDec>', indentLevel - 1));

  return cursorProcessed;
};
