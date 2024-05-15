import { indentation } from '../utils/indentation';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';

export const handleVarDecs = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
): number => {
  let cursor = 0;
  const staticOrFieldXml = xmls[cursor++];
  const typeXml = xmls[cursor++];

  print(indentation(staticOrFieldXml, indentLevel));
  print(indentation(typeXml, indentLevel));

  const _handleVarDecs = (
    _xmls: string[],
    _indentLevel: number,
    _print: (xml: string) => void,
  ): number => {
    let _cursor = 0;
    print(indentation(_xmls[_cursor++], indentLevel));
    print(indentation(_xmls[_cursor++], indentLevel));

    if (parseSingleLineXml(_xmls[_cursor - 1]).value === ',') {
      _cursor += _handleVarDecs(_xmls.slice(_cursor), _indentLevel, _print);
    }

    return _cursor;
  };

  cursor += _handleVarDecs(xmls.slice(cursor), indentLevel, print);

  return cursor;
};
