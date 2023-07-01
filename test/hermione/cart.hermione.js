const emptyCardScreenshot = async (browser) => {
    await browser.url("http://localhost:3000/hw/store/cart");
    await browser.assertView("plain", "body");
}

describe("Пустая корзина имеет статическое содержимое.", async function() {
    it("Пустая корзина имеет статическое содержимое при ширине экрана больше 576px.", async function() {
        await emptyCardScreenshot(this.browser);
    })

    it("Пустая корзина имеет статическое содержимое при ширине экрана меньше 576px.", async function() {
        await this.browser.setWindowSize(572, 4320);
        await emptyCardScreenshot(this.browser);
    })
}) 

const addToCartAndReloadTest = async (browser, isSmallWidthScreen = false) => {
    if (isSmallWidthScreen) await browser.setWindowSize(572, 4320);
    else await browser.setWindowSize(1920, 1080);

    // проверяем страницу с продуктом
    await browser.url("http://localhost:3000/hw/store/catalog");

    // ждем появления карточек с продуктами
    const productItem = await browser.$('.card');
    await browser.waitUntil(async function() {
    return await productItem.isExisting();
    }, {
        timeout: 5000,
        timeoutMsg: 'Expected ProductItem to render after 5s.'
    })

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

    const button = await browser.$(".ProductDetails-AddToCart");
    await button.click();

    await browser.url("http://localhost:3000/hw/store/cart");

    // проверяем, что товар добавился в корзину
    const table = await browser.$("table");
    const isTableExisting = await table.isExisting();
    expect(isTableExisting).toBe(true);

    // перезагружаем страницу
    await browser.refresh();

    // проверяем, что товар никуда не исчез
    const cartTable = await browser.$("table");
    const isCartTableExisting = await cartTable.isExisting();
    expect(isCartTableExisting).toBe(true);
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