import { writeFilePromise } from '../writeFilePromise';
import { readFilePromise } from '../readFilePromise';
import { parseSingleLineXml } from '../utils/parseSingleLineXml';
import { compileClass } from './compileClass';

type Args = {
  tokenXmlPaths: string[];
  printVmCode?: boolean;
};

export const compilationEngine = async ({ tokenXmlPaths, printVmCode }: Args): Promise<void> => {
  await Promise.all(
    tokenXmlPaths.map(async (tokenXmlPath) => {
      if (!tokenXmlPath.endsWith('T.xml')) {
        return;
      }

      const xmls: string[] = [];
      const print = (_xml: string) => {
        xmls.push(_xml);
      };

      const vms: string[] = [];
      const printVm = (_vm: string) => {
        vms.push(_vm);
      };

      compile((await readFilePromise(tokenXmlPath)).split('\n'), 0, print, printVm);

      await Promise.all([
        writeFilePromise(tokenXmlPath.replace('T.xml', '.xml'), xmls.join('\n')),
        printVmCode
          ? writeFilePromise(tokenXmlPath.replace('T.xml', '.vm'), vms.join('\n'))
          : Promise.resolve(),
      ]);
    }),
  );
};

const compile = (
  xmls: string[],
  indentLevel: number,
  print: (xml: string) => void,
  printVm: (vm: string) => void,
): void => {
  if (xmls.length === 0) {
    return;
  }

  const firstLine = parseSingleLineXml(xmls[0]);
  if (firstLine.tag === 'tokens') {
    compile(xmls.slice(1, -1), indentLevel, print, printVm);
    return;
  }

  if (firstLine.tag === 'keyword') {
    if (firstLine.value === 'class') {
      compileClass(xmls, indentLevel + 1, print, printVm);
    }
  }
};
