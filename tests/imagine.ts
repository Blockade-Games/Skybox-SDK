import { describe, it, expect } from 'vitest';
import { BlockadeLabsSdk } from '@/index';
import { env, readFileAsBuffer } from './utils';

describe.concurrent('Imagine Suite', () => {
  it('Should retrieve Generators', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const styles = await sdk.getGenerators();

    expect(Array.isArray(styles)).toBe(true);
  });

  it('Should create an new imagine', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagine = await sdk.generateImagine({ generator: 'stable', generator_data: { prompt: 'Cat with a Sword' } });

    expect(
      (() => {
        if (!imagine.request.id) return false;

        if (imagine.request.error_message) return false;

        return true;
      })(),
    ).toBe(true);
  });

  it('Should create an new imagine with an Buffer as init_image', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const buffer = await readFileAsBuffer('./mocks/thumb_cat_sword.png');

    const imagine = await sdk.generateImagine({
      generator: 'stable',
      generator_data: { prompt: 'Cat with a Sword', init_image: buffer },
    });

    expect(
      (() => {
        if (!imagine.request.id) return false;

        if (imagine.request.error_message) return false;

        return true;
      })(),
    ).toBe(true);
  });

  it('Should create an new imagine and get him by ID', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagine = await sdk.generateImagine({ generator: 'stable', generator_data: { prompt: 'Cat with a Sword' } });

    const imagineResult = await sdk.getImagineById({ id: imagine.request.id });

    expect(
      (() => {
        if (!imagineResult.request.id) return false;

        if (imagineResult.request.error_message) return false;

        if (imagineResult.request.id !== imagine.request.id) return false;

        return true;
      })(),
    ).toBe(true);
  });

  it('Should create an new imagine and get him by Obfuscated ID', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagine = await sdk.generateImagine({ generator: 'stable', generator_data: { prompt: 'Cat with a Sword' } });

    const imagineResult = await sdk.getImagineByObfuscatedId({ obfuscated_id: imagine.request.obfuscated_id });

    expect(
      (() => {
        if (!imagineResult.request.id) return false;

        if (imagineResult.request.error_message) return false;

        if (imagineResult.request.obfuscated_id !== imagine.request.obfuscated_id) return false;

        return true;
      })(),
    ).toBe(true);
  });

  it('Should retrieve Imagine History', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagineHistory = await sdk.getImagineHistory();

    expect(Array.isArray(imagineHistory.data)).toBe(true);
    expect(imagineHistory.totalCount >= 0).toBe(true);
  });

  it('Should retrieve Imagine History with limit 1', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagineHistory = await sdk.getImagineHistory({ limit: 1 });

    expect(Array.isArray(imagineHistory.data)).toBe(true);
    expect(imagineHistory.data.length <= 1).toBe(true);
    expect(imagineHistory.totalCount <= 1).toBe(true);
  });

  it('Should retrieve Imagine History without the first imagine', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const fistImagineInHistory = (await sdk.getImagineHistory({ limit: 1 })).data[0];

    const imagineHistoryWithOffset = await sdk.getImagineHistory({ offset: 1 });

    expect(
      (() => {
        if (!fistImagineInHistory) return true;

        const firstItem = imagineHistoryWithOffset.data[0];

        if (!firstItem) return true;

        if (firstItem.id !== fistImagineInHistory.id) return true;

        return false;
      })(),
    ).toBe(true);
  });

  it('Should get only completed imagines in history', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagineHistory = await sdk.getImagineHistory({ status: 'complete' });

    expect(
      (() => {
        for (const imagine of imagineHistory.data) {
          if (imagine.status === 'complete') continue;

          return false;
        }

        return true;
      })(),
    ).toBe(true);
  });

  it('Should get imagine history in ASC and DESC order', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagineHistoryAsc = await sdk.getImagineHistory({ order: 'ASC' });
    const imagineHistoryDesc = await sdk.getImagineHistory({ order: 'DESC' });

    // ASC test
    expect(
      (() => {
        if (imagineHistoryAsc.data.length < 2 || imagineHistoryDesc.data.length < 2) return true;

        const firstItemDate = new Date(imagineHistoryAsc.data[0]?.created_at || '');
        const secondItemDate = new Date(imagineHistoryAsc.data[1]?.created_at || '');

        if (secondItemDate >= firstItemDate) return true;

        return false;
      })(),
    ).toBe(true);

    // DESC test
    expect(
      (() => {
        if (imagineHistoryAsc.data.length < 2 || imagineHistoryDesc.data.length < 2) return true;

        const firstItemDate = new Date(imagineHistoryDesc.data[0]?.created_at || '');
        const secondItemDate = new Date(imagineHistoryDesc.data[1]?.created_at || '');

        if (firstItemDate >= secondItemDate) return true;

        return false;
      })(),
    ).toBe(true);
  });

  it('Should get only imagines with generator stable-skybox in history', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagineHistory = await sdk.getImagineHistory({ generator: 'stable-skybox' });

    expect(
      (() => {
        for (const imagine of imagineHistory.data) {
          if (imagine.generator === 'stable-skybox') continue;

          return false;
        }

        return true;
      })(),
    ).toBe(true);
  });

  it('Should create an new imagine and find him on imagine history by ID', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagine = await sdk.generateImagine({ generator: 'stable', generator_data: { prompt: 'Dog with a Sword' } });

    const imagineHistory = await sdk.getImagineHistory({ imagine_id: imagine.request.id });

    expect(imagineHistory.totalCount === 1).toBe(true);
    expect(imagineHistory.data[0]?.id === imagine.request.id).toBe(true);
  });

  it('Should create an new imagine and find him on imagine history by Title', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagine = await sdk.generateImagine({ generator: 'stable', generator_data: { prompt: 'Dog with a Sword' } });

    const imagineHistory = await sdk.getImagineHistory({ query: imagine.request.title });

    expect(imagineHistory.totalCount >= 1).toBe(true);
    expect(imagineHistory.data[0]?.id === imagine.request.id).toBe(true);
    expect(imagineHistory.data[0]?.title === imagine.request.title).toBe(true);
  });

  it('Should create an new imagine and find him on imagine history by Prompt', async () => {
    const sdk = new BlockadeLabsSdk({
      api_key: env.api_key,
    });

    const imagine = await sdk.generateImagine({ generator: 'stable', generator_data: { prompt: 'Dog with a Sword' } });

    const imagineHistory = await sdk.getImagineHistory({ query: imagine.request.generator_data.prompt });

    expect(imagineHistory.totalCount >= 1).toBe(true);
    expect(imagineHistory.data[0]?.id === imagine.request.id).toBe(true);
    expect(imagineHistory.data[0]?.generator_data.prompt === imagine.request.generator_data.prompt).toBe(true);
  });
});