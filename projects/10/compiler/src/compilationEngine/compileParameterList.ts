import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';

export const compileParameterList = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  let cursor = 0;

  print(indentation(xmls[cursor++], indentLevel - 1)); // (
  print(indentation('<parameterList>', indentLevel - 1));

  cursor += _handleParameterList(xmls.slice(cursor), indentLevel, print);

  print(indentation('</parameterList>', indentLevel - 1));
  print(indentation(xmls[cursor++], indentLevel - 1)); // )

  return cursor;
};

const _handleParameterList = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  let _cursor = 0;

  const { value } = parseSingleLineXml(xmls[_cursor]);

  if (value === ')') {
    return _cursor;
  } else if (value === ',') {
    print(indentation(xmls[_cursor++], indentLevel)); // ,
  }

  print(indentation(xmls[_cursor++], indentLevel)); // type
  print(indentation(xmls[_cursor++], indentLevel)); // varName
  _cursor += _handleParameterList(xmls.slice(_cursor), indentLevel, print);

  return _cursor;
};
