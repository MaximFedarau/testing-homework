const clearWindow = async (browser) => {
    await browser.mockClearAll()
    await browser.closeWindow();
} 

describe("Каталог работает корректно.", async function() {
    describe("Карточка товара в каталоге должна содержать всю информацию с сервера.", async function() {
        beforeEach(async function() {
            const mock = await this.browser.mock("http://localhost:3000/hw/store/api/products", {
                method: 'get'
            })

            mock.respond([{
                id: 0,
                name: "Product1",
                price: 100,
            }, {
                id: 1,
                name: "Product2",
                price: 200,
            }])

            await this.browser.url("http://localhost:3000/hw/store/catalog");
        })

        afterEach(async function() {
            await this.browser.mockRestoreAll();
        })

        it("При ширине экрана больше 576px карточка товара в каталоге должна содержать всю информацию с сервера.", async function() {
            const product = await this.browser.$("div[data-testid=\"0\"]");
            await product.assertView("plain");
        })

        it("При ширине экрана меньше 576px карточка товара в каталоге должна содержать всю информацию с сервера.", async function() {
            await this.browser.setWindowSize(572, 4320);
            const product = await this.browser.$("div[data-testid=\"0\"]");
            await product.assertView("plain");
        })
    })

    describe("Карточка товара на странице товара должна содержать всю информацию с сервера.", async function() {
        beforeEach(async function() {
            const mock = await this.browser.mock("http://localhost:3000/hw/store/api/products/0", {
                method: 'get'
            })

            mock.respond({
                id: 0,
                name: "Product1",
                price: 100,
                description: "desc",
                color: "red",
                material: "fresh",
            },)

            await this.browser.url("http://localhost:3000/hw/store/catalog/0");
        })

        afterEach(async function() {
            await this.browser.mockRestoreAll();
        })

        it("При ширине экрана больше 576px карточка товара на странице товара должна содержать всю информацию с сервера.", async function() {
            const product = await this.browser.$(".Product");
            await product.assertView("plain");
        })

        it("При ширине экрана меньше 576px карточка товара на странице товара должна содержать всю информацию с сервера.", async function() {
            await this.browser.setWindowSize(572, 4320);
            const product = await this.browser.$(".Product");
            await product.assertView("plain");
        })
    })

    describe("Сервер присылает корректные данные.", async function () {
        const checkProductPartExistence = async (productPart) => {
            const isExisting = await productPart.isExisting();
            expect(isExisting).toBe(true);
            const text = await productPart.getText();
            expect(Boolean(text)).toBe(true);
        }
        it("На странице каталога сервер присылает корректные данные о всех товарах.", async function () {
            await this.browser.url("http://localhost:3000/hw/store/catalog")
    
            // ждем появления карточек с продуктами
            const productItem = await this.browser.$('.card');
            await this.browser.waitUntil(async function() {
            return await productItem.isExisting();
            }, {
                timeout: 5000,
                timeoutMsg: 'Expected ProductItem to render after 5s.'
            })
    
            const productId = await productItem.getAttribute("data-testid");
    
            const productItemName = await productItem.$(".ProductItem-Name");
            await checkProductPartExistence(productItemName);
    
            const productItemPrice = await productItem.$('.ProductItem-Price');
            await checkProductPartExistence(productItemPrice);
    
            const productItemLink = await productItem.$('.ProductItem-DetailsLink');
            await checkProductPartExistence(productItemLink);
            const linkToProductPage = (await productItemLink.getAttribute("href")).replaceAll("/hw/store", "");
            expect(linkToProductPage).toBe(`/catalog/${productId}`)
        })

        it("На странице продукта сервер присылает корректные данные о товаре.", async function() {
            await this.browser.url("http://localhost:3000/hw/store/catalog")
    
            // ждем появления карточек с продуктами
            const productItem = await this.browser.$('.card');
            await this.browser.waitUntil(async function() {
            return await productItem.isExisting();
            }, {
                timeout: 5000,
                timeoutMsg: 'Expected ProductItem to render after 5s.'
            })
    
            const productId = await productItem.getAttribute("data-testid");

            await this.browser.url(`http://localhost:3000/hw/store/catalog/${productId}`)

            const productItemName = await this.browser.$(".ProductDetails-Name");
            await checkProductPartExistence(productItemName);

            const productItemDescription = await this.browser.$(".ProductDetails-Description");
            await checkProductPartExistence(productItemDescription);

            const productItemPrice = await this.browser.$(".ProductDetails-Price");
            await checkProductPartExistence(productItemPrice);

            const productItemColor = await this.browser.$(".ProductDetails-Color");
            await checkProductPartExistence(productItemColor);

            const productItemMaterial = await this.browser.$(".ProductDetails-Material");
            await checkProductPartExistence(productItemMaterial);
        })

        it("На странице каталога отсутствуют дупликаты.", async function() {
            await this.browser.url("http://localhost:3000/hw/store/catalog")
    
            // ждем появления карточек с продуктами
            const productItem = await this.browser.$('.card');
            await this.browser.waitUntil(async function() {
            return await productItem.isExisting();
            }, {
                timeout: 5000,
                timeoutMsg: 'Expected ProductItem to render after 5s.'
            })
    
            const productId = await productItem.getAttribute("data-testid");

            const cardsWithTheSameId = await this.browser.$$(`div[data-testid="${productId}"]`)
            expect(cardsWithTheSameId.length).toBe(2); // cама карточка и ее контент
        })

        const getProductInfo = async (browser, productId) => {
            await browser.url(`http://localhost:3000/hw/store/catalog/${productId}`);

            const productCard = await browser.$('.ProductDetails');
            await browser.waitUntil(async function() {
                return await productCard.isExisting();
            }, {
                timeout: 5000,
                timeoutMsg: `Expected Product page with id=${productId} to render after 5s.`
            })
            
            const elementsClassNames = [".ProductDetails-Name", ".ProductDetails-Description", ".ProductDetails-Price", ".ProductDetails-Color", ".ProductDetails-Material"];
            const result = [];
            for (let i = 0; i < elementsClassNames.length; ++i) {
                const selector = elementsClassNames[i];
                const element = await browser.$(selector);
                const data = await element.getText();
                result.push(data);
            }
            return result;
        }

        it("На странице продуктов отсутствуют дупликаты.", async function() {
            await this.browser.url("http://localhost:3000/hw/store/catalog")
    
            // ждем появления карточек с продуктами
            const productItem = await this.browser.$('.card');
            await this.browser.waitUntil(async function() {
            return await productItem.isExisting();
            }, {
                timeout: 5000,
                timeoutMsg: 'Expected ProductItem to render after 5s.'
            })

            const products = await this.browser.$$('.card');
            const firstProductId = await products[0].getAttribute("data-testid");
            const secondProductId = await products[1].getAttribute("data-testid");

            const firstProductInfo = await getProductInfo(this.browser, firstProductId);
            const secondProductInfo = await getProductInfo(this.browser, secondProductId);

            expect(firstProductInfo).not.toStrictEqual(secondProductInfo);
        })
    })
})