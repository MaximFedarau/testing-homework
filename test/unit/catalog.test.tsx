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

import { ExampleApi, CartApi } from "../../src/client/api";
import { initStore } from "../../src/client/store";
import { Application } from "../../src/client/Application";
import { CartState } from "../../src/common/types";

const createCatalogApplication = () => {
  const basename = "/hw/store";

  const api = new ExampleApi(basename);
  api.getProducts = async () =>
    (await Promise.resolve({
      data: [{ id: 0, name: "Product1", price: 100 }],
    })) as any;
  const cart = new CartApi();
  const store = initStore(api, cart);

  return (
    <MemoryRouter initialEntries={["/catalog"]}>
      <Provider store={store}>
        <Application />
      </Provider>
    </MemoryRouter>
  );
};

const windowResize = () => {
  global.innerWidth = 572;
  global.dispatchEvent(new Event("resize"));
};

const windowResizeBack = () => {
  global.innerWidth = 1024;
  global.dispatchEvent(new Event("resize"));
};

describe("В каталоге должны отображаться товары, список которых приходит с сервера.", () => {
  const serverItemsTest = async (isSmallWidthScreen = false) => {
    render(createCatalogApplication());

    if (isSmallWidthScreen) windowResize();

    const product = (await screen.findAllByTestId("0"))[0];
    const parentContainer = product.parentElement!;
    expect(parentContainer.childElementCount).toBe(1);

    if (isSmallWidthScreen) windowResizeBack();
  };

  test("При ширине экрана больше 576px в каталоге должны отображаться товары, список которых приходит с сервера.", async () => {
    await serverItemsTest();
  });

  test("При ширине экрана меньше 576px в каталоге должны отображаться товары, список которых приходит с сервера.", async () => {
    await serverItemsTest(true);
  });
});
