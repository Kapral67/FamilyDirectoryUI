import { readFile } from 'node:fs/promises';
import { SURNAME } from './support/env';
import { JOHN, MICHAEL } from './support/family';
import { allCardTitles, memberCard } from './support/locators';
import { expect, test } from './support/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('John Robert Doe')).toBeVisible();
});

test('names the tab and the title bar after the family surname', async ({ page }) => {
    await expect(page).toHaveTitle(`${SURNAME} Family Directory`);
    const banner = page.getByRole('banner');
    await expect(banner.getByRole('link', { name: `${SURNAME} Family Directory` })).toHaveAttribute('href', '/');
    await expect(banner.getByRole('button')).toHaveCount(2);
    await expect(banner.getByRole('button', { name: 'Download' })).toBeVisible();
    await expect(banner.getByRole('button', { name: 'Logout' })).toBeVisible();
});

test('the title link reloads the page back to the caller\'s own family', async ({ page, backend }) => {
    await memberCard(page, 'Michael Doe').getByRole('button', { name: 'Go to Descendant' }).click();
    await expect(allCardTitles(page)).toHaveText(['Michael Doe']);
    expect(backend.requests('GET', '/get').at(-1)?.query).toEqual({ id: MICHAEL });

    await page.getByRole('link', { name: `${SURNAME} Family Directory` }).click();

    await expect(page.getByText('John Robert Doe')).toBeVisible();
    expect(backend.requests('GET', '/get').at(-1)?.query).toEqual({});
});

test.describe('Download', () => {
    test('saves the directory PDF as <Surname>FamilyDirectory.pdf', async ({ page, backend }) => {
        const download = page.waitForEvent('download');

        await page.getByRole('button', { name: 'Download' }).click();

        const file = await download;
        expect(file.suggestedFilename()).toBe(`${SURNAME}FamilyDirectory.pdf`);
        expect(await readFile(await file.path())).toEqual(backend.pdf.body);
        expect(backend.presignedUrlRequests).toHaveLength(1);
        expect(backend.requests('GET', '/pdf')).toEqual([{
            method: 'GET', path: '/pdf', query: {}, body: undefined,
            authorization: `Bearer ${backend.accessTokenFor(JOHN)}`,
        }]);
    });

    test('saves a zip response as <Surname>Family.zip', async ({ page, backend }) => {
        backend.pdf = { contentType: 'application/zip', body: Buffer.from('PK\u0003\u0004 e2e fake zip') };
        const download = page.waitForEvent('download');

        await page.getByRole('button', { name: 'Download' }).click();

        expect((await download).suggestedFilename()).toBe(`${SURNAME}Family.zip`);
    });

    test('swaps the button for a disabled spinner while the file is fetched', async ({ page, backend }) => {
        const hold = backend.holdNext('GET', '/pdf');
        const banner = page.getByRole('banner');

        await banner.getByRole('button', { name: 'Download' }).click();
        await hold.arrived;

        await expect(banner.getByRole('button', { name: 'Download' })).toHaveCount(0);
        await expect(banner.getByRole('progressbar')).toBeVisible();
        await expect(banner.getByRole('button').first()).toBeDisabled();
        const download = page.waitForEvent('download');
        hold.release();
        await download;
        await expect(banner.getByRole('button', { name: 'Download' })).toBeEnabled();
        await expect(banner.getByRole('progressbar')).toHaveCount(0);
    });

    test('a download that fails three times restores the button without any message', async ({ page, backend }) => {
        backend.failNext('GET', '/pdf', 500, 3);
        let downloaded = false;
        page.on('download', () => (downloaded = true));

        await page.getByRole('button', { name: 'Download' }).click();
        await expect.poll(() => backend.requests('GET', '/pdf').length).toBe(3);

        await expect(page.getByRole('button', { name: 'Download' })).toBeEnabled();
        await expect(page.getByRole('alert')).toHaveCount(0);
        expect(downloaded).toBe(false);
    });
});

test('shows tooltips on the title bar buttons', async ({ page }) => {
    for (const name of ['Download', 'Logout']) {
        await page.getByRole('button', { name }).hover();
        await expect(page.getByRole('tooltip', { name })).toBeVisible();
        await page.mouse.move(0, 400);
        await expect(page.getByRole('tooltip')).toHaveCount(0);
    }
});
