import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileExpressionList } from './compileExpressionList';
import { ClassSymbolTable } from './model/ClassSymbolTable';
import { SubroutineSymbolTable } from './model/SubroutineSymbolTable';
import { vmWriter } from './model/VmWriter';

export const compileExpression = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  print(indentation('<expression>', indentLevel - 1));

  const cursorProcessed = _handleTerm(
    xmls,
    indentLevel + 1,
    classSymbolTable,
    subroutineSymbolTable,
    print,
    printVm,
  );

  print(indentation('</expression>', indentLevel - 1));

  return cursorProcessed;
};

const _handleTerm = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  print(indentation('<term>', indentLevel - 1));

  let _cursor = 0;
  if (!xmls[_cursor]) {
    return _cursor;
  }
  const { tag } = parseSingleLineXml(xmls[_cursor]);

  const operators = ['+', '-', '~', '*', '/', '&amp;', '|', '&lt;', '&gt;', '='];

  switch (tag) {
    case 'symbol': {
      const { value: _value } = parseSingleLineXml(xmls[_cursor]);
      if (_value === '(') {
        print(indentation(xmls[_cursor++], indentLevel)); // (
        _cursor += compileExpression(
          xmls.slice(_cursor),
          indentLevel + 1,
          classSymbolTable,
          subroutineSymbolTable,
          print,
          printVm,
        );

        if (parseSingleLineXml(xmls[_cursor]).value === ')') {
          print(indentation(xmls[_cursor++], indentLevel)); // )
        }

        break;
      }

      if (operators.includes(_value)) {
        print(indentation(xmls[_cursor++], indentLevel));
        _cursor += _handleTerm(
          xmls.slice(_cursor),
          indentLevel + 1,
          classSymbolTable,
          subroutineSymbolTable,
          print,
          printVm,
        );

        _value === '-' && printVm('neg');
      }

      break;
    }
    case 'integerConstant':
    case 'stringConstant':
    case 'keyword':
    case 'identifier': {
      print(indentation(xmls[_cursor++], indentLevel));

      //// printVm Start
      tag === 'integerConstant' &&
        printVm(vmWriter.writePush('constant', parseSingleLineXml(xmls[_cursor - 1]).value));

      //// printVm End

      if (parseSingleLineXml(xmls[_cursor]).value === '.') {
        print(indentation(xmls[_cursor++], indentLevel));
        print(indentation(xmls[_cursor++], indentLevel));
      }

      if (parseSingleLineXml(xmls[_cursor]).value === '(') {
        print(indentation(xmls[_cursor++], indentLevel)); // (
        _cursor += compileExpressionList(
          xmls.slice(_cursor),
          indentLevel + 1,
          classSymbolTable,
          subroutineSymbolTable,
          print,
          printVm,
        ).cursorProcessed;
        print(indentation(xmls[_cursor++], indentLevel)); // )
      }

      if (parseSingleLineXml(xmls[_cursor]).value === '[') {
        print(indentation(xmls[_cursor++], indentLevel)); // [
        _cursor += compileExpression(
          xmls.slice(_cursor),
          indentLevel + 1,
          classSymbolTable,
          subroutineSymbolTable,
          print,
          printVm,
        );
        print(indentation(xmls[_cursor++], indentLevel)); // ]
      }
      break;
    }
    default:
      throw new Error('compileExpression cannot handle current line: ' + xmls[_cursor]);
  }
  print(indentation('</term>', indentLevel - 1));

  if (operators.includes(parseSingleLineXml(xmls[_cursor]).value)) {
    const operator = parseSingleLineXml(xmls[_cursor]).value;

    print(indentation(xmls[_cursor++], indentLevel - 1)); // print operator
    _cursor += _handleTerm(
      xmls.slice(_cursor),
      indentLevel,
      classSymbolTable,
      subroutineSymbolTable,
      print,
      printVm,
    );

    operator === '*' && printVm(vmWriter.writeCall('Math.multiply', 2));
    operator === '+' && printVm('add');
  }

  return _cursor;
};
