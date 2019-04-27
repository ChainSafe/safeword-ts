import { hello, decimal } from "../index";

describe("hello variable", () => {
  it("hello should be a string", () => {
    expect(typeof hello).toEqual("string");
  });
  it("hello should be a string hello world", () => {
    expect(hello).toEqual("Hello WOrld");
  });
});

describe("decimal", () => {
  it("decimal exists", () => {
    console.log(decimal);
    expect(decimal.toNumber()).toEqual(2.2);
  });
});
