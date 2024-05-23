import { indentation } from '../utils/indentation';
import { handleVarDecs } from './handleVarDecs';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { ClassSymbolTable } from './model/ClassSymbolTable';
import { SubroutineSymbolTable } from './model/SubroutineSymbolTable';

export const compileVarDec = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): {
  cursorProcessed: number;
  totalVarDecs: number;
} => {
  let cursor = 0;
  const { value } = parseSingleLineXml(xmls[cursor]);

  if (value !== 'var') {
    return {
      cursorProcessed: cursor,
      totalVarDecs: 0,
    };
  }

  print(indentation('<varDec>', indentLevel - 1));
  const eachVarDecResult = handleVarDecs(xmls, indentLevel, print, printVm);
  cursor += eachVarDecResult.cursorProcessed;
  print(indentation('</varDec>', indentLevel - 1));

  const otherVarDecsResult = compileVarDec(
    xmls.slice(cursor),
    indentLevel,
    classSymbolTable,
    subroutineSymbolTable,
    print,
    printVm,
  );

  return {
    cursorProcessed: cursor + otherVarDecsResult.cursorProcessed,
    totalVarDecs: eachVarDecResult.totalVarDecs + otherVarDecsResult.totalVarDecs,
  };
};
