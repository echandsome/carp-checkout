import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";
import { BuyerJourneyStep } from "../generated/api";

export function cartValidationsGenerateRun(input: CartValidationsGenerateRunInput): CartValidationsGenerateRunResult {
  const errors: ValidationError[] = [];

  if (input.buyerJourney.step !== BuyerJourneyStep.CheckoutInteraction) {
    return { operations: [] };
  }

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

  // Check if any product in the cart is not California compliant
  const nonCompliantProducts: string[] = [];
  
  input.cart.lines.forEach(line => {
    // @ts-ignore
    if (line.merchandise.product) {
      // @ts-ignore
      const isCompliant = line.merchandise.product.hasAnyTag;
      
      if (!isCompliant) {
        // @ts-ignore
        const productTitle = line.merchandise.product.title || "Unknown Product";
        nonCompliantProducts.push(productTitle);
      }
    }
  });

  if (nonCompliantProducts.length > 0) {
    const productList = nonCompliantProducts.join(", ");
    errors.push({
      message: `The following products cannot be shipped to California due to CARB compliance restrictions: ${productList}. Please remove these products or choose a different shipping address.`,
      target: "$.cart",
    });
  }

  return errors;
}