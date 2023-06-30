import { render, screen } from "@testing-library/react";
import { Helmet } from "react-helmet";

import { createBaseApplication } from "../utils/createBaseApplication";
import { ExampleApi } from "../../src/client/api";

const customApi = new ExampleApi("/hw/store");
const product = {
  id: 0,
  name: "Product",
  price: 100,
  description: "description",
  material: "leather",
  color: "red",
};
customApi.getProducts = async () =>
  (await Promise.resolve({
    data: [{ id: product.id, name: product.name, price: product.price }],
  })) as any;
customApi.getProductById = async () =>
  (await Promise.resolve({ data: product })) as any;

describe("В магазине должна быть страница с каталогом.", () => {
  test("По корневому адресу должна открываться главная страница.", async () => {
    render(createBaseApplication(["/"]));
    const title = Helmet.peek().title || "";
    const isMainPage = title.toLowerCase().trim().includes("welcome");
    expect(isMainPage).toBe(true);
  });

  test("По адресу /сatalog должна открываться страница с каталогом.", async () => {
    render(createBaseApplication(["/catalog"], customApi));
    const pageTitle = screen.getByRole("heading");
    expect((pageTitle.textContent || "").toLowerCase().trim()).toBe("catalog");
  });

  test("По адресу /delivery должна открываться страница с информацией по условиям доставки.", async () => {
    render(createBaseApplication(["/delivery"]));
    const pageTitle = screen.getByRole("heading");
    expect((pageTitle.textContent || "").toLowerCase().trim()).toBe("delivery");
  });

  test("По адресу /сontacts должна открываться страница с контактами.", async () => {
    render(createBaseApplication(["/contacts"]));
    const pageTitle = screen.getByRole("heading");
    expect((pageTitle.textContent || "").toLowerCase().trim()).toBe("contacts");
  });
});
