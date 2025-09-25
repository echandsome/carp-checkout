import { describe, it, expect } from 'vitest';
import { cartValidationsGenerateRun } from './run';
import { CartValidationsGenerateRunResult, CountryCode, BuyerJourneyStep } from "../generated/api";

describe('cart checkout validation function', () => {
  it('returns no operations when buyer journey step is not CHECKOUT_INTERACTION', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              product: {
                hasAnyTag: false
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
      },
      buyerJourney: {
        step: BuyerJourneyStep.CartInteraction
      }
    });
    const expected: CartValidationsGenerateRunResult = {
      operations: []
    };

    expect(result).toEqual(expected);
  });

  it('returns no error when shipping to non-California address with non-compliant product', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              product: {
                hasAnyTag: false
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
      },
      buyerJourney: {
        step: BuyerJourneyStep.CheckoutInteraction
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

  it('returns error when shipping to California with non-compliant product (no compliance tags)', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              product: {
                hasAnyTag: false
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
      },
      buyerJourney: {
        step: BuyerJourneyStep.CheckoutInteraction
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

  it('returns no error when shipping to California with EPA:Compliant product', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              product: {
                hasAnyTag: true
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
      },
      buyerJourney: {
        step: BuyerJourneyStep.CheckoutInteraction
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

  it('returns no error when shipping to California with EPA:N/A product', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              product: {
                hasAnyTag: true
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
      },
      buyerJourney: {
        step: BuyerJourneyStep.CheckoutInteraction
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

  it('returns no error when shipping to California with California Compliant product', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              product: {
                hasAnyTag: true
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
      },
      buyerJourney: {
        step: BuyerJourneyStep.CheckoutInteraction
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

  it('returns no error when shipping to California with Non-CARB:Y product', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              product: {
                hasAnyTag: true
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
      },
      buyerJourney: {
        step: BuyerJourneyStep.CheckoutInteraction
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

  it('returns no error when shipping to California with CustomProduct', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
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
      },
      buyerJourney: {
        step: BuyerJourneyStep.CheckoutInteraction
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

  it('returns error when shipping to California with mixed compliant and non-compliant products', () => {
    const result = cartValidationsGenerateRun({
      cart: {
        lines: [
          {
            quantity: 1,
            merchandise: {
              product: {
                hasAnyTag: true
              }
            }
          },
          {
            quantity: 1,
            merchandise: {
              product: {
                hasAnyTag: false
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
      },
      buyerJourney: {
        step: BuyerJourneyStep.CheckoutInteraction
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
});