import { describe, expect, it } from 'vitest';
import { jackAnalyzer } from '../../src/jackAnalyzer';
import { fileTestTemplate } from '../testHelper';
import { readFilePromise } from '../../src/readFilePromise';
import { compilationEngine } from '../../src/compilationEngine';

describe('PongTest', () => {
  it('should compile Main.jack', async () => {
    const jackPath = './test/res/11/Pong/Main.jack';
    const tokenXmlPath = './test/res/11/Pong/MainT.xml';
    const xmlPath = './test/res/11/Pong/Main.xml';
    const vmPath = './test/res/11/Pong/Main.vm';
    const expectedVmPath = './test/res/11/expected/Pong/Main.vm';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);
        await compilationEngine({ tokenXmlPaths: [tokenXmlPath], printVmCode: true });

        const [vm, expectedVm] = await Promise.all([
          readFilePromise(vmPath),
          readFilePromise(expectedVmPath),
        ]);

        expect(vm).toBe(expectedVm.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
      vmPath,
    );
  });

  it('should compile Ball.jack', async () => {
    const jackPath = './test/res/11/Pong/Ball.jack';
    const tokenXmlPath = './test/res/11/Pong/BallT.xml';
    const xmlPath = './test/res/11/Pong/Ball.xml';
    const vmPath = './test/res/11/Pong/Ball.vm';
    const expectedVmPath = './test/res/11/expected/Pong/Ball.vm';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);
        await compilationEngine({ tokenXmlPaths: [tokenXmlPath], printVmCode: true });

        const [vm, expectedVm] = await Promise.all([
          readFilePromise(vmPath),
          readFilePromise(expectedVmPath),
        ]);

        expect(vm).toBe(expectedVm.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
      vmPath,
    );
  });

  it('should compile Bat.jack', async () => {
    const jackPath = './test/res/11/Pong/Bat.jack';
    const tokenXmlPath = './test/res/11/Pong/BatT.xml';
    const xmlPath = './test/res/11/Pong/Bat.xml';
    const vmPath = './test/res/11/Pong/Bat.vm';
    const expectedVmPath = './test/res/11/expected/Pong/Bat.vm';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);
        await compilationEngine({ tokenXmlPaths: [tokenXmlPath], printVmCode: true });

        const [vm, expectedVm] = await Promise.all([
          readFilePromise(vmPath),
          readFilePromise(expectedVmPath),
        ]);

        expect(vm).toBe(expectedVm.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
      vmPath,
    );
  });

  it('should compile PongGame.jack', async () => {
    const jackPath = './test/res/11/Pong/PongGame.jack';
    const tokenXmlPath = './test/res/11/Pong/PongGameT.xml';
    const xmlPath = './test/res/11/Pong/PongGame.xml';
    const vmPath = './test/res/11/Pong/PongGame.vm';
    const expectedVmPath = './test/res/11/expected/Pong/PongGame.vm';

    await fileTestTemplate(
      async () => {
        await jackAnalyzer(jackPath);
        await compilationEngine({ tokenXmlPaths: [tokenXmlPath], printVmCode: true });

        const [vm, expectedVm] = await Promise.all([
          readFilePromise(vmPath),
          readFilePromise(expectedVmPath),
        ]);

        expect(vm).toBe(expectedVm.trim().replace(/\r/g, ''));
      },
      tokenXmlPath,
      xmlPath,
      vmPath,
    );
  });
});
