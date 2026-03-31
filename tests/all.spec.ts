import { test, expect } from '@playwright/test';

const BASE = 'https://www.saucedemo.com';
const USER = 'standard_user';
const PASS = 'secret_sauce';

async function login(page: any) {
  await page.goto(BASE);
  await page.fill('#user-name', USER);
  await page.fill('#password', PASS);
  await page.click('#login-button');
  await page.waitForURL(/inventory/);
}

// ==================== LOGIN ====================
test.describe('Login', () => {
  test('login com sucesso', async ({ page }) => {
    await page.goto(BASE);
    await page.fill('#user-name', USER);
    await page.fill('#password', PASS);
    await page.click('#login-button');
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('login com usuario invalido', async ({ page }) => {
    await page.goto(BASE);
    await page.fill('#user-name', 'usuario_errado');
    await page.fill('#password', PASS);
    await page.click('#login-button');
    const erro = await page.locator('[data-test="error"]').textContent();
    expect(erro).toContain('Username and password do not match');
  });

  test('login com senha invalida', async ({ page }) => {
    await page.goto(BASE);
    await page.fill('#user-name', USER);
    await page.fill('#password', 'senha_errada');
    await page.click('#login-button');
    const erro = await page.locator('[data-test="error"]').textContent();
    expect(erro).toContain('Username and password do not match');
  });

  test('login com usuario bloqueado', async ({ page }) => {
    await page.goto(BASE);
    await page.fill('#user-name', 'locked_out_user');
    await page.fill('#password', PASS);
    await page.click('#login-button');
    const erro = await page.locator('[data-test="error"]').textContent();
    expect(erro).toContain('Sorry, this user has been locked out');
  });
});

// ==================== PRODUTOS ====================
test.describe('Produtos', () => {
  test('exibe lista de produtos', async ({ page }) => {
    await login(page);
    const itens = page.locator('.inventory_item_name');
    await expect(itens.first()).toBeVisible();
  });

  test('ordena de A a Z', async ({ page }) => {
    await login(page);
    await page.selectOption('.product_sort_container', { label: 'Name (A to Z)' });
    const titulos = await page.locator('.inventory_item_name').allTextContents();
    expect(titulos).toEqual([...titulos].sort());
  });

  test('ordena de Z a A', async ({ page }) => {
    await login(page);
    await page.selectOption('.product_sort_container', { label: 'Name (Z to A)' });
    const titulos = await page.locator('.inventory_item_name').allTextContents();
    expect(titulos).toEqual([...titulos].sort().reverse());
  });

  test('ordena por menor preco', async ({ page }) => {
    await login(page);
    await page.selectOption('.product_sort_container', { label: 'Price (low to high)' });
    const precos = (await page.locator('.inventory_item_price').allTextContents())
      .map((p: string) => parseFloat(p.replace('$', '')));
    for (let i = 0; i < precos.length - 1; i++) {
      expect(precos[i]).toBeLessThanOrEqual(precos[i + 1]);
    }
  });

  test('exibe detalhes do produto', async ({ page }) => {
    await login(page);
    await page.click('.inventory_item_name');
    await expect(page.locator('.inventory_details_name')).toBeVisible();
    await expect(page.locator('.inventory_details_price')).toBeVisible();
  });
});

// ==================== CARRINHO ====================
test.describe('Carrinho', () => {
  test('adiciona produto ao carrinho', async ({ page }) => {
    await login(page);
    await page.locator('button[id^="add-to-cart"]').first().click();
    const badge = await page.locator('.shopping_cart_badge').textContent();
    expect(badge).toBe('1');
  });

  test('adiciona dois produtos ao carrinho', async ({ page }) => {
    await login(page);
    await page.locator('button[id^="add-to-cart"]').nth(0).click();
    await page.locator('button[id^="add-to-cart"]').nth(1).click();
    const badge = await page.locator('.shopping_cart_badge').textContent();
    expect(badge).toBe('2');
  });

  test('remove produto do carrinho', async ({ page }) => {
    await login(page);
    await page.locator('button[id^="add-to-cart"]').first().click();
    await page.locator('button[id^="remove"]').first().click();
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('visualiza produto dentro do carrinho', async ({ page }) => {
    await login(page);
    await page.locator('button[id^="add-to-cart"]').first().click();
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('.cart_item').first()).toBeVisible();
  });
});

// ==================== CHECKOUT ====================
test.describe('Checkout', () => {
  test('inicia processo de checkout', async ({ page }) => {
    await login(page);
    await page.locator('button[id^="add-to-cart"]').first().click();
    await page.click('.shopping_cart_link');
    await page.click('#checkout');
    await expect(page).toHaveURL(/checkout-step-one/);
  });

  test('avanca para resumo ao preencher dados', async ({ page }) => {
    await login(page);
    await page.locator('button[id^="add-to-cart"]').first().click();
    await page.click('.shopping_cart_link');
    await page.click('#checkout');
    await page.fill('#first-name', 'Isaias');
    await page.fill('#last-name', 'Dantas');
    await page.fill('#postal-code', '58700000');
    await page.click('#continue');
    await expect(page).toHaveURL(/checkout-step-two/);
  });

  test('erro ao continuar sem preencher dados', async ({ page }) => {
    await login(page);
    await page.locator('button[id^="add-to-cart"]').first().click();
    await page.click('.shopping_cart_link');
    await page.click('#checkout');
    await page.click('#continue');
    const erro = await page.locator('[data-test="error"]').textContent();
    expect(erro).toContain('First Name is required');
  });

  test('finaliza compra com sucesso', async ({ page }) => {
    await login(page);
    await page.locator('button[id^="add-to-cart"]').first().click();
    await page.click('.shopping_cart_link');
    await page.click('#checkout');
    await page.fill('#first-name', 'Isaias');
    await page.fill('#last-name', 'Dantas');
    await page.fill('#postal-code', '58700000');
    await page.click('#continue');
    await page.click('#finish');
    await expect(page).toHaveURL(/checkout-complete/);
    const confirmacao = await page.locator('.complete-header').textContent();
    expect(confirmacao).toContain('Thank you for your order');
  });
});
