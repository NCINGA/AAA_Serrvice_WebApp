import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useQuery } from "@apollo/client";
import { GET_ATTRIBUTE_META } from "../../graphql/queries";
import { TabView, TabPanel } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { IAttributeMapping } from "../../interface/data";

interface AttributeDetailsProps {
  selectedAttributes: IAttributeMapping[];
  setSelectedAttributes: Dispatch<SetStateAction<any[]>>;
}

// Define the type for validation rules
interface ValidationRule {
  type: string;
  options?: string[];
}

// Define the type for the validation rules object
interface AttributeValidationRules {
  [key: string]: ValidationRule;
}

const attributeValidationRules: AttributeValidationRules = {
  ALLOW_DATA_BUNDLE_ADDON: { type: "boolean", options: ["0", "1"] },
  ALLOW_DATA_ROLLOVER: { type: "boolean", options: ["0", "1"] },
  BILLING_TYPE: { type: "text" },
  DATA_ROLLOVER_INTERVAL: { type: "text" },
  DEFAULT_RENEW: { type: "text" },
  IS_TRIAL_PLAN: { type: "boolean", options: ["0", "1"] },
  PERMIT_RENEW: { type: "text" },
  SKIP_USAGE_WINDOW_ON_DAYS: { type: "text" },
  SPLIT_OB_USAGE: { type: "text", options: ["DOWNLOAD", "UPLOAD", "BOTH"] },
  USAGE_COUNTED_BASED_ON: { type: "text" },
  USAGE_RESET_PER_SESSION: { type: "boolean", options: ["0", "1"] },
  VALIDATE_DEVICE: { type: "boolean", options: ["0", "1"] },
};

// Interface for input field structure
interface InputField {
  id: number;
  attribute: string | null;
  value: string;
  isExisting: boolean;
}

interface SelectItem {
  label: string;
  value: string;
}

const AttributeDetails = ({
  selectedAttributes,
  setSelectedAttributes,
}: AttributeDetailsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [inputFields, setInputFields] = useState<InputField[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string>
  >({});

  const { data, loading, error } = useQuery(GET_ATTRIBUTE_META);

  // Load attributes from GraphQL
  useEffect(() => {
    if (data) {
      setAttributes(data.getAttributeMeta);
    }
  }, [data]);

  // Initialize inputFields with existing selectedAttributes
  useEffect(() => {
    if (!isInitialized && selectedAttributes && selectedAttributes.length > 0) {
      // Map the selected attributes to the format expected by inputFields
      const mappedAttributes: InputField[] = selectedAttributes.map((attr) => ({
        id: attr.id || Date.now() + Math.random(),
        attribute: ((attr.attributeName || attr.attribute) as string) || null,
        value: ((attr.attributeValue || attr.value) as string) || "",
        isExisting: true,
      }));
      console.log("Mapped attributes:", mappedAttributes);
      setInputFields(mappedAttributes);
      setIsInitialized(true);
    } else if (!isInitialized && inputFields.length === 0) {
      // If no attributes and no input fields, initialize with an empty field
      setInputFields([
        { id: Date.now(), attribute: null, value: "", isExisting: false },
      ]);
      setIsInitialized(true);
    }
  }, [selectedAttributes, isInitialized, inputFields.length]);

  // Validate a field based on attribute rules
  const validateField = (attribute: string, value: string): string => {
    if (!attribute || attribute.trim() === "") return "";
    if (!value || value.trim() === "") return "Value is required";

    const rule = attributeValidationRules[attribute];
    if (!rule) return "";

    // Only validate options if they exist for the attribute
    if (rule.options && rule.options.length > 0) {
      if (!rule.options.includes(value)) {
        return `Value must be one of: ${rule.options.join(", ")}`;
      }
    }

    return "";
  };

  // Update field validation when a field changes
  const updateValidation = (fields: InputField[]) => {
    const errors: Record<number, string> = {};

    fields.forEach((field) => {
      if (field.attribute) {
        const error = validateField(field.attribute, field.value);
        if (error) {
          errors[field.id] = error;
        }
      }
    });

    setValidationErrors(errors);
    return errors;
  };

  // Sync inputFields back to selectedAttributes whenever they change
  useEffect(() => {
    if (isInitialized) {
      // Validate all fields
      const errors = updateValidation(inputFields);

      // Convert all valid inputFields to the selectedAttributes format
      // and convert all values to strings
      const validAttributes = inputFields
        .filter((field) => field.attribute && field.value && !errors[field.id])
        .map((field) => ({
          id: field.id,
          attributeName: field.attribute,
          attributeValue: String(field.value),
          attribute: field.attribute,
          value: String(field.value),
          isExisting: field.isExisting,
        }));

      // Replace the entire selectedAttributes array
      setSelectedAttributes(validAttributes);
    }
  }, [inputFields, isInitialized, setSelectedAttributes]);

  const handleAddField = () => {
    const newField = {
      id: Date.now(),
      attribute: null,
      value: "",
      isExisting: false,
    };
    setInputFields((prevFields) => [...prevFields, newField]);
  };

  const handleRemoveField = (id: number) => {
    // Remove from inputFields only
    setInputFields((prevFields) =>
      prevFields.filter((field) => field.id !== id)
    );
    // Remove any validation errors for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleFieldChange = (id: number, key: string, value: any) => {
    // Update inputFields
    setInputFields((prevFields) => {
      const updatedFields = prevFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      );

      // Validate the changed field
      if (key === "attribute" || key === "value") {
        const fieldToValidate = updatedFields.find((f) => f.id === id);
        if (fieldToValidate && fieldToValidate.attribute) {
          const error = validateField(
            fieldToValidate.attribute,
            fieldToValidate.value
          );
          setValidationErrors((prev) => ({
            ...prev,
            [id]: error,
          }));
        }
      }

      return updatedFields;
    });
  };

  // Get dropdown options based on attribute type
  const getAttributeOptions = (attribute: string): SelectItem[] => {
    const rule = attributeValidationRules[attribute];
    if (!rule || !rule.options) return [];

    return rule.options.map((opt: string) => ({
      label: opt,
      value: opt,
    }));
  };

  // Render appropriate input based on attribute type
  const renderValueInput = (field: InputField) => {
    if (!field.attribute) {
      return (
        <InputText
          value={field.value}
          onChange={(e) => handleFieldChange(field.id, "value", e.target.value)}
          placeholder="Enter value"
          className="w-12rem"
        />
      );
    }

    const rule = attributeValidationRules[field.attribute];

    if (rule && rule.options && rule.options.length > 0) {
      return (
        <Dropdown
          value={field.value}
          options={getAttributeOptions(field.attribute)}
          onChange={(e) => handleFieldChange(field.id, "value", e.value)}
          placeholder="Select Value"
          className="w-12rem"
        />
      );
    } else {
      return (
        <InputText
          value={field.value}
          onChange={(e) => handleFieldChange(field.id, "value", e.target.value)}
          placeholder="Enter value"
          className="w-12rem"
        />
      );
    }
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        maxHeight: "73vh",
        overflowY: "scroll",
        height: "73vh",
      }}
    >
      <TabView
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="Plan Attributes">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error loading data</p>
          ) : (
            <>
              <div className="flex mb-2 gap-2 justify-content-start">
                <Button
                  label="Add"
                  icon="pi pi-plus"
                  onClick={handleAddField}
                />
              </div>
              <Divider />
              <div className="field-grid">
                <label className="field-label">Attribute Name</label>
                <label className="field-label">Attribute Value</label>
              </div>
              {inputFields.map((field) => (
                <div key={field.id} className="field-grid">
                  <Dropdown
                    value={field.attribute}
                    options={attributes.map((attr) => ({
                      label: attr.attribute,
                      value: attr.attribute,
                    }))}
                    onChange={(e) =>
                      handleFieldChange(field.id, "attribute", e.value)
                    }
                    placeholder="Select Attribute"
                    className="w-12rem"
                  />
                  {renderValueInput(field)}
                  <Button
                    label="Clear"
                    icon="pi pi-trash"
                    onClick={() => handleRemoveField(field.id)}
                    className="p-button-danger"
                  />
                  {validationErrors[field.id] && (
                    <small className="p-error block">
                      {validationErrors[field.id]}
                    </small>
                  )}
                </div>
              ))}
            </>
          )}
        </TabPanel>
      </TabView>
    </div>
  );
};

export default AttributeDetails;
