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

  console.log(`Input: ${JSON.stringify(input)}`);

  // Check if any delivery group has a California address
  const hasCaliforniaAddress = input.cart.deliveryGroups.some(group => 
    group.deliveryAddress?.countryCode === "US" && 
    group.deliveryAddress?.provinceCode === "CA"
  );

  console.log(`Has California address: ${hasCaliforniaAddress}`);

  if (!hasCaliforniaAddress) {
    // No California address, no CARB validation needed
    return errors;
  }

  // Check if any product in the cart is CARB non-compliant
  const hasNonCompliantProducts = input.cart.lines.some(line => {
    if (line.merchandise.__typename === "ProductVariant") {
      const carbMetafield = line.merchandise.product.metafield;

      console.log(`CARB metafield: ${JSON.stringify(carbMetafield)}`);

      // If metafield exists and value is "true", it's non-compliant
      return carbMetafield && carbMetafield.value === "true";
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