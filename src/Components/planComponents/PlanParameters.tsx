import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useQuery } from "@apollo/client";
import { GET_PARAMETER_META } from "../../graphql/queries";
import { TabView, TabPanel } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";

interface ParameterDetailsProps {
  selectedParameters: any[];
  setSelectedParameters: Dispatch<SetStateAction<any[]>>;
}

// Define proper type interfaces for parameter validation
interface BaseParameterConfig {
  type: string;
}

interface NumberParameterConfig extends BaseParameterConfig {
  type: "int";
  min: number | null;
  max: number | null;
}

interface DateParameterConfig extends BaseParameterConfig {
  type: "date";
}

interface DateTimeParameterConfig extends BaseParameterConfig {
  type: "datetime";
}

interface StringParameterConfig extends BaseParameterConfig {
  type: "string";
}

interface TimeParameterConfig extends BaseParameterConfig {
  type: "time";
}

interface TimeRangeParameterConfig extends BaseParameterConfig {
  type: "timerange";
}

// Union type for all parameter configurations
type ParameterConfig =
  | NumberParameterConfig
  | DateParameterConfig
  | DateTimeParameterConfig
  | StringParameterConfig
  | TimeParameterConfig
  | TimeRangeParameterConfig;

// Parameter validation types and rules with proper typing
const PARAMETER_TYPES: Record<string, ParameterConfig> = {
  KICK_PAUSE_TIME_SEC: { type: "int", min: 0, max: null },
  MAX_DATA_QUOTA_MB: { type: "int", min: null, max: null },
  MAX_SESSIONS: { type: "int", min: 0, max: null },
  MAX_THROTTLED_DATA_QUOTA_MB: { type: "int", min: null, max: null },
  ONLY_PRORATA_END_DATE: { type: "date" },
  PRIMARY_LINK_NAME: { type: "string" },
  SCHEME_VALID_FOR: { type: "string" },
  SCHEME_VALID_TILL: { type: "datetime" },
  USAGE_WINDOW: { type: "timerange" },
  VALID_BETWEEN_DAYS: { type: "string" },
  VALID_DURATION_MIN: { type: "int", min: 0, max: null },
};

const ParameterDetails = ({
  selectedParameters,
  setSelectedParameters,
}: ParameterDetailsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [parameters, setParameters] = useState<any[]>([]);
  const [inputFields, setInputFields] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: number]: string;
  }>({});

  const { data, loading, error } = useQuery(GET_PARAMETER_META);

  // Load parameters from GraphQL
  useEffect(() => {
    if (data) {
      setParameters(data.getParameterMeta);
    }
  }, [data]);

  // Initialize input fields when component loads or when selectedParameters change
  useEffect(() => {
    if (!isInitialized && selectedParameters && selectedParameters.length > 0) {
      // Map the selected parameters to the format expected by inputFields
      const mappedParameters = selectedParameters.map((param) => ({
        id: param.id || Date.now() + Math.random(),
        parameter: param.parameter || param.parameterName,
        value: param.value || param.parameterValue,
        isExisting: true, // Mark as existing parameter
      }));
      setInputFields(mappedParameters);
      setIsInitialized(true);
    } else if (!isInitialized && inputFields.length === 0) {
      // If no parameters and no input fields, initialize with an empty field
      setInputFields([
        { id: Date.now(), parameter: null, value: "", isExisting: false },
      ]);
      setIsInitialized(true);
    }
  }, [selectedParameters, isInitialized, inputFields.length]);

  // Validate a field based on its parameter type
  const validateField = (field: any) => {
    if (!field.parameter) return "";

    const parameterConfig = PARAMETER_TYPES[field.parameter];
    if (!parameterConfig) return "";

    const { type } = parameterConfig;
    const value = field.value;

    if (value === "" || value === null) return "This field is required";

    switch (type) {
      case "int": {
        const numConfig = parameterConfig as NumberParameterConfig;

        if (isNaN(Number(value)) || !Number.isInteger(Number(value))) {
          return "Must be an integer";
        }
        if (numConfig.min !== null && Number(value) < numConfig.min) {
          return `Minimum value is ${numConfig.min}`;
        }
        if (numConfig.max !== null && Number(value) > numConfig.max) {
          return `Maximum value is ${numConfig.max}`;
        }
        break;
      }
      case "time":
        // Validate HH:MM:SS format
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value)) {
          return "Time must be in format HH:MM:SS";
        }
        break;
      case "timerange":
        // Validate time range format (HH:MM:SS - HH:MM:SS)
        if (
          !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\s*-\s*([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
            value
          )
        ) {
          return "Time range must be in format HH:MM:SS - HH:MM:SS";
        }
        // Additional validation to ensure start time is before end time
        const [startTime, endTime] = value
          .split("-")
          .map((t: string) => t.trim());
        const startParts = startTime.split(":").map(Number);
        const endParts = endTime.split(":").map(Number);

        const startSeconds =
          startParts[0] * 3600 + startParts[1] * 60 + startParts[2];
        const endSeconds = endParts[0] * 3600 + endParts[1] * 60 + endParts[2];

        if (startSeconds >= endSeconds) {
          return "Start time must be before end time";
        }
        break;
      case "date":
      case "datetime":
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          return "Invalid date format";
        }
        break;
      case "string":
        // Basic validation for string - just ensure it's not empty
        if (value.trim() === "") {
          return "This field cannot be empty";
        }
        break;
    }

    return "";
  };

  // Convert any value to string format based on its type
  const convertToString = (parameter: string, value: any): string => {
    if (value === null || value === undefined) return "";

    const parameterConfig = PARAMETER_TYPES[parameter];
    if (!parameterConfig) return String(value);

    switch (parameterConfig.type) {
      case "date":
        if (value instanceof Date) {
          return value.toISOString().split("T")[0]; // YYYY-MM-DD
        }
        return String(value);

      case "datetime":
        if (value instanceof Date) {
          return value.toISOString().replace("Z", ""); // YYYY-MM-DDTHH:MM:SS
        }
        return String(value);

      default:
        return String(value);
    }
  };

  // Sync inputFields back to selectedParameters whenever they change
  useEffect(() => {
    if (isInitialized) {
      // Validate each field and store errors
      const newErrors: { [key: number]: string } = {};
      inputFields.forEach((field) => {
        if (field.parameter) {
          const error = validateField(field);
          if (error) {
            newErrors[field.id] = error;
          }
        }
      });
      setValidationErrors(newErrors);

      // Only include valid parameters
      const validParameters = inputFields
        .filter(
          (field) => field.parameter && field.value && !newErrors[field.id]
        )
        .map((field) => {
          // Convert all values to strings before saving to selectedParameters
          const stringValue = convertToString(field.parameter, field.value);

          return {
            id: field.id,
            parameterName: field.parameter,
            parameterValue: stringValue,
            parameter: field.parameter,
            value: stringValue,
            isExisting: field.isExisting,
          };
        });

      // Replace the entire selectedParameters array
      setSelectedParameters(validParameters);
    }
  }, [inputFields, isInitialized, setSelectedParameters]);

  const handleAddField = () => {
    const newField = {
      id: Date.now(),
      parameter: null,
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
    // Only update inputFields - the useEffect will handle syncing to selectedParameters
    setInputFields((prevFields) =>
      prevFields.map((field) => {
        if (field.id === id) {
          // If parameter changed, reset the value based on the type
          if (key === "parameter") {
            const newField = { ...field, [key]: value, value: "" };
            return newField;
          }
          return { ...field, [key]: value };
        }
        return field;
      })
    );
  };

  // Generate the appropriate input component based on parameter type
  const renderValueInput = (field: any) => {
    if (!field.parameter) {
      return (
        <InputText
          value={field.value}
          onChange={(e) => handleFieldChange(field.id, "value", e.target.value)}
          placeholder="Enter value"
          className="w-12rem"
        />
      );
    }

    const parameterConfig = PARAMETER_TYPES[field.parameter];
    if (!parameterConfig) {
      return (
        <InputText
          value={field.value}
          onChange={(e) => handleFieldChange(field.id, "value", e.target.value)}
          placeholder="Enter value"
          className="w-12rem"
        />
      );
    }

    switch (parameterConfig.type) {
      case "int": {
        const numConfig = parameterConfig as NumberParameterConfig;
        return (
          <InputNumber
            value={field.value === "" ? null : Number(field.value)}
            onChange={(e) => handleFieldChange(field.id, "value", e.value)}
            placeholder="Enter number"
            className="w-12rem"
            min={numConfig.min !== null ? numConfig.min : undefined}
            max={numConfig.max !== null ? numConfig.max : undefined}
          />
        );
      }
      case "date":
        return (
          <Calendar
            value={field.value ? new Date(field.value) : null}
            onChange={(e) => handleFieldChange(field.id, "value", e.value)}
            placeholder="Select date"
            className="w-12rem"
            dateFormat="dd/mm/yy"
          />
        );
      case "datetime":
        return (
          <Calendar
            value={field.value ? new Date(field.value) : null}
            onChange={(e) => handleFieldChange(field.id, "value", e.value)}
            placeholder="Select date and time"
            className="w-12rem"
            showTime
            hourFormat="24"
            dateFormat="dd/mm/yy"
          />
        );
      case "time":
        return (
          <InputText
            value={field.value}
            onChange={(e) =>
              handleFieldChange(field.id, "value", e.target.value)
            }
            placeholder="HH:MM:SS"
            className="w-12rem"
          />
        );
      case "timerange":
        return (
          <InputText
            value={field.value}
            onChange={(e) =>
              handleFieldChange(field.id, "value", e.target.value)
            }
            placeholder="12:00:00 - 23:59:59"
            className="w-12rem"
          />
        );
      case "string":
        // For SCHEME_VALID_FOR we want to provide some context with placeholder
        if (field.parameter === "SCHEME_VALID_FOR") {
          return (
            <InputText
              value={field.value}
              onChange={(e) =>
                handleFieldChange(field.id, "value", e.target.value)
              }
              placeholder="e.g. 60 minutes or 1 month"
              className="w-12rem"
            />
          );
        }
        // For VALID_BETWEEN_DAYS we provide appropriate placeholder
        else if (field.parameter === "VALID_BETWEEN_DAYS") {
          return (
            <InputText
              value={field.value}
              onChange={(e) =>
                handleFieldChange(field.id, "value", e.target.value)
              }
              placeholder="Enter days e.g. Monday,Friday"
              className="w-12rem"
            />
          );
        }
        // Default string input
        return (
          <InputText
            value={field.value}
            onChange={(e) =>
              handleFieldChange(field.id, "value", e.target.value)
            }
            placeholder="Enter value"
            className="w-12rem"
          />
        );
      default:
        return (
          <InputText
            value={field.value}
            onChange={(e) =>
              handleFieldChange(field.id, "value", e.target.value)
            }
            placeholder="Enter value"
            className="w-12rem"
          />
        );
    }
  };

  // Debug logging
  useEffect(() => {
    console.log("Input Fields:", inputFields);
    console.log("Selected Parameters:", selectedParameters);
  }, [inputFields, selectedParameters]);

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
        <TabPanel header="Plan Parameters">
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
                <label className="field-label">Parameter Name</label>
                <label className="field-label">Parameter Value</label>
              </div>
              {inputFields.map((field) => (
                <div key={field.id}>
                  <div className="field-grid">
                    <Dropdown
                      value={field.parameter}
                      options={parameters.map((param) => ({
                        label: param.parameter,
                        value: param.parameter,
                      }))}
                      onChange={(e) =>
                        handleFieldChange(field.id, "parameter", e.value)
                      }
                      placeholder="Select Parameter"
                      className="w-12rem"
                    />
                    {renderValueInput(field)}
                    <Button
                      label="Clear"
                      icon="pi pi-trash"
                      onClick={() => handleRemoveField(field.id)}
                      className="p-button-danger"
                    />
                  </div>
                  {validationErrors[field.id] && (
                    <div className="field-grid">
                      <div></div>
                      <small className="p-error">
                        {validationErrors[field.id]}
                      </small>
                      <div></div>
                    </div>
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

export default ParameterDetails;
