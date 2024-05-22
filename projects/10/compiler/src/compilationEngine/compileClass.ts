import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileClassVarDec } from './compileClassVarDec';
import { compileSubroutineDec } from './compileSubroutineDec';
import { ClassSymbolTable } from './model/ClassSymbolTable';

export const compileClass = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): void => {
  if (xmls.length === 0) {
    throw Error('Invalid XML.');
  }
  print(indentation('<class>', indentLevel - 1));

  let cursor = 0;
  const keywordXml = xmls[cursor++];
  const identifierXml = xmls[cursor++];
  const curlyBraceStartXml = xmls[cursor++];

  print(indentation(keywordXml, indentLevel));
  print(indentation(identifierXml, indentLevel));
  print(indentation(curlyBraceStartXml, indentLevel));

  const className = parseSingleLineXml(identifierXml).value; // class name
  const classSymbolTable = new ClassSymbolTable(className);

  cursor += _compileClass(xmls.slice(cursor), indentLevel, classSymbolTable, print, printVm);

  print(indentation(xmls[cursor++], indentLevel)); // }
  print(indentation('</class>', indentLevel - 1));

  return;
};

const _compileClass = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  let cursor = 0;
  let nextXml = xmls[cursor];

  if (!nextXml) {
    return cursor;
  }

  const { value } = parseSingleLineXml(nextXml);

  if (['static', 'field'].includes(value)) {
    cursor += compileClassVarDec(xmls.slice(cursor), indentLevel + 1, print, printVm);
  }
  if (['constructor', 'function', 'method'].includes(value)) {
    cursor += compileSubroutineDec(
      xmls.slice(cursor),
      indentLevel + 1,
      classSymbolTable,
      print,
      printVm,
    );
  }

  nextXml = xmls[cursor];
  if (!nextXml || parseSingleLineXml(nextXml).value === '}') {
    return cursor;
  }

  const cursorProcessed = _compileClass(
    xmls.slice(cursor),
    indentLevel,
    classSymbolTable,
    print,
    printVm,
  );

  return cursor + cursorProcessed;
};
