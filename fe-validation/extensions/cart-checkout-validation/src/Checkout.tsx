import {
  reactExtension,
  Banner,
  BlockStack,
  Text,
  useInstructions,
  useTranslate,
  Spinner,
  useBuyerJourneyIntercept,
  useExtensionCapability,
} from "@shopify/ui-extensions-react/checkout";
import { useCarbValidation } from "./hooks/useCarbValidation";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const instructions = useInstructions();
  const { validationErrors, isValidating, hasErrors } = useCarbValidation();

  console.log('hasErrors', hasErrors)

  const canBlockProgress = useExtensionCapability("block_progress");
  console.log(canBlockProgress)
  useBuyerJourneyIntercept(({ canBlockProgress }) => {

    console.log(canBlockProgress, hasErrors)

    if (canBlockProgress && hasErrors) { 
      return {
        behavior: "block",
        reason: "Shipping restrictions",
        perform: (result) => {
          // If progress can be blocked, then set a validation error on the custom field
          console.log('blocked')
        },
      }
    }

    return {
      behavior: "allow",
      perform: () => {
      },
    }
  })

  // Check if validation is supported
  if (!instructions.attributes.canUpdateAttributes) {
    return null;
  }

  if (hasErrors) {

    return (
      <Banner title={translate("carbValidationErrorTitle")} status="critical">
        {validationErrors.map((error, index) => (
          <Text key={index}>{error.message}</Text>
        ))}
      </Banner>
    );
  }

  return null;
}