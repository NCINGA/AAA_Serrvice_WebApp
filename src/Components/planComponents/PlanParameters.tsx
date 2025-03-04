import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PARAMETER_META } from '../../graphql/queries';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

interface ParameterDetailsProps {
  selectedParameters: any[];
  setSelectedParameters: Dispatch<SetStateAction<any[]>>;
}

const ParameterDetails = ({
  selectedParameters,
  setSelectedParameters,
}: ParameterDetailsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [parameters, setParameters] = useState<any[]>([]);
  const [inputFields, setInputFields] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

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
        isExisting: true // Mark as existing parameter
      }));
      setInputFields(mappedParameters);
      setIsInitialized(true);
    } else if (!isInitialized && inputFields.length === 0) {
      // If no parameters and no input fields, initialize with an empty field
      setInputFields([{ id: Date.now(), parameter: null, value: '', isExisting: false }]);
      setIsInitialized(true);
    }
  }, [selectedParameters, isInitialized, inputFields.length]);

  // Sync inputFields back to selectedParameters whenever they change
  useEffect(() => {
    if (isInitialized) {
      // Convert all valid inputFields to the selectedParameters format
      const validParameters = inputFields
        .filter(field => field.parameter && field.value)
        .map(field => ({
          id: field.id,
          parameterName: field.parameter,
          parameterValue: field.value,
          parameter: field.parameter,
          value: field.value,
          isExisting: field.isExisting
        }));
      
      // Replace the entire selectedParameters array
      setSelectedParameters(validParameters);
    }
  }, [inputFields, isInitialized, setSelectedParameters]);

  const handleAddField = () => {
    const newField = { id: Date.now(), parameter: null, value: '', isExisting: false };
    setInputFields((prevFields) => [...prevFields, newField]);
  };

  const handleRemoveField = (id: number) => {
    // Remove from inputFields only
    setInputFields((prevFields) => prevFields.filter((field) => field.id !== id));
    // The useEffect will handle updating selectedParameters
  };

  const handleFieldChange = (id: number, key: string, value: any) => {
    // Only update inputFields - the useEffect will handle syncing to selectedParameters
    setInputFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  // Debug logging
  useEffect(() => {
    console.log("Input Fields:", inputFields);
    console.log("Selected Parameters:", selectedParameters);
  }, [inputFields, selectedParameters]);

  return (
    <div className="card">
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header="Plan Parameters">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error loading data</p>
          ) : (
            <>
              <div className="flex mb-2 gap-2 justify-content-start">
                <Button label="Add" icon="pi pi-plus" onClick={handleAddField} />
              </div>
              <Divider />
              <div className="field-grid">
                <label className="field-label">Parameter Name</label>
                <label className="field-label">Parameter Value</label>
              </div>
              {inputFields.map((field) => (
                <div key={field.id} className="field-grid">
                  <Dropdown
                    value={field.parameter}
                    options={parameters.map((param) => ({
                      label: param.parameter,
                      value: param.parameter,
                    }))}
                    onChange={(e) =>
                      handleFieldChange(field.id, 'parameter', e.value)
                    }
                    placeholder="Select Parameter"
                    className="w-12rem"
                  />
                  <InputText
                    value={field.value}
                    onChange={(e) =>
                      handleFieldChange(field.id, 'value', e.target.value)
                    }
                    placeholder="Enter value"
                    className="w-12rem"
                  />
                  <Button
                    label="Clear"
                    icon="pi pi-trash"
                    onClick={() => handleRemoveField(field.id)}
                    className="p-button-danger"
                  />
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