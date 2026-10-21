import { test as base, expect } from '@playwright/test';
import { FIXED_NOW } from './env';
import { FakeBackend } from './fakeBackend';

export const test = base.extend<{ backend: FakeBackend }>({
    backend: [async ({ page, context }, use) => {
        await page.clock.install({ time: FIXED_NOW });
        const backend = new FakeBackend();
        await backend.install(context);
        await use(backend);
        await backend.dispose();
        expect(backend.unexpectedRequests, 'requests that left the fake backend').toEqual([]);
    }, { auto: true }],
});

export { expect };
