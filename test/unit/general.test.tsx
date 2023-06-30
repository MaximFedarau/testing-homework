import {
  render,
  screen,
  getByText,
  getAllByRole,
} from "@testing-library/react";
import events from "@testing-library/user-event";
import { Helmet } from "react-helmet";

import { createBaseApplication } from "../utils/createBaseApplication";

// размеры окна в Jest по умолчанию 1024x768
describe("В шапке располагаются корректные ссылки при ширине экрана большей 576px.", () => {
  test("Название магазина в шапке должно быть ссылкой на главную страницу.", async () => {
    render(createBaseApplication(["/"]));

    const navigation = screen.getByRole("navigation");
    const storeLink = getByText(navigation, "Example store");
    await events.click(storeLink);

    const title = Helmet.peek().title || "";
    const isMainPage = title.toLowerCase().trim().includes("welcome");
    expect(isMainPage).toBe(true);
  });

  test("В шапке отображаются ссылки на страницы магазина, а также ссылка на корзину", async () => {
    render(createBaseApplication(["/"]));

    const navigation = screen.getByRole("navigation");

    const navigationLinksElements = getAllByRole(navigation, "link");
    const navigationLinksAttributes = navigationLinksElements.map((link) =>
      link.getAttribute("href")
    );

    const correctLinks = ["/", "/catalog", "/delivery", "/contacts", "/cart"];

    expect(navigationLinksAttributes).toStrictEqual(correctLinks);
  });
});
