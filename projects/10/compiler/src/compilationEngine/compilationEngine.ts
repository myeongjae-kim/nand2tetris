import { writeFilePromise } from '../writeFilePromise';
import { readFilePromise } from '../readFilePromise';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileClass } from './compileClass';

export const compilationEngine = async (...tokenXmlPaths: string[]): Promise<void> => {
  await Promise.all(
    tokenXmlPaths.map(async (tokenXmlPath) => {
      if (!tokenXmlPath.endsWith('T.xml')) {
        return;
      }

      let xml = '';
      const print = (_xml: string) => {
        xml += _xml + '\n';
      };

      compile((await readFilePromise(tokenXmlPath)).split('\n'), 0, print);

      await writeFilePromise(tokenXmlPath.replace('T.xml', '.xml'), xml.trim());
    }),
  );
};

const compile = (xmls: string[], indentLevel: number, print: (xml: string) => void): void => {
  if (xmls.length === 0) {
    return;
  }

  const firstLine = parseSingleLineXml(xmls[0]);
  if (firstLine.tag === 'tokens') {
    return compile(xmls.slice(1, -1), indentLevel, print);
  }

  if (firstLine.tag === 'keyword') {
    if (firstLine.value === 'class') {
      return compileClass(xmls, indentLevel + 1, print);
    }
  }

  return;
};
