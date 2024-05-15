import { CompileResult } from './CompileResult';
import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileExpressionList } from './compileExpressionList';

export const compileExpression = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  print(indentation('<expression>', indentLevel - 1));

  const _handleTerm = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): CompileResult => {
    _print(indentation('<term>', _indentLevel - 1));

    let _cursor = 0;
    if (!_xmls[_cursor]) {
      return { cursorProcessed: _cursor };
    }
    const { tag } = parseSingleLineXml(_xmls[_cursor]);

    const operators = ['+', '-', '~', '*', '/', '&amp;', '|', '&lt;', '&gt;', '='];

    switch (tag) {
      case 'symbol': {
        const { value: _value } = parseSingleLineXml(_xmls[_cursor]);
        if (_value === '(') {
          _print(indentation(_xmls[_cursor++], _indentLevel)); // (
          _cursor += compileExpression(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;

          if (parseSingleLineXml(_xmls[_cursor]).tag === 'symbol') {
            if (parseSingleLineXml(_xmls[_cursor]).value === ')') {
              _print(indentation(_xmls[_cursor++], _indentLevel)); // )
            }
          }
        } else if (operators.includes(_value)) {
          _print(indentation(_xmls[_cursor++], _indentLevel));
          _cursor += _handleTerm(_xmls.slice(_cursor), _indentLevel + 1, _print).cursorProcessed;
        }

        break;
      }
      case 'integerConstant':
      case 'stringConstant':
      case 'keyword':
      case 'identifier': {
        _print(indentation(_xmls[_cursor++], _indentLevel));

        if (parseSingleLineXml(_xmls[_cursor]).value === '.') {
          _print(indentation(_xmls[_cursor++], _indentLevel));
          _print(indentation(_xmls[_cursor++], _indentLevel));
        }

        if (parseSingleLineXml(_xmls[_cursor]).value === '(') {
          _print(indentation(_xmls[_cursor++], _indentLevel)); // (
          _cursor += compileExpressionList(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;

          _print(indentation(_xmls[_cursor++], _indentLevel)); // )
        }

        if (parseSingleLineXml(_xmls[_cursor]).value === '[') {
          _print(indentation(_xmls[_cursor++], _indentLevel)); // [

          _cursor += compileExpression(
            _xmls.slice(_cursor),
            _indentLevel + 1,
            _print,
          ).cursorProcessed;

          _print(indentation(_xmls[_cursor++], _indentLevel)); // ]
        }
        break;
      }
      default:
        throw new Error('compileExpression cannot handle current line: ' + _xmls[_cursor]);
    }
    _print(indentation('</term>', _indentLevel - 1));

    if (operators.includes(parseSingleLineXml(_xmls[_cursor]).value)) {
      _print(indentation(_xmls[_cursor++], _indentLevel - 1)); // print operator
      _cursor += _handleTerm(_xmls.slice(_cursor), _indentLevel, _print).cursorProcessed;
    }

    return { cursorProcessed: _cursor };
  };

  const { cursorProcessed } = _handleTerm(xmls, indentLevel + 1, print);

  print(indentation('</expression>', indentLevel - 1));

  return { cursorProcessed };
};
