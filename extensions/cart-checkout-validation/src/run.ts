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
  const hasNonCompliantProducts = input.cart.lines.some(line => {
    // @ts-ignore
    if (!line.merchandise.product) {
      return false;
    }
    
    // @ts-ignore
    const isCompliant = line.merchandise.product.hasAnyTag;
      
    return !isCompliant;
  });

  if (hasNonCompliantProducts) {
    errors.push({
      message: "This product cannot be shipped to California due to CARB compliance restrictions. Please remove the non-compliant product or choose a different shipping address.",
      target: "$.cart",
    });
  }

  return errors;
}