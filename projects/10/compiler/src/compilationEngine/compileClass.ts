import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileClassVarDec } from './compileClassVarDec';
import { compileSubroutineDec } from './compileSubroutineDec';
import { ClassSymbolTable } from './model/ClassSymbolTable';
import { SymbolKind } from './model/SymbolTable';
import { isSubroutineKind } from './model/SubroutineKind';

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

  // TODO: static, field 선언만 모아서 처리하기. _compileClass를 재귀적으로 호출하는게 아니라, 클래스 변수만 처리하는 함수를 따로 만들어서 재귀함수로 반복하기
  //  클래스 변수 개수를 세서 리턴해야 한다.
  if (['static', 'field'].includes(value)) {
    cursor += compileClassVarDec(
      xmls.slice(cursor),
      indentLevel + 1,
      classSymbolTable,
      value as SymbolKind,
      print,
      printVm,
    );
  }

  if (isSubroutineKind(value)) {
    cursor += compileSubroutineDec(
      xmls.slice(cursor),
      indentLevel + 1,
      classSymbolTable,
      value,
      print,
      printVm,
    );
  }

  nextXml = xmls[cursor];
  if (!nextXml || parseSingleLineXml(nextXml).value === '}') {
    return cursor;
  }

  // TODO: _compileClass가 아니라 compileSubroutineDec만 재귀적으로 호출하는 함수로 따로 떼내기.
  const cursorProcessed = _compileClass(
    xmls.slice(cursor),
    indentLevel,
    classSymbolTable,
    print,
    printVm,
  );

  return cursor + cursorProcessed;
};
