import { JOHN, LINDA, MICHAEL, ROOT } from './support/family';
import { allCardTitles, field, memberCard } from './support/locators';
import { expect, test } from './support/test';

test.describe('the signed-in member\'s family', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('John Robert Doe')).toBeVisible();
    });

    test('shows the member and spouse, then a divider, then descendants oldest first', async ({ page }) => {
        await expect(allCardTitles(page)).toHaveText([
            'John Robert Doe', 'Linda Doe',
            'Daniel Doe Jr', 'Michael Doe', 'Emily Doe',
        ]);
        await expect(page.locator('hr')).toHaveCount(1);
    });

    test('lists every field the member has, in a fixed order, with mailto and tel links', async ({ page }) => {
        const john = memberCard(page, 'John Robert Doe');

        await expect(john.locator('b')).toHaveText(['Birthday:', 'Email:', 'Mobile Phone:', 'Landline Phone:', 'Address:']);
        await expect(field(john, 'Birthday')).toHaveText('Birthday:January 20, 1965');
        await expect(field(john, 'Email').getByRole('link')).toHaveAttribute('href', 'mailto:john.doe@example.com');
        await expect(field(john, 'Email').getByRole('link')).toHaveText('john.doe@example.com');
        await expect(field(john, 'Mobile Phone').getByRole('link')).toHaveText('+1 312 555 0102');
        await expect(field(john, 'Mobile Phone').getByRole('link')).toHaveAttribute('href', 'tel:+13125550102');
        await expect(field(john, 'Landline Phone').getByRole('link')).toHaveText('+1 312-555-0103');
        await expect(field(john, 'Landline Phone').getByRole('link')).toHaveAttribute('href', 'tel:+13125550103');
        expect(await field(john, 'Address').locator('p').nth(1).innerText()).toBe('200 Elm Avenue\nApt 4B\nChicago, IL 60601');
    });

    test('leaves out fields a member does not have', async ({ page }) => {
        await expect(memberCard(page, 'Linda Doe').locator('b')).toHaveText(['Birthday:', 'Email:', 'Mobile Phone:']);
        await expect(memberCard(page, 'Michael Doe').locator('b')).toHaveText(['Birthday:']);
        await expect(memberCard(page, 'Daniel Doe Jr').locator('b')).toHaveText(['Birthday:']);
    });

    test('each descendant card links down to that descendant\'s family', async ({ page, backend }) => {
        await memberCard(page, 'Michael Doe').getByRole('button', { name: 'Go to Descendant' }).click();

        await expect(allCardTitles(page)).toHaveText(['Michael Doe']);
        expect(backend.requests('GET', '/get').at(-1)?.query).toEqual({ id: MICHAEL });
        await expect(page.locator('hr')).toHaveCount(0);
    });

    test('the arrow above the family goes up to the ancestor\'s family', async ({ page, backend }) => {
        await page.getByRole('button', { name: 'Go to Ancestor' }).click();

        await expect(allCardTitles(page)).toHaveText(['Robert James Doe Sr', 'Mary Ann Doe', 'John Robert Doe', 'Susan Doe']);
        expect(backend.requests('GET', '/get').at(-1)?.query).toEqual({ id: ROOT });
    });

    test('the root family has no arrow up', async ({ page }) => {
        await page.getByRole('button', { name: 'Go to Ancestor' }).click();
        await expect(allCardTitles(page).first()).toHaveText('Robert James Doe Sr');

        await expect(page.getByRole('button', { name: 'Go to Ancestor' })).toHaveCount(0);
    });

    test('shows a deceased member\'s deathday after the birthday', async ({ page }) => {
        await page.getByRole('button', { name: 'Go to Ancestor' }).click();
        const robert = memberCard(page, 'Robert James Doe Sr');

        await expect(robert.locator('b')).toHaveText(['Birthday:', 'Deathday:']);
        await expect(field(robert, 'Birthday')).toHaveText('Birthday:March 15, 1940');
        await expect(field(robert, 'Deathday')).toHaveText('Deathday:November 2, 2015');
    });

    test('a two-line address keeps its line break', async ({ page }) => {
        await page.getByRole('button', { name: 'Go to Ancestor' }).click();
        const mary = memberCard(page, 'Mary Ann Doe');

        await expect(mary.locator('b')).toHaveText(['Birthday:', 'Email:', 'Landline Phone:', 'Address:']);
        expect(await field(mary, 'Address').locator('p').nth(1).innerText()).toBe('100 Oak Street\nSpringfield, IL 62701');
    });

    test('replaces the family with a spinner, below the title bar, while the next one loads', async ({ page, backend }) => {
        const hold = backend.holdNext('GET', '/get');

        await page.getByRole('button', { name: 'Go to Ancestor' }).click();
        await hold.arrived;

        await expect(page.getByRole('progressbar')).toBeVisible();
        await expect(page.getByRole('banner')).toBeVisible();
        await expect(allCardTitles(page)).toHaveCount(0);
        hold.release();
        await expect(allCardTitles(page).first()).toHaveText('Robert James Doe Sr');
        await expect(page.getByRole('progressbar')).toHaveCount(0);
    });
});

test.describe('card order', () => {
    test('a spouse signed in sees their own card first in their own family', async ({ page, backend }) => {
        backend.signInAs = LINDA;

        await page.goto('/');

        await expect(allCardTitles(page)).toHaveText([
            'Linda Doe', 'John Robert Doe',
            'Daniel Doe Jr', 'Michael Doe', 'Emily Doe',
        ]);
    });

    test('a spouse signed in still sees their own card first when they navigate back to their family', async ({ page, backend }) => {
        backend.signInAs = LINDA;
        await page.goto('/');
        await page.getByRole('button', { name: 'Go to Ancestor' }).click();
        await memberCard(page, 'John Robert Doe').getByRole('button', { name: 'Go to Descendant' }).click();

        await expect(allCardTitles(page)).toHaveText([
            'Linda Doe', 'John Robert Doe',
            'Daniel Doe Jr', 'Michael Doe', 'Emily Doe',
        ]);
        expect(backend.requests('GET', '/get').at(-1)?.query).toEqual({ id: JOHN });
    });
});

test.describe('dates', () => {
    for (const timezoneId of ['Pacific/Honolulu', 'Asia/Tokyo']) {
        test.describe(`in ${timezoneId}`, () => {
            test.use({ timezoneId });

            test('are shown as the stored calendar date', async ({ page }) => {
                await page.goto('/');

                await expect(field(memberCard(page, 'John Robert Doe'), 'Birthday')).toHaveText('Birthday:January 20, 1965');
            });
        });
    }
});

test.describe('server errors', () => {
    test('are retried, up to three attempts in all', async ({ page, backend }) => {
        backend.failNext('GET', '/get', 500, 2);

        await page.goto('/');

        await expect(page.getByText('John Robert Doe')).toBeVisible();
        expect(backend.requests('GET', '/get')).toHaveLength(3);
    });

    test('current behavior @quirk: a first load that fails three times leaves a blank page with no title bar', async ({ page, backend }) => {
        backend.failNext('GET', '/get', 500, 3);
        const errors: Error[] = [];
        page.on('pageerror', error => errors.push(error));

        await page.goto('/');

        await expect.poll(() => errors.length).toBeGreaterThan(0);
        await expect(page.getByRole('banner')).toHaveCount(0);
        await expect(page.locator('#root')).toBeEmpty();
        expect(backend.requests('GET', '/get')).toHaveLength(3);
    });

    test('current behavior @quirk: a navigation that fails three times leaves the spinner up for good', async ({ page, backend }) => {
        await page.goto('/');
        await expect(page.getByText('John Robert Doe')).toBeVisible();
        backend.failNext('GET', '/get', 500, 3);

        await page.getByRole('button', { name: 'Go to Ancestor' }).click();
        await expect.poll(() => backend.requests('GET', '/get').length).toBe(4);
        await page.clock.runFor(60_000);

        await expect(page.getByRole('progressbar')).toBeVisible();
        await expect(allCardTitles(page)).toHaveCount(0);
        await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('current behavior @quirk: a member that no longer exists leaves the spinner up for good, without retrying', async ({ page, backend }) => {
        await page.goto('/');
        await expect(page.getByText('John Robert Doe')).toBeVisible();
        backend.store.members.delete(ROOT);

        await page.getByRole('button', { name: 'Go to Ancestor' }).click();

        await expect(page.getByRole('progressbar')).toBeVisible();
        await page.clock.runFor(60_000);
        expect(backend.requests('GET', '/get')).toHaveLength(2);
    });
});
