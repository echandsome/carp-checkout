import { describe, it, expect } from 'vitest';
import { cartValidationsGenerateRun } from './run';
import { CartValidationsGenerateRunResult, CountryCode } from "../generated/api";

describe('cart checkout validation function', () => {
  it('returns no error when shipping to non-California address with CARB non-compliant product', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              product: {
                metafield: {
                  value: "true"
                }
              }
            }
          }
        ],
        deliveryGroups: [
          {
            deliveryAddress: {
              countryCode: CountryCode.Us,
              provinceCode: "NY"
            }
          }
        ]
      }
    });
    const expected: CartValidationsGenerateRunResult = {
      operations: [
        {
          validationAdd: {
            errors: []
          }
        }
      ]
    };

    expect(result).toEqual(expected);
  });

  it('returns error when shipping to California with CARB non-compliant product', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              product: {
                metafield: {
                  value: "true"
                }
              }
            }
          }
        ],
        deliveryGroups: [
          {
            deliveryAddress: {
              countryCode: CountryCode.Us,
              provinceCode: "CA"
            }
          }
        ]
      }
    });
    const expected: CartValidationsGenerateRunResult = {
      operations: [
        {
          validationAdd: {
            errors: [
              {
                message: "This product cannot be shipped to California due to CARB compliance restrictions. Please remove the non-compliant product or choose a different shipping address.",
                target: "$.cart"
              }
            ]
          }
        }
      ]
    };

    expect(result).toEqual(expected);
  });

  it('returns no error when shipping to California with CARB compliant product', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              product: {
                metafield: {
                  value: "false"
                }
              }
            }
          }
        ],
        deliveryGroups: [
          {
            deliveryAddress: {
              countryCode: CountryCode.Us,
              provinceCode: "CA"
            }
          }
        ]
      }
    });
    const expected: CartValidationsGenerateRunResult = {
      operations: [
        {
          validationAdd: {
            errors: []
          }
        }
      ]
    };

    expect(result).toEqual(expected);
  });

  it('returns no error when shipping to California with product that has no CARB metafield', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              product: {
                metafield: null
              }
            }
          }
        ],
        deliveryGroups: [
          {
            deliveryAddress: {
              countryCode: CountryCode.Us,
              provinceCode: "CA"
            }
          }
        ]
      }
    });
    const expected: CartValidationsGenerateRunResult = {
      operations: [
        {
          validationAdd: {
            errors: []
          }
        }
      ]
    };

    expect(result).toEqual(expected);
  });

  it('returns no error when shipping to California with CARB compliant product (value "no")', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              __typename: "ProductVariant",
              product: {
                metafield: {
                  value: "no"
                }
              }
            }
          }
        ],
        deliveryGroups: [
          {
            deliveryAddress: {
              countryCode: CountryCode.Us,
              provinceCode: "CA"
            }
          }
        ]
      }
    });
    const expected: CartValidationsGenerateRunResult = {
      operations: [
        {
          validationAdd: {
            errors: []
          }
        }
      ]
    };

    expect(result).toEqual(expected);
  });
});