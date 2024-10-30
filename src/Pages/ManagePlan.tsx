import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PLANS, UPDATE_PLANS } from '../graphql/queries';
import { useLocation, useNavigate } from 'react-router-dom';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const ManagePlan = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const planData = location.state?.planData;

    const [typeId, setTypeId] = useState('');
    const [planName, setPlanName] = useState('');
    const [description, setDescription] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (planData) {
            setTypeId(planData.typeId.toString());
            setPlanName(planData.planName);
            setDescription(planData.description);
            setIsEditing(true);
        } else {
            console.error('No plan data found in location state.');
        }
    }, [planData]);

    const [updatePlan] = useMutation(UPDATE_PLANS, {
        onCompleted: () => {
            navigate('/view-plans');
        },
        onError: (error) => {
            console.error('Error updating plan:', error);
            setErrorMsg(error.message); // Capture error message
        }
    });

    const [createPlan, { loading }] = useMutation(CREATE_PLANS, {
        onCompleted: () => {
            navigate('/view-plans');
            setTypeId('');
            setPlanName('');
            setDescription('');
        },
        onError: (error) => {
            console.error('Error creating plan:', error);
            setErrorMsg(error.message); // Capture error message
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsedTypeId = parseInt(typeId);
        const parsedPlanId = planData ? parseInt(planData.planId) : null;

        if (isEditing) {
            if (isNaN(parsedPlanId)) {
                console.error('Invalid planId, cannot update:', parsedPlanId);
                return;
            }

            updatePlan({
                variables: {
                    planId: parsedPlanId,
                    typeId: parsedTypeId,  // Pass as integer
                    planName,
                    description,
                },
            });
        } else {
            if (isNaN(parsedTypeId)) {
                console.error('Invalid typeId, cannot create:', parsedTypeId);
                return;
            }

            console.log('Creating plan with variables:', {
                typeId: parsedTypeId, // Pass as integer
                planName,
                description,
            });

            createPlan({
                variables: {
                    typeId: parsedTypeId, // Pass as integer
                    planName,
                    description,
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-field">
                <label htmlFor="typeId">Type ID:</label>
                <InputText
                    id="typeId"
                    value={typeId}
                    onChange={(e) => setTypeId(e.target.value)}
                    required
                />
            </div>
            <div className="p-field">
                <label htmlFor="planName">Plan Name:</label>
                <InputText
                    id="planName"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    required
                />
            </div>
            <div className="p-field">
                <label htmlFor="description">Description:</label>
                <InputText
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" label={isEditing ? 'Update Plan' : 'Create Plan'} disabled={loading} />
            {loading && <p>Loading...</p>}
            {errorMsg && <Toast severity="error" summary="Error" detail={errorMsg} life={3000} />}
        </form>
    );
};

export default ManagePlan;
