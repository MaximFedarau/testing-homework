import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { Application } from "../../src/client/Application";
import { initStore } from "../../src/client/store";
import { CartApi, ExampleApi } from "../../src/client/api";

export const createBaseApplication = (
  initialEntries: string[],
  customApi?: ExampleApi
) => {
  const basename = "/hw/store";

  const api = new ExampleApi(basename);
  api.getProducts = async () =>
    (await Promise.resolve({
      data: [],
    })) as any;
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
