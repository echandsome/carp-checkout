import { useState, useEffect } from 'react';
import { validateCarbCompliance, Cart, ValidationError } from '../utils/carbValidation';
import { useApi, useShippingAddress, useCartLines } from '@shopify/ui-extensions-react/checkout';

export function useCarbValidation() {
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [isValidating, setIsValidating] = useState(false);
    const { query, attributes  } = useApi();

    // Safely get shipping address with error handling
    let shippingAddress = null;
    try {
        shippingAddress = useShippingAddress();
    } catch (error) {
        console.warn('Shipping address not available:', error);
    }

    let cartLines = null;
    try{
        cartLines = useCartLines();
    } catch (error) {
        console.warn('Cart lines not available:', error);
    }

    useEffect(() => {
        validateCart();
    }, [shippingAddress]);

    function validateCart() {
        if (!cartLines || cartLines.length === 0) {
            setValidationErrors([]);
            setIsValidating(false);
            return;
        }

        setIsValidating(true);
        setValidationErrors([]);

        // Get a unique list of all product variant IDs in the cart
        const variantIds = cartLines.map(line => line.merchandise.id);
        const uniqueVariantIds = variantIds.filter((id, index) => variantIds.indexOf(id) === index);

        if (uniqueVariantIds.length === 0) {
            setIsValidating(false);
            return;
        }

        // Build the GraphQL query string
        const gqlQuery = `
            query getProductTags($ids: [ID!]!) {
                nodes(ids: $ids) {
                ... on ProductVariant {
                    id
                    product {
                        id
                        title
                        tags
                    }
                }
                }
            }
            `;

        query(gqlQuery, { variables: { ids: uniqueVariantIds } })
            .then(({ data }) => {
                if (data && (data as any)?.nodes) {
                    // Create a map of variant ID to product data for quick lookup
                    const variantProductMap: { [key: string]: { title: string; hasAnyTag: boolean } } = {};
                    (data as any).nodes.forEach((node: any) => {
                        if (node && node.product) {
                            variantProductMap[node.id] = {
                                title: node.product.title,
                                hasAnyTag: checkCarbComplianceTags(node.product.tags)
                            };
                        }
                    });

                    // Build cart data structure for validation
                    const cartData: Cart = {
                        lines: cartLines.map(line => ({
                            quantity: line.quantity,
                            merchandise: {
                                product: variantProductMap[line.merchandise.id] || {
                                    title: "Unknown Product",
                                    hasAnyTag: false
                                }
                            }
                        })),
                        deliveryGroups: shippingAddress ? [{
                            deliveryAddress: {
                                countryCode: shippingAddress.countryCode || "US",
                                provinceCode: shippingAddress.provinceCode || "CA"
                            }
                        }] : []
                    };

                    // Validate CARB compliance
                    const errors = validateCarbCompliance(cartData);
                    setValidationErrors(errors);
                } else {
                    console.warn("No product data received from GraphQL query");
                    setValidationErrors([]);
                }
                setIsValidating(false);
            })
            .catch((error) => {
                console.error("Failed to fetch product tags:", error);
                setValidationErrors([{
                    message: "Unable to validate CARB compliance. Please try again.",
                    target: "$.cart"
                }]);
                setIsValidating(false);
            });
    }

    // Helper function to check if product tags indicate CARB compliance
    function checkCarbComplianceTags(tags: string[]): boolean {
        if (!tags || !Array.isArray(tags)) {
            return false;
        }
        
        return tags.some(tag => 
            tag === "EPA:Compliant" || 
            tag === "EPA:N/A" || 
            tag === "California Compliant" || 
            tag === "Non-CARB:Y"
        );
    }

    return {
        validationErrors,
        isValidating,
        hasErrors: validationErrors.length > 0,
        refetch: validateCart
    };
}
