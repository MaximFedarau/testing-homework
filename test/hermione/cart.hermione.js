const checkCartProductExistence = async (browser, productId) => {
    const productRow = await browser.$(`tr[data-testid="${productId}"]`);
    const isProductRowExisting = await productRow.isExisting();
    expect(isProductRowExisting).toBe(true);
    const productCountText = await productRow.$('.Cart-Count').getText();
    expect(productCountText).toBe("2");
}

const addToCartAndReloadTest = async (browser, isSmallWidthScreen = false) => {
    if (isSmallWidthScreen) await browser.setWindowSize(572, 4320);
    else await browser.setWindowSize(1920, 1080);

    // переходим на страницу с каталогом
    await browser.url("http://localhost:3000/hw/store/catalog");

    // ждем появления карточек с продуктами
    const productItem = await browser.$('.card');
    await browser.waitUntil(async function() {
    return await productItem.isExisting();
    }, {
        timeout: 5000,
        timeoutMsg: 'Expected ProductItem to render after 5s.'
    })

    // берем уникальный id продукта
    const productId = await productItem.getAttribute("data-testid");

    // переходим на страницу с продуктом
    const detailsLink = await productItem.$(".card-link");
    await detailsLink.click();

    //ждем появления продукта
    const productCard = await browser.$('.ProductDetails');
    await browser.waitUntil(async function() {
        return await productCard.isExisting();
    }, {
        timeout: 5000,
        timeoutMsg: 'Expected Product page to render after 5s.'
    })

    // добавляем товар в корзину
    const button = await browser.$(".ProductDetails-AddToCart");
    await button.click();
    
    // проверка отображения сообщения о добавлении в корзину на странице продукта
    const productCartBadge = await browser.$('.CartBadge');
    await browser.waitUntil(async function() {
        return await productCartBadge.isExisting();
    }, {
        timeout: 5000,
        timeoutMsg: 'Expected Product CartBadge to render after 5s.'
    })

    await button.click() // добавляем второй раз

    // проверка отображения сообщения о добавлении в корзину на странице каталога
    await browser.url("http://localhost:3000/hw/store/catalog");

    const catalogCartBadge = await browser.$(`div[data-testid="${productId}"]`).$('.CartBadge');
    await browser.waitUntil(async function() {
        return await catalogCartBadge.isExisting();
    }, {
        timeout: 5000,
        timeoutMsg: 'Expected Catalog CartBadge to render after 5s.'
    })
    
    // проверяем, что товар добавился в корзину и что его количество равно 2
    await browser.url("http://localhost:3000/hw/store/cart");

    await checkCartProductExistence(browser, productId);

    // проверяем, что товар никуда не исчез после перезагрузки страницы
    await browser.refresh();

    await checkCartProductExistence(browser, productId);
}

describe("Нажатие на кнопку \"Добавить в корзину\" должно добавлять элемент в корзину, а содержимое корзины должно сохраняться между перезагрузками страницы.", () => {
    afterEach(async function() {
        await this.browser.url("http://localhost:3000/hw/store/cart");
        const button = await this.browser.$(".Cart-Clear");
        await button.click();
    })

    it("При ширине экрана больше 576px нажатие на кнопку \"Добавить в корзину\" должно добавлять элемент в корзину, а содержимое корзины должно сохраняться между перезагрузками страницы.", async function() {
        await addToCartAndReloadTest(this.browser);
    })

    it("При ширине экрана меньше 576px нажатие на кнопку \"Добавить в корзину\" должно добавлять элемент в корзину, а содержимое корзины должно сохраняться между перезагрузками страницы.", async function() {
        await addToCartAndReloadTest(this.browser, true);
    })
})