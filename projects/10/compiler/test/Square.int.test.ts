import { describe, expect, it } from 'vitest';
import { jackAnalyzer } from '../src/jackAnalyzer';
import { fileTestTemplate } from './testHelper';
import { readFilePromise } from '../src/readFilePromise';
import { compilationEngine } from '../src/compilationEngine';

describe('Square', () => {
  it('should compile Main.jack', async () => {
    const jackPath = './test/res/Square/Main.jack';
    const tokenXmlPath = './test/res/Square/MainT.xml';
    const xmlPath = './test/res/Square/Main.xml';
    const expectedTokenXmlPath = './test/res/expected/Square/MainT.xml';
    const expectedXmlPath = './test/res/expected/Square/Main.xml';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);

        const [tokenXml, expectedTokenXml] = await Promise.all([
          readFilePromise(tokenXmlPath),
          readFilePromise(expectedTokenXmlPath),
        ]);

        expect(tokenXml).toBe(expectedTokenXml.replace(/\r/g, '').trim());

        await compilationEngine(tokenXmlPath);
        const [xml, expectedXml] = await Promise.all([
          readFilePromise(xmlPath),
          readFilePromise(expectedXmlPath),
        ]);

        expect(xml).toBe(expectedXml.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
    );
  });

  it('should compile Square.jack', async () => {
    const jackPath = './test/res/Square/Square.jack';
    const tokenXmlPath = './test/res/Square/SquareT.xml';
    const xmlPath = './test/res/Square/Square.xml';
    const expectedTokenXmlPath = './test/res/expected/Square/SquareT.xml';
    const expectedXmlPath = './test/res/expected/Square/Square.xml';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);

        const [tokenXml, expectedTokenXml] = await Promise.all([
          readFilePromise(tokenXmlPath),
          readFilePromise(expectedTokenXmlPath),
        ]);

        expect(tokenXml).toBe(expectedTokenXml.replace(/\r/g, '').trim());

        await compilationEngine(tokenXmlPath);
        const [xml, expectedXml] = await Promise.all([
          readFilePromise(xmlPath),
          readFilePromise(expectedXmlPath),
        ]);

        expect(xml).toBe(expectedXml.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
    );
  });

  it('should compile SquareGame.jack', async () => {
    const jackPath = './test/res/Square/SquareGame.jack';
    const tokenXmlPath = './test/res/Square/SquareGame.xml';
    const xmlPath = './test/res/Square/Main.xml';
    const expectedTokenXmlPath = './test/res/expected/Square/SquareGameT.xml';
    const expectedXmlPath = './test/res/expected/Square/Main.xml';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);

        const [tokenXml, expectedTokenXml] = await Promise.all([
          readFilePromise(tokenXmlPath),
          readFilePromise(expectedTokenXmlPath),
        ]);

        expect(tokenXml).toBe(expectedTokenXml.replace(/\r/g, '').trim());

        await compilationEngine(tokenXmlPath);
        const [xml, expectedXml] = await Promise.all([
          readFilePromise(xmlPath),
          readFilePromise(expectedXmlPath),
        ]);

        expect(xml).toBe(expectedXml.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
    );
  });

  it('should compile a directory', async () => {
    await fileTestTemplate(
      () => jackAnalyzer('./test/res/Square'),
      './test/res/Square/SquareT.xml',
      './test/res/Square/SquareGameT.xml',
      './test/res/Square/MainT.xml',
      './test/res/Square/Square.xml',
      './test/res/Square/SquareGame.xml',
      './test/res/Square/Main.xml',
    );
  });
});
