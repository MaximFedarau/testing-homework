const makeAdaptiveScreenshots = async (browser, ignoreElements) => {
    await browser.setWindowSize(1920, 4720);
    await browser.assertView("desktop", "body", {
        ignoreElements,
    });

    await browser.setWindowSize(820, 4720);
    await browser.assertView("tablet", "body", {
        ignoreElements,
    });

    await browser.setWindowSize(375, 4720);
    await browser.assertView("mobile", "body", {
        ignoreElements,
    });
}

describe("Верстка адаптируется под ширину экрана.", async function() {
    it("На главной странице верстка адаптируется под ширину экрана.", async function() {
        await this.browser.url("http://localhost:3000/hw/store");

        await makeAdaptiveScreenshots(this.browser);
    })

    it("На странице каталога верстка адаптируется под ширину экрана.", async function() {
        const productsMock = await this.browser.mock("http://localhost:3000/hw/store/api/products", {
            method: 'get'
        })

        productsMock.respond([{
            id: 0,
            name: "Product1",
            price: 100,
        }, {
            id: 1,
            name: "Product2",
            price: 200,
        },
        {
            id: 2,
            name: "Product3",
            price: 300,
        },
        {
            id: 3,
            name: "Product4",
            price: 400,
        },
        {
            id: 4,
            name: "Product5",
            price: 500,
        },
        {
            id: 5,
            name: "Product6",
            price: 600,
        },
        {
            id: 6,
            name: "Product7",
            price: 700,
        },
        {
            id: 7,
            name: "Product8",
            price: 800,
        }]);

        await this.browser.url("http://localhost:3000/hw/store/catalog");

        // ждем появления карточек
        const productItem = await this.browser.$('.card');
        await this.browser.waitUntil(async function() {
        return await productItem.isExisting();
        }, {
            timeout: 5000,
            timeoutMsg: 'Expected ProductItem to render after 5s.'
        })

        await makeAdaptiveScreenshots(this.browser);

        await this.browser.mockRestoreAll();
    })

    it("На странице с условиями доставки верстка адаптируется под ширину экрана.", async function() {
        await this.browser.url("http://localhost:3000/hw/store/delivery");

        await makeAdaptiveScreenshots(this.browser);
    })

    it("На странице с контактами верстка адаптируется под ширину экрана.", async function() {
        await this.browser.url("http://localhost:3000/hw/store/contacts");

        await makeAdaptiveScreenshots(this.browser);
    })

    it("На странице с пустой корзиной верстка адаптируется под ширину экрана.", async function() {
        await this.browser.url("http://localhost:3000/hw/store/cart");

        await makeAdaptiveScreenshots(this.browser);
    })

    it("На странице с заполненной корзиной верстка адаптируется под ширину экрана.", async function() {
        await this.browser.url("http://localhost:3000/hw/store/cart");

        await this.browser.execute(() => localStorage.setItem('example-store-cart', JSON.stringify({0: {
            name: "Product1",
            price: 100,
            count: 4,
          }})))
        await this.browser.refresh();

        await makeAdaptiveScreenshots(this.browser);

        await this.browser.execute(() => localStorage.setItem('example-store-cart', {}));
    })
})