import React from "react";
import {
  render,
  screen,
  getByText,
  getAllByRole,
  getByRole,
} from "@testing-library/react";
import events from "@testing-library/user-event";
import { Helmet } from "react-helmet";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { AxiosResponse } from "axios";

import { Application } from "../../src/client/Application";
import { initStore } from "../../src/client/store";
import { CartApi, ExampleApi } from "../../src/client/api";
import { windowResize, windowResizeBack } from "./utils/resize";
import { ProductShortInfo } from "../../src/common/types";

const createApplication = (
  initialEntries: string[],
  customApi?: ExampleApi
) => {
  const basename = "/hw/store";

  const api = new ExampleApi(basename);
  api.getProducts = async () =>
    (await Promise.resolve({
      data: [],
    })) as unknown as Promise<AxiosResponse<ProductShortInfo[], any>>;
  const cart = new CartApi();
  const store = initStore(customApi || api, cart);

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Provider store={store}>
        <Application />
      </Provider>
    </MemoryRouter>
  );
};

// размеры окна в Jest по умолчанию 1024x768
describe("В шапке располагаются корректные ссылки.", () => {
  describe("Название магазина в шапке должно быть ссылкой на главную страницу.", () => {
    const titleIsLinkTest = async (isSmallWidthScreen = false) => {
      render(createApplication(["/"]));

      if (isSmallWidthScreen) windowResize();

      const navigation = screen.getByRole("navigation");
      const storeLink = getByText(navigation, "Example store");
      await events.click(storeLink);

      const title = Helmet.peek().title || "";
      const isMainPage = title.toLowerCase().trim().includes("welcome");
      expect(isMainPage).toBe(true);

      if (isSmallWidthScreen) windowResizeBack();
    };

    it("При ширине экрана больше 576px название магазина в шапке должно быть ссылкой на главную страницу.", async () => {
      await titleIsLinkTest();
    });

    it("При ширине экрана меньше 576px название магазина в шапке должно быть ссылкой на главную страницу.", async () => {
      await titleIsLinkTest(true);
    });
  });

  describe("В шапке отображаются ссылки на страницы магазина, а также ссылка на корзину.", () => {
    const headerHasLinksTest = async (isSmallWidthScreen = false) => {
      render(createApplication(["/"]));

      if (isSmallWidthScreen) {
        windowResize();

        //симулируем поведение пользователя
        const menuButton = getByRole(screen.getByRole("navigation"), "button");
        await events.click(menuButton);
      }

      const navigation = screen.getByRole("navigation");

      const navigationLinksElements = getAllByRole(navigation, "link");

      const correctTitles = [
        "welcome",
        "catalog",
        "delivery",
        "contacts",
        "cart",
      ];

      for (let i = 0; i < navigationLinksElements.length; ++i) {
        const linkElement = navigationLinksElements[i];
        await events.click(linkElement);
        const title = (Helmet.peek().title || "").trim().toLowerCase();
        let isInTheList = false;
        correctTitles.forEach(
          (correctTitle) =>
            (isInTheList = isInTheList || title.includes(correctTitle))
        );
        expect(isInTheList).toBe(true);
      }

      if (isSmallWidthScreen) windowResizeBack();
    };

    test("При ширине экрана больше 576px в шапке отображаются ссылки на страницы магазина, а также ссылка на корзину.", async () => {
      await headerHasLinksTest();
    });

    test("При ширине экрана меньше 576px в шапке отображаются ссылки на страницы магазина, а также ссылка на корзину.", async () => {
      await headerHasLinksTest(true);
    });
  });
});
