import React from "react";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import {
  render,
  screen,
  getAllByRole,
  getByRole,
} from "@testing-library/react";
import events from "@testing-library/user-event";
import { Helmet } from "react-helmet";
import { AxiosResponse } from "axios";

import { ExampleApi, CartApi } from "../../src/client/api";
import { initStore } from "../../src/client/store";
import { Application } from "../../src/client/Application";
import { CartState, ProductShortInfo } from "../../src/common/types";
import { windowResize, windowResizeBack } from "./utils/resize";

const createApplication = (cartState?: CartState) => {
  const basename = "/hw/store";

  const api = new ExampleApi(basename);
  api.getProducts = async () =>
    (await Promise.resolve({
      data: [],
    })) as unknown as Promise<AxiosResponse<ProductShortInfo[], any>>;
  const cart = new CartApi();
  cart.setState(
    cartState || {
      0: {
        name: "Product1",
        price: 100,
        count: 4,
      },
      1: {
        name: "Product2",
        price: 200,
        count: 5,
      },
    }
  );
  const store = initStore(api, cart);

  return (
    <MemoryRouter initialEntries={["/cart"]}>
      <Provider store={store}>
        <Application />
      </Provider>
    </MemoryRouter>
  );
};

describe("Корзина должна работать корректно.", () => {
  describe("В шапке рядом со ссылкой на корзину должно отображаться количество не повторяющихся товаров в ней.", () => {
    const headerUniqueItemsTest = async (isSmallWidthScreen = false) => {
      render(createApplication());

      if (isSmallWidthScreen) {
        windowResize();

        // симулируем поведение пользователя
        const menuButton = getByRole(screen.getByRole("navigation"), "button");
        await events.click(menuButton);
      }

      const navigation = screen.getByRole("navigation");
      const links = getAllByRole(navigation, "link");
      const cartLink = links.find(
        (link) => link.getAttribute("href") === "/cart"
      )!;

      expect(cartLink.textContent).toContain("2");

      if (isSmallWidthScreen) windowResizeBack();
    };

    test("В шапке рядом со ссылкой на корзину должно отображаться количество не повторяющихся товаров в ней при ширине экрана больше 576px.", async () => {
      await headerUniqueItemsTest();
    });

    test("В шапке рядом со ссылкой на корзину должно отображаться количество не повторяющихся товаров в ней при ширине экрана меньше 576px.", async () => {
      await headerUniqueItemsTest(true);
    });
  });

  describe("В корзине должна отображаться таблица с добавленными в нее товарами.", () => {
    const productsTableTest = (isSmallWidthScreen = false) => {
      render(createApplication());

      if (isSmallWidthScreen) windowResize();

      const table = screen.getByRole("table");
      const tableBody = getAllByRole(table, "rowgroup").find(
        (element) => element.tagName === "TBODY"
      );
      expect(tableBody).toBeDefined();

      expect(tableBody?.childElementCount).toBe(2);

      if (isSmallWidthScreen) windowResizeBack();
    };

    test("В корзине должна отображаться таблица с добавленными в нее товарами при ширине экрана больше 576px.", () => {
      productsTableTest();
    });

    test("В корзине должна отображаться таблица с добавленными в нее товарами при ширине экрана меньше 576px.", () => {
      productsTableTest(true);
    });
  });

  describe("Для каждого товара должны отображаться название, цена, количество , стоимость, а также должна отображаться общая сумма заказа.", () => {
    const extractTextFromChildren = (children: HTMLCollection) =>
      Array.from(children).map((child) => child.textContent);

    const displayProductsTest = (isSmallWidthScreen = false) => {
      render(createApplication());

      if (isSmallWidthScreen) windowResize();

      const firstItem = screen.getByTestId("0");
      const firstItemData = extractTextFromChildren(firstItem.children);
      ["Product1", "$100", "4", "$400"].forEach((expectedValue) =>
        expect(firstItemData).toContain(expectedValue)
      );

      const secondItem = screen.getByTestId("1");
      const secondItemData = extractTextFromChildren(secondItem.children);
      ["Product2", "$200", "5", "$1000"].forEach((expectedValue) => {
        expect(secondItemData).toContain(expectedValue);
      });

      const table = screen.getByRole("table");
      const tableFoot = getAllByRole(table, "rowgroup").find(
        (element) => element.tagName === "TFOOT"
      );
      expect(tableFoot).toBeDefined();
      expect(tableFoot!.textContent).toContain("$1400");

      if (isSmallWidthScreen) windowResizeBack();
    };

    test("Для каждого товара должны отображаться название, цена, количество , стоимость, а также должна отображаться общая сумма заказа при ширине экрана больше 576px.", () => {
      displayProductsTest();
    });

    test("Для каждого товара должны отображаться название, цена, количество , стоимость, а также должна отображаться общая сумма заказа при ширине экрана меньше 576px.", () => {
      displayProductsTest(true);
    });
  });

  describe('В корзине должна быть кнопка "очистить корзину", по нажатию на которую все товары должны удаляться.', () => {
    const clearCartTest = async (isSmallWidthScreen = false) => {
      render(createApplication());

      if (isSmallWidthScreen) {
        windowResize();

        // симулируем поведение пользователя
        const menuButton = getByRole(screen.getByRole("navigation"), "button");
        await events.click(menuButton);
      }

      const clearButton = screen.getByText(/^clear shopping cart/i);
      await events.click(clearButton);

      const table = screen.queryByRole("table");
      expect(table).toBeNull();

      const navigation = screen.getByRole("navigation");
      const cartLink = getAllByRole(navigation, "link").find(
        (link) => link.getAttribute("href") === "/cart"
      )!;
      expect(cartLink.textContent).toMatch(/cart/i);

      if (isSmallWidthScreen) windowResizeBack();
    };

    test('В корзине должна быть кнопка "очистить корзину", по нажатию на которую все товары должны удаляться при ширине экрана больше 576px.', async () => {
      await clearCartTest();
    });

    test('В корзине должна быть кнопка "очистить корзину", по нажатию на которую все товары должны удаляться при ширине экрана меньше 576px.', async () => {
      await clearCartTest(true);
    });
  });

  describe("Если корзина пустая, должна отображаться ссылка на каталог товаров.", () => {
    const emptyContainerLinkTest = async (isSmallWidthScreen = false) => {
      render(createApplication({}));
      const catalogLink = screen.getByText("catalog");

      if (isSmallWidthScreen) windowResize();

      await events.click(catalogLink);
      const title = Helmet.peek().title || "";
      const isCatalogPage = title.toLowerCase().trim().includes("catalog");
      expect(isCatalogPage).toBe(true);

      if (isSmallWidthScreen) windowResizeBack();
    };

    test("Если корзина пустая, должна отображаться ссылка на каталог товаров при ширине экрана больше 576px.", async () => {
      await emptyContainerLinkTest();
    });

    test("Если корзина пустая, должна отображаться ссылка на каталог товаров при ширине экрана меньше 576px.", async () => {
      await emptyContainerLinkTest(true);
    });
  });
});
