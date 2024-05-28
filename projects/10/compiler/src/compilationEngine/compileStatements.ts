import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { indentation } from '../utils/indentation';
import { compileExpression } from './compileExpression';
import { compileExpressionList } from './compileExpressionList';
import { ClassSymbolTable } from './model/ClassSymbolTable';
import { SubroutineSymbolTable } from './model/SubroutineSymbolTable';
import { vmWriter } from './model/VmWriter';

export const compileStatements = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  return _handleStatements(
    xmls,
    indentLevel + 1,
    classSymbolTable,
    subroutineSymbolTable,
    print,
    printVm,
  );
};

const currentWhileIndex = 0;

const _handleStatements = (
  xmls: string[],
  indentLevel: number,
  classSymbolTable: ClassSymbolTable,
  subroutineSymbolTable: SubroutineSymbolTable,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): number => {
  let _cursor = 0;
  const nextXml = xmls[_cursor++];
  if (!nextXml) {
    return _cursor;
  }

  const { tag, value } = parseSingleLineXml(nextXml);
  if (tag !== 'keyword') {
    return _cursor - 1;
  }

  switch (value) {
    case 'let': {
      print(indentation('<letStatement>', indentLevel - 1));
      print(indentation(nextXml, indentLevel)); // let

      const identifier = parseSingleLineXml(xmls[_cursor]).value;
      print(indentation(xmls[_cursor++], indentLevel)); // identifier

      let isArray = false;
      if (parseSingleLineXml(xmls[_cursor]).value === '[') {
        isArray = true;

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

        printVm(vmWriter.writePush('local', subroutineSymbolTable.indexOf(identifier)));
        printVm(vmWriter.writeArithmetic('add'));
      }
      print(indentation(xmls[_cursor++], indentLevel)); // =
      _cursor += compileExpression(
        xmls.slice(_cursor),
        indentLevel + 1,
        classSymbolTable,
        subroutineSymbolTable,
        print,
        printVm,
      );
      // the results of the expression are on the stack
      try {
        const indexOfIdentifier = subroutineSymbolTable.indexOf(identifier);

        if (isArray) {
          printVm(vmWriter.writePop('temp', 0));
          printVm(vmWriter.writePop('pointer', 1));
          printVm(vmWriter.writePush('temp', 0));
          printVm(vmWriter.writePop('that', 0));
        } else {
          printVm(
            vmWriter.writePop(
              subroutineSymbolTable.kindOf(identifier) === 'var' ? 'local' : 'argument',
              indexOfIdentifier,
            ),
          );
        }
      } catch (e) {
        const indexOfIdentifier = classSymbolTable.indexOf(identifier);
        const kind = classSymbolTable.kindOf(identifier);
        if (!kind) {
          throw new Error('Invalid identifier.');
        }

        printVm(vmWriter.writePop(kind === 'field' ? 'this' : 'static', indexOfIdentifier));
      }

      print(indentation(xmls[_cursor++], indentLevel)); // ;

      print(indentation('</letStatement>', indentLevel - 1));

      break;
    }
    case 'if': {
      print(indentation('<ifStatement>', indentLevel - 1));

      print(indentation(nextXml, indentLevel)); // if
      print(indentation(xmls[_cursor++], indentLevel)); // (
      _cursor += compileExpression(
        xmls.slice(_cursor),
        indentLevel + 1,
        classSymbolTable,
        subroutineSymbolTable,
        print,
        printVm,
      );
      print(indentation(xmls[_cursor++], indentLevel)); // )

      print(indentation(xmls[_cursor++], indentLevel));
      print(indentation('<statements>', indentLevel));

      const currentIfIndex = subroutineSymbolTable.getBranchCount('if');
      subroutineSymbolTable.increaseBranchCount('if');
      printVm(vmWriter.writeIf('IF_TRUE' + currentIfIndex));
      printVm(vmWriter.writeGoto('IF_FALSE' + currentIfIndex));
      printVm(vmWriter.writeLabel('IF_TRUE' + currentIfIndex));
      _cursor += compileStatements(
        xmls.slice(_cursor),
        indentLevel + 1,
        classSymbolTable,
        subroutineSymbolTable,
        print,
        printVm,
      );
      print(indentation('</statements>', indentLevel));
      print(indentation(xmls[_cursor++], indentLevel));

      const hasElse = parseSingleLineXml(xmls[_cursor]).value === 'else';
      if (hasElse) {
        printVm(vmWriter.writeGoto('IF_END' + currentIfIndex));
      }
      printVm(vmWriter.writeLabel('IF_FALSE' + currentIfIndex));

      if (hasElse) {
        print(indentation(xmls[_cursor++], indentLevel)); // else
        print(indentation(xmls[_cursor++], indentLevel)); // {
        print(indentation('<statements>', indentLevel));
        _cursor += compileStatements(
          xmls.slice(_cursor),
          indentLevel + 1,
          classSymbolTable,
          subroutineSymbolTable,
          print,
          printVm,
        );
        print(indentation('</statements>', indentLevel));
        print(indentation(xmls[_cursor++], indentLevel)); // }
        printVm(vmWriter.writeLabel('IF_END' + currentIfIndex));
      }

      print(indentation('</ifStatement>', indentLevel - 1));

      break;
    }
    case 'while': {
      print(indentation('<whileStatement>', indentLevel - 1));

      print(indentation(nextXml, indentLevel)); // while
      const currentWhileIndex = subroutineSymbolTable.getBranchCount('while');
      subroutineSymbolTable.increaseBranchCount('while');

      printVm(vmWriter.writeLabel('WHILE_EXP' + currentWhileIndex));
      print(indentation(xmls[_cursor++], indentLevel)); // (
      _cursor += compileExpression(
        xmls.slice(_cursor),
        indentLevel + 1,
        classSymbolTable,
        subroutineSymbolTable,
        print,
        printVm,
      );
      print(indentation(xmls[_cursor++], indentLevel)); // )
      printVm(vmWriter.writeArithmetic('not'));
      printVm(vmWriter.writeIf('WHILE_END' + currentWhileIndex));

      print(indentation(xmls[_cursor++], indentLevel));
      print(indentation('<statements>', indentLevel));
      _cursor += compileStatements(
        xmls.slice(_cursor),
        indentLevel + 1,
        classSymbolTable,
        subroutineSymbolTable,
        print,
        printVm,
      );
      print(indentation('</statements>', indentLevel));
      print(indentation(xmls[_cursor++], indentLevel));

      print(indentation('</whileStatement>', indentLevel - 1));
      printVm(vmWriter.writeGoto('WHILE_EXP' + currentWhileIndex));
      printVm(vmWriter.writeLabel('WHILE_END' + currentWhileIndex));

      break;
    }
    case 'do': {
      print(indentation('<doStatement>', indentLevel - 1));
      print(indentation(nextXml, indentLevel));

      let identifier = parseSingleLineXml(xmls[_cursor]).value;
      print(indentation(xmls[_cursor++], indentLevel));

      let isObject = false;
      if (parseSingleLineXml(xmls[_cursor]).value === '.') {
        try {
          const variableIndex = subroutineSymbolTable.indexOf(identifier);
          printVm(vmWriter.writePush('local', variableIndex));
          isObject = true;
        } catch (e) {
          try {
            const indexOfIdentifier = classSymbolTable.indexOf(identifier);
            printVm(vmWriter.writePush('this', indexOfIdentifier));
            isObject = true;
          } catch (e) {
            // identifier가 변수가 아닌 경우는 스태틱 메서드를 호출하는 경우다.
          }
        }

        if (isObject) {
          try {
            identifier = subroutineSymbolTable.typeOf(identifier);
          } catch (e) {
            identifier = classSymbolTable.typeOf(identifier);
          }
        }
        identifier += parseSingleLineXml(xmls[_cursor]).value;
        print(indentation(xmls[_cursor++], indentLevel));
        identifier += parseSingleLineXml(xmls[_cursor]).value;
        print(indentation(xmls[_cursor++], indentLevel));
      } else {
        identifier = classSymbolTable.className + '.' + identifier;
        printVm(vmWriter.writePush('pointer', 0));
        isObject = true;
      }

      print(indentation(xmls[_cursor++], indentLevel)); // parenthesis open
      const result = compileExpressionList(
        xmls.slice(_cursor),
        indentLevel + 1,
        classSymbolTable,
        subroutineSymbolTable,
        print,
        printVm,
      );
      _cursor += result.cursorProcessed;
      print(indentation(xmls[_cursor++], indentLevel)); // parenthesis close
      print(indentation(xmls[_cursor++], indentLevel)); // semicolon

      print(indentation('</doStatement>', indentLevel - 1));

      printVm(vmWriter.writeCall(identifier, result.totalExpressions + (isObject ? 1 : 0)));
      printVm(vmWriter.writePop('temp', 0));

      break;
    }
    case 'return': {
      print(indentation('<returnStatement>', indentLevel - 1));

      print(indentation(nextXml, indentLevel)); // return

      if (parseSingleLineXml(xmls[_cursor]).value === ';') {
        printVm(vmWriter.writePush('constant', 0));
      } else {
        _cursor += compileExpression(
          xmls.slice(_cursor),
          indentLevel + 1,
          classSymbolTable,
          subroutineSymbolTable,
          print,
          printVm,
        );
      }

      print(indentation(xmls[_cursor++], indentLevel)); // semicolon

      print(indentation('</returnStatement>', indentLevel - 1));

      printVm(vmWriter.writeReturn());

      break;
    }
    default:
      throw new Error('Invalid XML.');
  }

  return (
    _cursor +
    _handleStatements(
      xmls.slice(_cursor),
      indentLevel,
      classSymbolTable,
      subroutineSymbolTable,
      print,
      printVm,
    )
  );
};
