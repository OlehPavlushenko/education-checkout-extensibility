import React, { useState, useEffect } from "react";
import {
  reactExtension,
  TextField,
  BlockStack,
  useApplyMetafieldsChange,
  useMetafield,
  Checkbox,
  DateField,
} from "@shopify/ui-extensions-react/checkout";

// Set the entry point for the extension
export default reactExtension("purchase.checkout.shipping-option-list.render-after", () => <Extension />);

function Extension() {
  // Set up the checkbox state
  const [checked, setChecked] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [yesterday, setYesterday] = useState("");


  	// Sets the selected date to today, unless today is Sunday, then it sets it to tomorrow
    useEffect(() => {
      let today = new Date();
  
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      setYesterday(formatDate(yesterday));
    }, []);

  // Get a reference to the metafield
  const deliveryInstructions = useMetafield({
    namespace: "checkout_order",
    key: "instruction",
  });

  const deliveryDate = useMetafield({
    namespace: "checkout_order",
    key: "date",
  });
  // Set a function to handle updating a metafield
  const applyMetafieldsChange = useApplyMetafieldsChange();

  // Set a function to handle the Checkbox component's onChange event
  const handleChange = () => {
    setChecked(!checked);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  // Render the extension components
  return (
    <BlockStack>
      <Checkbox checked={checked} onChange={handleChange}>
        Provide delivery instructions
      </Checkbox>
      {checked && (
        <BlockStack border="none" padding={['base', 'none']}>
          <TextField
            label="Delivery instructions"
            multiline={3}
            onChange={(value) => {
              // Apply the change to the metafield
              applyMetafieldsChange({
                type: "updateMetafield",
                namespace: "checkout_order",
                key: "instruction",
                valueType: "string",
                value,
              });
            }}
            value={deliveryInstructions?.value}
          />
          <DateField 
            label="Select a date" 
            selected={selectedDate}
            onChange={(value) => {
              handleDateChange(value)
              // Apply the change to the metafield
              applyMetafieldsChange({
                type: "updateMetafield",
                namespace: "checkout_order",
                key: "date",
                valueType: "string",
                value,
              });
            }}
            value={deliveryDate?.value}
            disabled={[
              "Sunday", "Saturday", { end: yesterday }
            ]}
          />
        </BlockStack>
      )}
    </BlockStack>
  );
}

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};