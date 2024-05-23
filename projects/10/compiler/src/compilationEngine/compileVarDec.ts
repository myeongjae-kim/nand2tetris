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
): number => {
  let cursor = 0;
  const { value } = parseSingleLineXml(xmls[cursor]);

  if (value !== 'var') {
    return cursor;
  }

  print(indentation('<varDec>', indentLevel - 1));
  cursor += handleVarDecs(xmls, indentLevel, print, printVm);
  print(indentation('</varDec>', indentLevel - 1));

  return (
    cursor +
    compileVarDec(
      xmls.slice(cursor),
      indentLevel,
      classSymbolTable,
      subroutineSymbolTable,
      print,
      printVm,
    )
  );
};
