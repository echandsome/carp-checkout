# CARB Compliance Validation

Simple Shopify checkout extension that validates CARB compliance for California shipments.

## Files

- `src/utils/carbValidation.ts` - Core validation logic
- `src/hooks/useCarbValidation.ts` - React hook
- `src/Checkout.tsx` - UI component
- `locales/en.default.json` - Translations

## Usage

The extension automatically validates cart contents and shows:
- Loading state while validating
- Error banner for non-compliant products
- Success banner for compliant products

## Validation Logic

- Only validates for California addresses (US, CA)
- Checks products against CARB compliance tags
- Shows error messages for non-compliant products
