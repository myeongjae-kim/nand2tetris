import { CompileResult } from './CompileResult';
import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileExpression } from './compileExpression';

export const compileExpressionList = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): CompileResult => {
  let cursor = 0;

  const _handleExpressions = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): CompileResult => {
    if (parseSingleLineXml(_xmls[0]).value === ')') {
      return { cursorProcessed: 0 };
    }

    let _cursor = 0;

    _cursor += compileExpression(_xmls, _indentLevel, _print).cursorProcessed;

    if (parseSingleLineXml(_xmls[_cursor]).value === ',') {
      _print(indentation(_xmls[_cursor++], _indentLevel - 1)); // ,
      _cursor += _handleExpressions(_xmls.slice(_cursor), _indentLevel, _print).cursorProcessed;
    }

    return {
      cursorProcessed: _cursor,
    };
  };

  print(indentation('<expressionList>', indentLevel - 1));

  cursor += _handleExpressions(xmls, indentLevel + 1, print).cursorProcessed;

  print(indentation('</expressionList>', indentLevel - 1));

  return {
    cursorProcessed: cursor,
  };
};
