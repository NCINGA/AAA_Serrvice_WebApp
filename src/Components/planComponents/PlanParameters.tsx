import  { useState, useEffect, Dispatch, SetStateAction } from 'react';
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
  const [inputFields, setInputFields] = useState([
    { id: Date.now(), parameter: null, value: '' },
  ]);

  const { data, loading, error } = useQuery(GET_PARAMETER_META);

  useEffect(() => {
    if (data) {
      setParameters(data.getParameterMeta);
    }
  }, [data]);

 

  // useEffect(() => {
  //   const parameters = selectedParameters.map((p: any, index: number) => ({
  //     id: index,
  //     parameter: p.parameterName,
  //     value: p.parameterValue,
  //   }));
  //   setInputFields(parameters);
  // }, [selectedParameters]);

  const handleAddField = () => {
    const newField = { id: Date.now(), parameter: null, value: '' };
    setInputFields((prevFields) => [...prevFields, newField]);
  };

  const handleRemoveField = (id: number) => {
    // Remove from inputFields
    setInputFields((prevFields) => prevFields.filter((field) => field.id !== id));
  
    // Remove from selectedParameters
    setSelectedParameters((prevParams) => {
      const updatedParams = prevParams.filter((param) => param.id !== id);
      return updatedParams;
    });
  };
  

  const handleFieldChange = (id: number, key: string, value: any) => {
    setInputFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  
    setSelectedParameters((prevParams) => {
      const updatedParams = prevParams.map((param) =>
        param.id === id ? { ...param, [key]: value } : param
      );
      if (updatedParams.find((param) => param.id === id)) {
        
        return updatedParams;
      }
      return prevParams;
    });
  

    // Update selected parameters if the field is already selected
    setSelectedParameters((prevParams) => {
      const updatedParams = prevParams.map((param) =>
        param.id === id ? { ...param, [key]: value } : param
      );
      if (updatedParams.find((param) => param.id === id)) {
        return updatedParams;
      }
      return prevParams;
    });
  };

  const handleSelectField = (id: number) => {
    const selectedField = inputFields.find((field) => field.id === id);
    if (selectedField) {
      setSelectedParameters((prev) => {
        const alreadySelected = prev.some((param) => param.id === id);
        if (!alreadySelected) {
          const updatedParams = [...prev, selectedField]; 
          return updatedParams;
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    const parameters=selectedParameters.map((p:any)=>({id:p.parameterId, parameter:p.parameterName, value:p.parameterValue}));
    setInputFields(parameters);
    setSelectedParameters(parameters);

  }, []);

  useEffect(() => {
    console.log("Updated Parameters:", selectedParameters);
  }, [selectedParameters]);


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
                    onClick={() => handleSelectField(field.id)}
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
                    label="Remove"
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
