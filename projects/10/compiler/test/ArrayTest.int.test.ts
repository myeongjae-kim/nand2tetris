import { describe, expect, it } from 'vitest';
import { jackAnalyzer } from '../src/jackAnalyzer';
import { fileTestTemplate } from './testHelper';
import { readFilePromise } from '../src/readFilePromise';
import { compilationEngine } from '../src/compilationEngine';

describe('ArrayTest', () => {
  it('should compile Main.jack', async () => {
    const jackPath = './test/res/ArrayTest/Main.jack';
    const tokenXmlPath = './test/res/ArrayTest/MainT.xml';
    const xmlPath = './test/res/ArrayTest/Main.xml';
    const expectedTokenXmlPath = './test/res/expected/ArrayTest/MainT.xml';
    const expectedXmlPath = './test/res/expected/ArrayTest/Main.xml';

    await fileTestTemplate(async () => {
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
    }, tokenXmlPath);
  });
});
