import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { indentation } from '../utils/indentation';
import { compileExpression } from './compileExpression';
import { compileExpressionList } from './compileExpressionList';

export const compileStatements = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  return _handleStatements(xmls, indentLevel + 1, print);
};

const _handleStatements = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
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
      print(indentation(nextXml, indentLevel));
      print(indentation(xmls[_cursor++], indentLevel));
      if (parseSingleLineXml(xmls[_cursor]).value === '[') {
        print(indentation(xmls[_cursor++], indentLevel)); // [
        _cursor += compileExpression(xmls.slice(_cursor), indentLevel + 1, print);
        print(indentation(xmls[_cursor++], indentLevel)); // ]
      }
      print(indentation(xmls[_cursor++], indentLevel)); // =
      _cursor += compileExpression(xmls.slice(_cursor), indentLevel + 1, print);
      print(indentation(xmls[_cursor++], indentLevel));

      print(indentation('</letStatement>', indentLevel - 1));

      break;
    }
    case 'if': {
      print(indentation('<ifStatement>', indentLevel - 1));

      print(indentation(nextXml, indentLevel)); // if
      print(indentation(xmls[_cursor++], indentLevel)); // (
      _cursor += compileExpression(xmls.slice(_cursor), indentLevel + 1, print);
      print(indentation(xmls[_cursor++], indentLevel)); // )

      print(indentation(xmls[_cursor++], indentLevel));
      print(indentation('<statements>', indentLevel));
      _cursor += compileStatements(xmls.slice(_cursor), indentLevel + 1, print);
      print(indentation('</statements>', indentLevel));
      print(indentation(xmls[_cursor++], indentLevel));

      if (parseSingleLineXml(xmls[_cursor]).value === 'else') {
        print(indentation(xmls[_cursor++], indentLevel)); // else
        print(indentation(xmls[_cursor++], indentLevel)); // {
        print(indentation('<statements>', indentLevel));
        _cursor += compileStatements(xmls.slice(_cursor), indentLevel + 1, print);
        print(indentation('</statements>', indentLevel));
        print(indentation(xmls[_cursor++], indentLevel)); // }
      }

      print(indentation('</ifStatement>', indentLevel - 1));

      break;
    }
    case 'while': {
      print(indentation('<whileStatement>', indentLevel - 1));

      print(indentation(nextXml, indentLevel)); // while
      print(indentation(xmls[_cursor++], indentLevel)); // (
      _cursor += compileExpression(xmls.slice(_cursor), indentLevel + 1, print);
      print(indentation(xmls[_cursor++], indentLevel)); // )

      print(indentation(xmls[_cursor++], indentLevel));
      print(indentation('<statements>', indentLevel));
      _cursor += compileStatements(xmls.slice(_cursor), indentLevel + 1, print);
      print(indentation('</statements>', indentLevel));
      print(indentation(xmls[_cursor++], indentLevel));

      print(indentation('</whileStatement>', indentLevel - 1));

      break;
    }
    case 'do': {
      print(indentation('<doStatement>', indentLevel - 1));
      print(indentation(nextXml, indentLevel));
      print(indentation(xmls[_cursor++], indentLevel));

      if (parseSingleLineXml(xmls[_cursor]).value === '.') {
        print(indentation(xmls[_cursor++], indentLevel));
        print(indentation(xmls[_cursor++], indentLevel));
      }

      print(indentation(xmls[_cursor++], indentLevel)); // parenthesis open
      _cursor += compileExpressionList(xmls.slice(_cursor), indentLevel + 1, print);
      print(indentation(xmls[_cursor++], indentLevel)); // parenthesis close
      print(indentation(xmls[_cursor++], indentLevel)); // semicolon

      print(indentation('</doStatement>', indentLevel - 1));

      break;
    }
    case 'return': {
      print(indentation('<returnStatement>', indentLevel - 1));

      print(indentation(nextXml, indentLevel)); // return

      if (parseSingleLineXml(xmls[_cursor]).value !== ';') {
        _cursor += compileExpression(xmls.slice(_cursor), indentLevel + 1, print);
      }

      print(indentation(xmls[_cursor++], indentLevel)); // semicolon

      print(indentation('</returnStatement>', indentLevel - 1));

      break;
    }
    default:
      throw new Error('Invalid XML.');
  }

  return _cursor + _handleStatements(xmls.slice(_cursor), indentLevel, print);
};
