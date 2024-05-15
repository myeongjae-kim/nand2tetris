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

  const _handleParameterList = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): number => {
    let _cursor = 0;

    const { value } = parseSingleLineXml(_xmls[_cursor]);

    if (value === ')') {
      return _cursor;
    } else if (value === ',') {
      _print(indentation(_xmls[_cursor++], _indentLevel)); // ,
    }

    _print(indentation(_xmls[_cursor++], _indentLevel)); // type
    _print(indentation(_xmls[_cursor++], _indentLevel)); // varName
    _cursor += _handleParameterList(_xmls.slice(_cursor), _indentLevel, _print);

    return _cursor;
  };

  cursor += _handleParameterList(xmls.slice(cursor), indentLevel, print);

  print(indentation('</parameterList>', indentLevel - 1));
  print(indentation(xmls[cursor++], indentLevel - 1)); // )

  return cursor;
};
