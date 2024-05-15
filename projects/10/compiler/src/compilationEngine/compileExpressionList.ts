import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileExpression } from './compileExpression';

export const compileExpressionList = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  let cursor = 0;

  print(indentation('<expressionList>', indentLevel - 1));

  cursor += _handleExpressions(xmls, indentLevel + 1, print);

  print(indentation('</expressionList>', indentLevel - 1));

  return cursor;
};

const _handleExpressions = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  if (parseSingleLineXml(xmls[0]).value === ')') {
    return 0;
  }

  let _cursor = 0;

  _cursor += compileExpression(xmls, indentLevel, print);

  if (parseSingleLineXml(xmls[_cursor]).value === ',') {
    print(indentation(xmls[_cursor++], indentLevel - 1)); // ,
    _cursor += _handleExpressions(xmls.slice(_cursor), indentLevel, print);
  }

  return _cursor;
};
