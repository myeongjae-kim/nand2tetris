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

let currentWhileIndex = 0;

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
      const indexOfIdentifier = subroutineSymbolTable.indexOf(identifier);
      printVm(
        vmWriter.writePop(
          subroutineSymbolTable.kindOf(identifier) === 'var' ? 'local' : 'argument',
          indexOfIdentifier,
        ),
      );

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

      if (parseSingleLineXml(xmls[_cursor]).value === 'else') {
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
      }

      print(indentation('</ifStatement>', indentLevel - 1));

      break;
    }
    case 'while': {
      print(indentation('<whileStatement>', indentLevel - 1));

      print(indentation(nextXml, indentLevel)); // while
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
      currentWhileIndex++;
      _cursor += compileStatements(
        xmls.slice(_cursor),
        indentLevel + 1,
        classSymbolTable,
        subroutineSymbolTable,
        print,
        printVm,
      );
      --currentWhileIndex;
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

      let functionName = parseSingleLineXml(xmls[_cursor]).value;
      print(indentation(xmls[_cursor++], indentLevel));

      if (parseSingleLineXml(xmls[_cursor]).value === '.') {
        functionName += parseSingleLineXml(xmls[_cursor]).value;
        print(indentation(xmls[_cursor++], indentLevel));
        functionName += parseSingleLineXml(xmls[_cursor]).value;
        print(indentation(xmls[_cursor++], indentLevel));
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

      printVm(vmWriter.writeCall(functionName, result.totalExpressions));
      printVm(vmWriter.writePop('temp', 0));

      break;
    }
    case 'return': {
      print(indentation('<returnStatement>', indentLevel - 1));

      print(indentation(nextXml, indentLevel)); // return

      if (parseSingleLineXml(xmls[_cursor]).value !== ';') {
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
