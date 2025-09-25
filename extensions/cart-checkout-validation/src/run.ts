import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";

export function cartValidationsGenerateRun(input: CartValidationsGenerateRunInput): CartValidationsGenerateRunResult {
  const errors: ValidationError[] = [];

  // Check for CARB compliance validation
  const carbErrors = checkCarbCompliance(input);
  errors.push(...carbErrors);

  const operations = [
    {
      validationAdd: {
        errors
      },
    },
  ];

  return { operations };
};

function checkCarbCompliance(input: CartValidationsGenerateRunInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if any delivery group has a California address
  const hasCaliforniaAddress = input.cart.deliveryGroups.some(group => 
    group.deliveryAddress?.countryCode === "US" && 
    group.deliveryAddress?.provinceCode === "CA"
  );

  if (!hasCaliforniaAddress) {
    // No California address, no CARB validation needed
    return errors;
  }

  // Check if any product in the cart is CARB non-compliant
  const hasNonCompliantProducts = input.cart.lines.some(line => {
    if (line.merchandise?.product?.metafield?.value === "true") {
      return true;
    }
    return false;
  });

  if (hasNonCompliantProducts) {
    errors.push({
      message: "This product cannot be shipped to California due to CARB compliance restrictions. Please remove the non-compliant product or choose a different shipping address.",
      target: "$.cart",
    });
  }

  return errors;
}