import type { Locator, Page } from '@playwright/test';

export function memberCard(page: Page, fullName: string): Locator {
    return page.locator('.MuiCard-root').filter({
        has: page.locator('.MuiCardHeader-title').getByText(fullName, { exact: true }),
    });
}

export function allCardTitles(page: Page): Locator {
    return page.locator('.MuiCard-root .MuiCardHeader-title');
}

export function field(card: Locator, label: string): Locator {
    return card.locator('.MuiGrid-item').filter({ has: card.page().getByText(`${label}:`, { exact: true }) });
}
