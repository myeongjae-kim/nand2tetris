import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileExpression } from './compileExpression';
import { ClassSymbolTable } from './model/ClassSymbolTable';
import { SubroutineSymbolTable } from './model/SubroutineSymbolTable';

export const compileExpressionList = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): {
  cursorProcessed: number;
  totalExpressions: number;
} => {
  let cursor = 0;

  print(indentation('<expressionList>', indentLevel - 1));

  const result = _handleExpressions(
    xmls,
    indentLevel + 1,
    classSymbolTable,
    subroutineSymbolTable,
    print,
    printVm,
  );

  cursor += result.cursorProcessed;

  print(indentation('</expressionList>', indentLevel - 1));

  return {
    cursorProcessed: cursor,
    totalExpressions: result.totalExpressions,
  };
};

const _handleExpressions = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): {
  cursorProcessed: number;
  totalExpressions: number;
} => {
  if (parseSingleLineXml(xmls[0]).value === ')') {
    return {
      cursorProcessed: 0,
      totalExpressions: 0,
    };
  }

  let _cursor = 0;
  let totalExpressions = 1;

  _cursor += compileExpression(
    xmls,
    indentLevel,
    classSymbolTable,
    subroutineSymbolTable,
    print,
    printVm,
  );

  if (parseSingleLineXml(xmls[_cursor]).value === ',') {
    print(indentation(xmls[_cursor++], indentLevel - 1)); // ,
    const result = _handleExpressions(
      xmls.slice(_cursor),
      indentLevel,
      classSymbolTable,
      subroutineSymbolTable,
      print,
      printVm,
    );

    _cursor += result.cursorProcessed;
    totalExpressions += result.totalExpressions;
  }

  return {
    cursorProcessed: _cursor,
    totalExpressions,
  };
};
