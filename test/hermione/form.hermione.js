const axios = require("axios");

describe("Форма заказа работает корректно.", async function() {
    describe("Заказ с верными данными обрабатывается успешно.", async function () {
        beforeEach(async function() {
            await this.browser.url('http://localhost:3000/hw/store/cart');
            await this.browser.execute(() => localStorage.setItem('example-store-cart', JSON.stringify({0: {
                name: "Product1",
                price: 100,
                count: 4,
              }})))
            await this.browser.refresh();
        })
    
        afterEach(async function() {
            await this.browser.execute(() => localStorage.setItem('example-store-cart', {}));
        })

        const formSubmitionTest = async (browser, isSmallWidthScreen = false) => {
            if (isSmallWidthScreen) await browser.setWindowSize(572, 4320);

            const form = await browser.$('.Form');
            const ifFormExisting = await form.isExisting();
            expect(ifFormExisting).toBe(true);

            const nameInput = await browser.$('#f-name');
            const isNameInputExisting = await nameInput.isExisting();
            expect(isNameInputExisting).toBe(true);
            await nameInput.setValue('test');

            const phoneInput = await browser.$('#f-phone');
            const isPhoneInputExisting = await phoneInput.isExisting();
            expect(isPhoneInputExisting).toBe(true);
            await phoneInput.setValue('88005553535');

            const addressInput = await browser.$('#f-address');
            const isAddressInputExisting = await addressInput.isExisting();
            expect(isAddressInputExisting).toBe(true);
            await addressInput.setValue('Some Street');

            const submitButton = await browser.$('.Form-Submit');
            const isSubmitButtonExisting = await submitButton.isExisting();
            expect(isSubmitButtonExisting).toBe(true);
            await submitButton.click();

            const successModal = await browser.$('.Cart-SuccessMessage');
            await browser.waitUntil(async function() {
            return await successModal.isExisting();
            }, {
                timeout: 5000,
                timeoutMsg: 'Expected Success Modal to render after 5s.'
            })
            
            await successModal.assertView("plain", {
                ignoreElements: ["p"],
            })
        }

        it("При ширине экрана больше 576px заказ с верными данными обрабатывается успешно.", async function() {
            await formSubmitionTest(this.browser);
        })

        it("При ширине экрана меньше 576px заказ с верными данными обрабатывается успешно.", async function() {
            await formSubmitionTest(this.browser, true);
        })
    })

    const makeAnOrder = async () => await axios.post('http://localhost:3000/hw/store/api/checkout', { form: {}, cart: {} });

    it("Сервер присылает корректные данные заказа.", async function() {
        const result1 = await this.browser.call(async () => await makeAnOrder());
        await this.browser.pause(100);
        const result2 = await this.browser.call(async () => await makeAnOrder());
        
        // проверка, что данные существуют
        expect(result1.data).toBeDefined();
        expect(result2.data).toBeDefined();

        expect(result1.data.id).toBeDefined();
        expect(result2.data.id).toBeDefined();

        // проверка, что мы получили 2 последовательных заказа
        expect(Number(result2.data.id) - Number(result1.data.id)).toBe(1);
    })
})