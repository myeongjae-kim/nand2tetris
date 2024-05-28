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
        _value === '~' && printVm('not');
      }

      break;
    }
    case 'integerConstant':
    case 'stringConstant':
    case 'keyword':
    case 'identifier': {
      let aValue = parseSingleLineXml(xmls[_cursor]).value;
      print(indentation(xmls[_cursor++], indentLevel));

      if (tag === 'stringConstant') {
        const stringConstant = parseSingleLineXml(xmls[_cursor - 1]).value;
        printVm(vmWriter.writePush('constant', stringConstant.length));
        printVm(vmWriter.writeCall('String.new', 1));
        for (let i = 0; i < stringConstant.length; i++) {
          printVm(vmWriter.writePush('constant', stringConstant.charCodeAt(i)));
          printVm(vmWriter.writeCall('String.appendChar', 2));
        }
      }

      tag === 'integerConstant' &&
        printVm(vmWriter.writePush('constant', parseSingleLineXml(xmls[_cursor - 1]).value));

      if (tag === 'keyword' && ['true', 'false', 'null'].includes(aValue)) {
        printVm(vmWriter.writePush('constant', 0));
        aValue === 'true' && printVm('not');
      }

      if (tag === 'keyword' && aValue === 'this') {
        printVm(vmWriter.writePush('pointer', 0));
      }

      if (tag === 'identifier') {
        const isArray = parseSingleLineXml(xmls[_cursor]).value === '[';
        if (isArray) {
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

        if (subroutineSymbolTable.kindOf(aValue) === 'var') {
          const indexOfIdentifier = subroutineSymbolTable.indexOf(aValue);
          printVm(vmWriter.writePush('local', indexOfIdentifier));
        }

        if (subroutineSymbolTable.kindOf(aValue) === 'arg') {
          const indexOfIdentifier = subroutineSymbolTable.indexOf(aValue);
          printVm(vmWriter.writePush('argument', indexOfIdentifier));
        }

        if (classSymbolTable.kindOf(aValue) === 'field') {
          const indexOfIdentifier = classSymbolTable.indexOf(aValue);
          printVm(vmWriter.writePush('this', indexOfIdentifier));
        }

        if (classSymbolTable.kindOf(aValue) === 'static') {
          const indexOfIdentifier = classSymbolTable.indexOf(aValue);
          printVm(vmWriter.writePush('static', indexOfIdentifier));
        }

        if (isArray) {
          printVm(vmWriter.writeArithmetic('add'));
          printVm(vmWriter.writePop('pointer', 1));
          printVm(vmWriter.writePush('that', 0));
        }
      }

      let isObject = false;
      if (parseSingleLineXml(xmls[_cursor]).value === '.') {
        try {
          subroutineSymbolTable.indexOf(aValue);
          isObject = true;
        } catch (e) {
          try {
            classSymbolTable.indexOf(aValue);
            isObject = true;
          } catch (e) {
            // identifier가 변수가 아닌 경우는 스태틱 메서드를 호출하는 경우다.
          }
        }

        if (isObject) {
          try {
            aValue = subroutineSymbolTable.typeOf(aValue);
          } catch (e) {
            aValue = classSymbolTable.typeOf(aValue);
          }
        }

        aValue += parseSingleLineXml(xmls[_cursor]).value;
        print(indentation(xmls[_cursor++], indentLevel));
        aValue += parseSingleLineXml(xmls[_cursor]).value;
        print(indentation(xmls[_cursor++], indentLevel));
      }

      if (parseSingleLineXml(xmls[_cursor]).value === '(') {
        print(indentation(xmls[_cursor++], indentLevel)); // (
        const result = compileExpressionList(
          xmls.slice(_cursor),
          indentLevel + 1,
          classSymbolTable,
          subroutineSymbolTable,
          print,
          printVm,
        );
        _cursor += result.cursorProcessed;
        print(indentation(xmls[_cursor++], indentLevel)); // )

        printVm(vmWriter.writeCall(aValue, result.totalExpressions + (isObject ? 1 : 0)));
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
    operator === '/' && printVm(vmWriter.writeCall('Math.divide', 2));
    operator === '+' && printVm('add');
    operator === '-' && printVm('sub');
    operator === '&gt;' && printVm('gt');
    operator === '&lt;' && printVm('lt');
    operator === '&amp;' && printVm('and');
    operator === '|' && printVm('or');
    operator === '=' && printVm('eq');
  }

  return _cursor;
};
