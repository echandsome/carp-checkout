/**
 * CARB Compliance Validation Utilities
 * 
 * This file contains the core validation logic that mirrors the backend validation
 * from the run.ts file. It can be used both on the frontend and backend.
 */

export interface Product {
  title: string;
  hasAnyTag: boolean;
}

export interface CartLine {
  quantity: number;
  merchandise: {
    product: Product;
  };
}

export interface DeliveryAddress {
  countryCode: string;
  provinceCode: string;
}

export interface DeliveryGroup {
  deliveryAddress: DeliveryAddress;
}

export interface Cart {
  lines: CartLine[];
  deliveryGroups: DeliveryGroup[];
}

export interface ValidationError {
  message: string;
  target: string;
}

/**
 * Validates CARB compliance for a given cart
 * This function mirrors the backend validation logic from run.ts
 */
export function validateCarbCompliance(cart: Cart): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if any delivery group has a California address
  const hasCaliforniaAddress = cart.deliveryGroups.some(group => 
    group.deliveryAddress?.countryCode === "US" && 
    group.deliveryAddress?.provinceCode === "CA"
  );

  if (!hasCaliforniaAddress) {
    // No California address, no CARB validation needed
    return errors;
  }

  // Check if any product in the cart is not California compliant
  const nonCompliantProducts: string[] = [];

  cart.lines.forEach(line => {
    if (line.merchandise?.product) {
      const isCompliant = line.merchandise.product.hasAnyTag;
      
      if (!isCompliant) {
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

/**
 * Checks if a product is CARB compliant based on its tags
 * This is a helper function that can be used to check individual products
 */
export function isProductCarbCompliant(product: Product): boolean {
  return product.hasAnyTag;
}

/**
 * Checks if a delivery address is in California
 * This is a helper function that can be used to check individual addresses
 */
export function isCaliforniaAddress(address: DeliveryAddress): boolean {
  return address.countryCode === "US" && address.provinceCode === "CA";
}

/**
 * Gets all non-compliant products from a cart
 * This is a helper function that returns just the product names
 */
export function getNonCompliantProducts(cart: Cart): string[] {
  const nonCompliantProducts: string[] = [];
  
  cart.lines.forEach(line => {
    if (line.merchandise?.product && !isProductCarbCompliant(line.merchandise.product)) {
      const productTitle = line.merchandise.product.title || "Unknown Product";
      nonCompliantProducts.push(productTitle);
    }
  });

  return nonCompliantProducts;
}

/**
 * Checks if the cart has any California delivery addresses
 * This is a helper function that returns a boolean
 */
export function hasCaliforniaDeliveryAddress(cart: Cart): boolean {
  return cart.deliveryGroups.some(group => 
    group.deliveryAddress && isCaliforniaAddress(group.deliveryAddress)
  );
}
