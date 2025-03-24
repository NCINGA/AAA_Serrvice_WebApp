import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACTIONS, GET_PARAMETER_META } from '../../graphql/queries';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

interface ParameterActionDetailsProps {
  selectedParameterActions: any[];
  setSelectedParameterActions: Dispatch<SetStateAction<any[]>>;
}

// Action phase options
const actionPhaseOptions = [
  { label: 'ACCOUNTING_UPDATE', value: 'ACCOUNTING_UPDATE' },
  { label: 'AUTHORIZE', value: 'AUTHORIZE' }
];

// Match Return options (0 or 1 only)
const matchReturnOptions = [
  { label: '0', value: 0 },
  { label: '1', value: 1 }
];

const ParameterActionDetails = ({
  selectedParameterActions,
  setSelectedParameterActions,
}: ParameterActionDetailsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [actions, setActions] = useState<any[]>([]);
  const [parameters, setParameters] = useState<any[]>([]);
  const [inputFields, setInputFields] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Query to fetch actions
  const { data: actionsData, loading: actionsLoading, error: actionsError } = useQuery(GET_ACTIONS);
  
  // Fetch parameters
  const { data: parametersData, loading: parametersLoading, error: parametersError } = 
    useQuery(GET_PARAMETER_META);

  // Load actions and parameters from GraphQL
  useEffect(() => {
    if (actionsData) {
      setActions(actionsData.getActions);
    }
    if (parametersData) {
      setParameters(parametersData.getParameterMeta);
    }
  }, [actionsData, parametersData]);

  // Initialize inputFields with existing selectedParameterActions or create new ones
  useEffect(() => {
    if (!isInitialized && selectedParameterActions && selectedParameterActions.length > 0) {
      const mappedActions = selectedParameterActions.map((action) => ({
        id: action.id || Date.now() + Math.random(),
        actionId: action.actionId,
        actionPhase: action.actionPhase,
        parameterName: action.parameterName,
        actionSequence: action.actionSequence || 1,
        matchReturn: action.matchReturn !== undefined ? (action.matchReturn === 1 ? 1 : 0) : 0, // Ensure it's either 0 or 1
        entity: action.entity || 'PLAN',
        isExisting: true
      }));
      
      setInputFields(mappedActions);
      setIsInitialized(true);
    } else if (!isInitialized && inputFields.length === 0) {
      // If no actions and no input fields, initialize with an empty field
      setInputFields([{ 
        id: Date.now(), 
        actionId: null, 
        actionPhase: null, 
        parameterName: null, 
        actionSequence: 1,
        matchReturn: 0, // Initialize as 0
        entity: 'PLAN',
        isExisting: false 
      }]);
      setIsInitialized(true);
    }
  }, [selectedParameterActions, isInitialized, inputFields.length]);

  // Validate a field
  const validateField = (field: any): string => {
    if (!field.actionId) return 'Action is required';
    if (!field.actionPhase) return 'Action phase is required';
    if (!field.parameterName) return 'Parameter is required';
    if (!field.entity) return 'Entity is required';
    
    // Validate matchReturn is either 0 or 1
    if (field.matchReturn !== 0 && field.matchReturn !== 1) {
      return 'Match Return must be either 0 or 1';
    }
    
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

  // Sync inputFields back to selectedParameterActions whenever they change
  useEffect(() => {
    if (isInitialized) {
      // Validate all fields
      const errors = updateValidation(inputFields);
      
      // Convert all valid inputFields to the selectedParameterActions format
      const validActions = inputFields
        .filter(field => !errors[field.id])
        .map(field => ({
          id: field.id,
          actionId: field.actionId,
          actionPhase: field.actionPhase,
          parameterName: field.parameterName,
          actionSequence: field.actionSequence,
          matchReturn: field.matchReturn, // Will be either 0 or 1
          entity: field.entity,
          isExisting: field.isExisting
        }));
      
      // Replace the entire selectedParameterActions array
      setSelectedParameterActions(validActions);
    }
  }, [inputFields, isInitialized, setSelectedParameterActions]);

  const handleAddField = () => {
    const newField = { 
      id: Date.now(), 
      actionId: null, 
      actionPhase: null, 
      parameterName: null, 
      actionSequence: 1,
      matchReturn: 0, // Initialize as 0
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
    action: { width: '20%', paddingRight: '10px' },
    phase: { width: '20%', paddingRight: '10px' },
    parameter: { width: '20%', paddingRight: '10px' },
    sequence: { width: '12%', paddingRight: '10px' },
    matchReturn: { width: '20%', paddingRight: '10px' },
    actions: { width: '8%' }
  };

  return (
    <div className="card" style={{ display: 'flex', maxHeight: '73vh', overflowY: 'scroll', height: '73vh' }}>
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} style={{ width: '100%' }}>
        <TabPanel header="Parameter Actions">
          {actionsLoading || parametersLoading ? (
            <p>Loading...</p>
          ) : actionsError || parametersError ? (
            <p>Error loading data</p>
          ) : (
            <>
              <div className="flex mb-2 gap-2 justify-content-between align-items-center">
                <Button label="Add Action" icon="pi pi-plus" onClick={handleAddField} />
                <div className="entity-info p-2 bg-gray-100 rounded-md">
                  <span className="font-bold mr-2">Entity:</span> Plan
                </div>
              </div>
              <Divider />
              <div className="field-headers" style={{ display: 'flex', marginBottom: '10px' }}>
                <div className="font-bold" style={columnStyles.action}>Action</div>
                <div className="font-bold" style={columnStyles.phase}>Phase</div>
                <div className="font-bold" style={columnStyles.parameter}>Parameter</div>
                <div className="font-bold" style={columnStyles.sequence}>Sequence</div>
                <div className="font-bold" style={columnStyles.matchReturn}>Match Return</div>
                <div className="font-bold" style={columnStyles.actions}></div>
              </div>
              
              {inputFields.map((field) => (
                <div key={field.id} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={columnStyles.action}>
                      <Dropdown
                        value={field.actionId}
                        options={actions.map((action) => ({
                          label: action.actionName,
                          value: action.actionId,
                        }))}
                        onChange={(e) => handleFieldChange(field.id, 'actionId', e.value)}
                        placeholder="Select Action"
                        className="w-full"
                      />
                    </div>
                    <div style={columnStyles.phase}>
                      <Dropdown
                        value={field.actionPhase}
                        options={actionPhaseOptions}
                        onChange={(e) => handleFieldChange(field.id, 'actionPhase', e.value)}
                        placeholder="Select Phase"
                        className="w-full"
                      />
                    </div>
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
                    <div style={columnStyles.sequence}>
                      <InputText
                        value={field.actionSequence}
                        onChange={(e) => handleFieldChange(field.id, 'actionSequence', parseInt(e.target.value) || 1)}
                        placeholder="Sequence"
                        className="w-full"
                        type="number"
                        min="1"
                      />
                    </div>
                    <div style={columnStyles.matchReturn}>
                      <Dropdown
                        value={field.matchReturn}
                        options={matchReturnOptions}
                        onChange={(e) => handleFieldChange(field.id, 'matchReturn', e.value)}
                        placeholder="Select Value"
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

export default ParameterActionDetails;