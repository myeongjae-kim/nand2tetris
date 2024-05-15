import { CompileResult } from './CompileResult';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { indentation } from '../utils/indentation';
import { compileExpression } from './compileExpression';
import { compileExpressionList } from './compileExpressionList';

export const compileStatements = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  const _handleStatements = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): CompileResult => {
    let _cursor = 0;
    const nextXml = _xmls[_cursor++];
    if (!nextXml) {
      return { cursorProcessed: _cursor };
    }

    const { tag, value } = parseSingleLineXml(nextXml);
    if (tag !== 'keyword') {
      return { cursorProcessed: _cursor - 1 };
    }

    switch (value) {
      case 'let': {
        _print(indentation('<letStatement>', _indentLevel - 1));
        _print(indentation(nextXml, _indentLevel));
        _print(indentation(_xmls[_cursor++], _indentLevel));
        if (parseSingleLineXml(_xmls[_cursor]).value === '[') {
          _print(indentation(_xmls[_cursor++], _indentLevel)); // [
          _cursor += compileExpression(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;
          _print(indentation(_xmls[_cursor++], _indentLevel)); // ]
        }
        _print(indentation(_xmls[_cursor++], _indentLevel)); // =
        _cursor += compileExpression(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation(_xmls[_cursor++], _indentLevel));

        _print(indentation('</letStatement>', _indentLevel - 1));

        break;
      }
      case 'if': {
        _print(indentation('<ifStatement>', _indentLevel - 1));

        _print(indentation(nextXml, _indentLevel)); // if
        _print(indentation(_xmls[_cursor++], _indentLevel)); // (
        _cursor += compileExpression(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation(_xmls[_cursor++], _indentLevel)); // )

        _print(indentation(_xmls[_cursor++], _indentLevel));
        _print(indentation('<statements>', _indentLevel));
        _cursor += compileStatements(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation('</statements>', _indentLevel));
        _print(indentation(_xmls[_cursor++], _indentLevel));

        if (parseSingleLineXml(_xmls[_cursor]).value === 'else') {
          _print(indentation(_xmls[_cursor++], _indentLevel)); // else
          _print(indentation(_xmls[_cursor++], _indentLevel)); // {
          _print(indentation('<statements>', _indentLevel));
          _cursor += compileStatements(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;
          _print(indentation('</statements>', _indentLevel));
          _print(indentation(_xmls[_cursor++], _indentLevel)); // }
        }

        _print(indentation('</ifStatement>', _indentLevel - 1));

        break;
      }
      case 'while': {
        _print(indentation('<whileStatement>', _indentLevel - 1));

        _print(indentation(nextXml, _indentLevel)); // while
        _print(indentation(_xmls[_cursor++], _indentLevel)); // (
        _cursor += compileExpression(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation(_xmls[_cursor++], _indentLevel)); // )

        _print(indentation(_xmls[_cursor++], _indentLevel));
        _print(indentation('<statements>', _indentLevel));
        _cursor += compileStatements(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation('</statements>', _indentLevel));
        _print(indentation(_xmls[_cursor++], _indentLevel));

        _print(indentation('</whileStatement>', _indentLevel - 1));

        break;
      }
      case 'do': {
        _print(indentation('<doStatement>', _indentLevel - 1));
        _print(indentation(nextXml, _indentLevel));
        _print(indentation(_xmls[_cursor++], _indentLevel));

        if (parseSingleLineXml(_xmls[_cursor]).value === '.') {
          _print(indentation(_xmls[_cursor++], _indentLevel));
          _print(indentation(_xmls[_cursor++], _indentLevel));
        }

        _print(indentation(_xmls[_cursor++], _indentLevel)); // parenthesis open
        _cursor += compileExpressionList(
          _xmls.slice(_cursor),
          _indentLevel + 1,
          _print,
        ).cursorProcessed;
        _print(indentation(_xmls[_cursor++], _indentLevel)); // parenthesis close
        _print(indentation(_xmls[_cursor++], _indentLevel)); // semicolon

        _print(indentation('</doStatement>', _indentLevel - 1));

        break;
      }
      case 'return': {
        _print(indentation('<returnStatement>', _indentLevel - 1));

        _print(indentation(nextXml, _indentLevel)); // return

        if (parseSingleLineXml(_xmls[_cursor]).value !== ';') {
          _cursor += compileExpression(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;
        }

        _print(indentation(_xmls[_cursor++], _indentLevel)); // semicolon

        _print(indentation('</returnStatement>', _indentLevel - 1));

        break;
      }
      default:
        throw new Error('Invalid XML.');
    }

    return {
      cursorProcessed:
        _cursor + _handleStatements(_xmls.slice(_cursor), _indentLevel, _print).cursorProcessed,
    };
  };

  const { cursorProcessed } = _handleStatements(xmls, indentLevel + 1, print);

  return { cursorProcessed };
};
