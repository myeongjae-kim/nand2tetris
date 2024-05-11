import { describe, expect, it } from 'vitest';
import { jackAnalyzer } from '../src/jackAnalyzer';
import { fileTestTemplate } from './testHelper';
import { readFilePromise } from '../src/readFilePromise';

describe('ArrayTest', () => {
  it('should compile Main.jack', async () => {
    const jackPath = './test/res/ArrayTest/Main.jack';
    const tokenXmlPath = './test/res/ArrayTest/MainT.xml';
    const expectedTokenXmlPath = './test/res/expected/ArrayTest/MainT.xml';

    await fileTestTemplate(async () => {
      await jackAnalyzer(jackPath);

      const [xml, expectedXml] = await Promise.all([
        readFilePromise(tokenXmlPath),
        readFilePromise(expectedTokenXmlPath),
      ]);

      expect(xml).toBe(expectedXml.replace(/\r/g, '').trim());
    }, tokenXmlPath);
  });
});
