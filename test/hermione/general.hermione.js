describe("Шапка на всех страницах должна быть одинаковая.", async function() {
  const urls = [
    "/",
    "/catalog",
    "/delivery",
    "/contacts",
    "/cart",
  ];

  it("Шапка на всех страницах должна быть одинаковая при ширине экрана больше 576px.", async function() {
    await this.browser.setWindowSize(1920, 1080);
    for (let i = 0; i < urls.length; ++i) {
      const url = urls[i];
      await this.browser.url(`http://localhost:3000/hw/store${url}`);
      await this.browser.assertView(`plain_${url}`, 'nav');
    }
  })

  it("Шапка на всех страницах должна быть одинаковая при ширине экрана меньше 576px.", async function() {
    await this.browser.setWindowSize(572, 4320);
    for (let i = 0; i < urls.length; ++i) {
      const url = urls[i];
      await this.browser.url(`http://localhost:3000/hw/store${url}`);
      await this.browser.assertView(`plain_${url}`, 'nav');
    }
  })
})

describe('При ширине экрана меньше 576px вместо навигационного меню должен появляться рабочий "гамбургер".', async function () {
  beforeEach(async function () {
    await this.browser.url("http://localhost:3000/hw/store");
    await this.browser.setWindowSize(572, 4320);
  })

  it('На ширине меньше 576px навигационное меню должно скрываться за "гамбургер".', async function () {
    const menuButton = await this.browser.$(".navbar-toggler");
    const menuButtonSizes = await menuButton.getSize();
    const isMenuButtonExists = menuButtonSizes.width > 0 && menuButtonSizes.height > 0;
    expect(isMenuButtonExists).toBe(true);

    const hiddenMenu = await this.browser.$(".collapse.navbar-collapse");
    const isHiddenMenuExists = await hiddenMenu.isExisting();
    expect(isHiddenMenuExists).toBe(true);
  });

  it('Меню "гамбургер" должно содержать ссылки на все страницы.', async function() {
    const menuButton = await this.browser.$(".navbar-toggler");
    await menuButton.click();

    const linkContainer = await this.browser.$(".navbar-nav");
    const links = await linkContainer.$$('a');
    const hrefs = [];
    for (let i = 0; i < links.length; ++i) {
      const currentLink = links[i];
      const href = (await currentLink.getAttribute("href")).replaceAll("/hw/store", "");
      hrefs.push(href);
    }

    const correctLinks = [
      "/catalog",
      "/delivery",
      "/contacts",
      "/cart",
    ];

    expect(hrefs).toStrictEqual(correctLinks);
  })

  it('При выборе элемента из меню "гамбургера", меню должно закрываться.', async function () {
    const menuButton = await this.browser.$(".navbar-toggler");
    await menuButton.click();

    const linkContainer = await this.browser.$(".navbar-nav");
    const links = await linkContainer.$$('a');
    let contactsLink; // ссылка на страницу со статическим содержимым
    for (let i = 0; i < links.length; ++i) {
      const currentLink = links[i];
      const href = (await currentLink.getAttribute("href")).replaceAll("/hw/store", "");
      if (href === "/contacts") {
        contactsLink = currentLink;
        break;
      }
    }
    await contactsLink.click();

    const hiddenMenu = await this.browser.$(".collapse.navbar-collapse");
    const isHiddenMenuExists = await hiddenMenu.isExisting();
    expect(isHiddenMenuExists).toBe(true);
  })
});
