describe('Все страницы должны существовать, а страницы главная, условия доставки, контакты и пустая корзина должны иметь статическое содержимое.', async function() {
    it('Главная страница существует и имеет статическое содержимое.', async function() {
        await this.browser.url('http://localhost:3000/hw/store');
        await this.browser.assertView('plain', 'body');
    });

    it('Страница с условиями доставки существует и имеет статическое содержимое.', async function() {
        await this.browser.url('http://localhost:3000/hw/store/delivery');
        await this.browser.assertView('plain', 'body');
    });

    it('Страница с контактами существует и имеет статическое содержимое.', async function() {
        await this.browser.url('http://localhost:3000/hw/store/contacts');
        await this.browser.assertView('plain', 'body');
    });

    it("Страница с пустой корзиной существует и имеет статическое содержимое.", async function() {
        await this.browser.url("http://localhost:3000/hw/store/cart");
        await this.browser.assertView("plain", "body");
    })

    it('Страница с каталогом существует.', async function() {
        await this.browser.url('http://localhost:3000/hw/store/catalog');
        const body = await this.browser.$("body"), title = await this.browser.$("title");
        const bodyText = await body.getText(), titleText = await await title.getText();
        const hasBody = !(bodyText.toLowerCase().trim().includes("cannot get")), hasTitle = titleText.toLowerCase().trim().includes("catalog");
        expect([hasBody, hasTitle]).toStrictEqual([true, true]);
    })
});
