import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PARAMETER_META,GET_STATE } from '../../graphql/queries';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

interface ParameterPhaseDetailsProps {
  selectedParameterPhases: any[];
  setSelectedParameterPhases: Dispatch<SetStateAction<any[]>>;
}

// Phase options
const phaseOptions = [
  { label: 'ACCOUNTING_UPDATE', value: 'ACCOUNTING_UPDATE' },
  { label: 'AUTHORIZE', value: 'AUTHORIZE' }
];

// Status options
const statusOptions = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' }
];

// Entity options
const entityOptions = [
  { label: 'Plan', value: 'PLAN' }
];

const ParameterPhaseDetails = ({
  selectedParameterPhases,
  setSelectedParameterPhases,
}: ParameterPhaseDetailsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [parameters, setParameters] = useState<any[]>([]);
  const[states,setStates]=useState<any[]>([]);
  const [inputFields, setInputFields] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch parameters
  const { data: parametersData, loading: parametersLoading, error: parametersError } = 
    useQuery(GET_PARAMETER_META);

    const { data: stateData } = useQuery(GET_STATE);

  // Load parameters from GraphQL
  useEffect(() => {
    if (parametersData) {
      setParameters(parametersData.getParameterMeta);
    }
  }, [parametersData]);

  useEffect(() => {
    if (stateData) {
      setStates(stateData.getState);
    }
  }, [stateData]);

  // Initialize inputFields with existing selectedParameterPhases or create new ones
  useEffect(() => {
    if (!isInitialized && selectedParameterPhases && selectedParameterPhases.length > 0) {
      const mappedPhases = selectedParameterPhases.map((phase) => ({
        id: phase.id || Date.now() + Math.random(),
        parameterName: phase.parameterName,
        phase: phase.phase,
        status: phase.status || 'ACTIVE',
        entityState: phase.entityState || '',
        entity: phase.entity || 'PLAN',
        isExisting: true
      }));
      
      setInputFields(mappedPhases);
      setIsInitialized(true);
    } else if (!isInitialized && inputFields.length === 0) {
      // If no phases and no input fields, initialize with an empty field
      setInputFields([{ 
        id: Date.now(), 
        parameterName: null, 
        phase: null,
        status: 'ACTIVE',
        entityState: '',
        entity: 'PLAN',
        isExisting: false 
      }]);
      setIsInitialized(true);
    }
  }, [selectedParameterPhases, isInitialized, inputFields.length]);

  // Validate a field
  const validateField = (field: any): string => {
    if (!field.parameterName) return 'Parameter is required';
    if (!field.phase) return 'Phase is required';
    if (!field.status) return 'Status is required';
    if (!field.entityState) return 'Entity State is required';
    if (!field.entity) return 'Entity is required';
    
    return '';
  };

  // Update field validation when a field changes
  const updateValidation = (fields: any[]) => {
    const errors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(field);
      if (error) {
        errors[field.id] = error;
      }
    });
    
    setValidationErrors(errors);
    return errors;
  };

  // Sync inputFields back to selectedParameterPhases whenever they change
  useEffect(() => {
    if (isInitialized) {
      // Validate all fields
      const errors = updateValidation(inputFields);
      
      // Convert all valid inputFields to the selectedParameterPhases format
      const validPhases = inputFields
        .filter(field => !errors[field.id])
        .map(field => ({
          id: field.id,
          parameterName: field.parameterName,
          phase: field.phase,
          status: field.status,
          entityState: field.entityState,
          entity: field.entity,
          isExisting: field.isExisting
        }));
      
      // Replace the entire selectedParameterPhases array
      setSelectedParameterPhases(validPhases);
    }
  }, [inputFields, isInitialized, setSelectedParameterPhases]);

  const handleAddField = () => {
    const newField = { 
      id: Date.now(), 
      parameterName: null, 
      phase: null,
      status: 'ACTIVE',
      entityState: 'PUBLISHED',
      entity: 'PLAN',
      isExisting: false 
    };
    setInputFields((prevFields) => [...prevFields, newField]);
  };

  const handleRemoveField = (id: number) => {
    setInputFields((prevFields) => prevFields.filter((field) => field.id !== id));
    setValidationErrors(prev => {
      const newErrors = {...prev};
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleFieldChange = (id: number, key: string, value: any) => {
    setInputFields((prevFields) => {
      const updatedFields = prevFields.map((field) => {
        if (field.id === id) {
          return { ...field, [key]: value };
        }
        return field;
      });
      
      // Validate the changed field
      const fieldToValidate = updatedFields.find(f => f.id === id);
      if (fieldToValidate) {
        const error = validateField(fieldToValidate);
        setValidationErrors(prev => ({
          ...prev,
          [id]: error
        }));
      }
      
      return updatedFields;
    });
  };

  // Define consistent column widths for better alignment
  const columnStyles = {
    parameter: { width: '20%', paddingRight: '10px' },
    phase: { width: '20%', paddingRight: '10px' },
    status: { width: '15%', paddingRight: '10px' },
    entityState: { width: '20%', paddingRight: '10px' },
    entity: { width: '15%', paddingRight: '10px' },
    actions: { width: '10%' }
  };

  return (
    <div className="card" style={{ display: 'flex', maxHeight: '73vh', overflowY: 'scroll', height: '73vh' }}>
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} style={{ width: '100%' }}>
        <TabPanel header="Parameter Phases">
          {parametersLoading ? (
            <p>Loading...</p>
          ) : parametersError ? (
            <p>Error loading data</p>
          ) : (
            <>
              <div className="flex mb-2 gap-2 justify-content-between align-items-center">
                <Button label="Add Phase" icon="pi pi-plus" onClick={handleAddField} />
                <div className="entity-info p-2 bg-gray-100 rounded-md">
                  <span className="font-bold mr-2">Entity:</span> Plan
                </div>
              </div>
              <Divider />
              <div className="field-headers" style={{ display: 'flex', marginBottom: '10px' }}>
                <div className="font-bold" style={columnStyles.parameter}>Parameter</div>
                <div className="font-bold" style={columnStyles.phase}>Phase</div>
                <div className="font-bold" style={columnStyles.status}>Status</div>
                <div className="font-bold" style={columnStyles.entityState}>Entity State</div>
                <div className="font-bold" style={columnStyles.entity}>Entity</div>
                <div className="font-bold" style={columnStyles.actions}></div>
              </div>
              
              {inputFields.map((field) => (
                <div key={field.id} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={columnStyles.parameter}>
                      <Dropdown
                        value={field.parameterName}
                        options={parameters.map((param) => ({
                          label: param.parameter,
                          value: param.parameter,
                        }))}
                        onChange={(e) => handleFieldChange(field.id, 'parameterName', e.value)}
                        placeholder="Select Parameter"
                        className="w-full"
                      />
                    </div>
                    <div style={columnStyles.phase}>
                      <Dropdown
                        value={field.phase}
                        options={phaseOptions}
                        onChange={(e) => handleFieldChange(field.id, 'phase', e.value)}
                        placeholder="Select Phase"
                        className="w-full"
                      />
                    </div>
                    <div style={columnStyles.status}>
                      <Dropdown
                        value={field.status}
                        options={statusOptions}
                        onChange={(e) => handleFieldChange(field.id, 'status', e.value)}
                        placeholder="Select Status"
                        className="w-full"
                      />
                    </div>
                    <div style={columnStyles.entityState}>
                      <Dropdown
                        value={field.entityState}
                        options={states.map((state) => ({
                          label: state.state,
                        value: state.state,
                        }))}
                        onChange={(e) => handleFieldChange(field.id, 'entityState', e.value)}
                        placeholder="Select Entity State"
                        className="w-full"
                      />
                    </div>
                    <div style={columnStyles.entity}>
                      <Dropdown
                        value={field.entity}
                        options={entityOptions}
                        onChange={(e) => handleFieldChange(field.id, 'entity', e.value)}
                        placeholder="Select Entity"
                        className="w-full"
                      />
                    </div>
                    <div style={columnStyles.actions}>
                      <Button
                        icon="pi pi-trash"
                        onClick={() => handleRemoveField(field.id)}
                        className="p-button-danger"
                      />
                    </div>
                  </div>
                  {validationErrors[field.id] && (
                    <small className="p-error block" style={{ marginTop: '4px' }}>
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

export default ParameterPhaseDetails;