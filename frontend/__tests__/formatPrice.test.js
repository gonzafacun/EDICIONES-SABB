import formatPrice from "../src/utils/formatPrice.js";

describe("formatPrice", () => {
  test("formatea 5000 en formato ARS", () => {
    const result = formatPrice(5000);
    expect(result).toContain("5.000");
    expect(result).toMatch(/\$\s*5\.000/);
  });

  test("formatea 0 en formato ARS", () => {
    const result = formatPrice(0);
    expect(result).toMatch(/\$\s*0/);
  });

  test("formatea 1500000 con separador de miles", () => {
    const result = formatPrice(1500000);
    expect(result).toContain("1.500.000");
  });

  test("formatea 12500 con separador de miles", () => {
    const result = formatPrice(12500);
    expect(result).toContain("12.500");
  });

  test("trunca decimales (maximumFractionDigits: 0)", () => {
    const result = formatPrice(1999.99);
    expect(result).toContain("2.000");
  });

  test("maneja valores negativos", () => {
    const result = formatPrice(-1000);
    expect(result).toContain("1.000");
  });

  test("retorna string con símbolo de moneda", () => {
    const result = formatPrice(100);
    expect(result).toMatch(/\$/);
  });
});
