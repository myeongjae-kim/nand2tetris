import { readFilePromise } from './readFilePromise';
import { readdirPromise } from './readdirPromise';
import { jackTokenizer } from './jackTokenizer';
import { writeFilePromise } from './writeFilePromise';

export const jackAnalyzer = async (path: string): Promise<void> => {
  const jackExtension = '.jack';
  if (path.endsWith(jackExtension)) {
    await handleSingleFile(path);
    return;
  }

  const jackFiles = (await readdirPromise(path)).filter((it) => it.endsWith(jackExtension));

  if (jackFiles.length === 0) {
    throw Error('No `.jack` files found.');
  }

  await Promise.all(jackFiles.map((it) => handleSingleFile(`${path}/${it}`)));
};

const handleSingleFile = async (jackFile: string) => {
  if (!jackFile.endsWith('.jack')) {
    throw Error('The path must have a `.jack` extension.');
  }

  const jackCode = await readFilePromise(jackFile);

  let currentLineNumber = 0;
  const readLine = () => {
    const line = jackCode.replace(/\r/g, '').split('\n')[currentLineNumber];
    currentLineNumber += 1;

    if (line === undefined) {
      return null;
    }

    return line;
  };

  const tokenizer = jackTokenizer(readLine);
  let xml = '<tokens>\n';
  for (;;) {
    tokenizer.advance();
    if (!tokenizer.hasMoreTokens()) {
      break;
    }

    const tokenValue = (() => {
      switch (tokenizer.tokenType()) {
        case 'keyword':
          return tokenizer.keyword();
        case 'symbol':
          return tokenizer.symbol();
        case 'identifier':
          return tokenizer.identifier();
        case 'integerConstant':
          return tokenizer.intVal();
        case 'stringConstant':
          return tokenizer.stringVal();
        default:
          throw Error(`Unknown token type: ${tokenizer.tokenType()}`);
      }
    })();
    xml = `${xml}<${tokenizer.tokenType()}> ${tokenValue} </${tokenizer.tokenType()}>\n`;
  }

  xml = `${xml}</tokens>`;

  const xmlFile = jackFile.replace('.jack', 'T.xml');
  await writeFilePromise(xmlFile, xml);
};
