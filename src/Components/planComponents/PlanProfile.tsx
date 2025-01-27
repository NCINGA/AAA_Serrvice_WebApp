import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useQuery } from "@apollo/client";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { GET_PROFILES, GET_STATE } from "../../graphql/queries";
import { IPlanProfile } from "../../interface/data";

interface PlanProfileProps {
  setSelectedProfiles: Dispatch<SetStateAction<any[]>>;
  selectedProfiles?: any[];
  onSelectedProfiles:(profiles: IPlanProfile[]) => void;
  fetchProfilesStatus: any;

}

const PlanProfile = ({
  selectedProfiles,
  setSelectedProfiles,
  onSelectedProfiles,
  fetchProfilesStatus
}: PlanProfileProps) => {
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [combinedData, setCombinedData] = useState([]);

  const {
    loading: profilesLoading,
    error: profilesError,
    data: profilesData,
    refetch: refetchProfiles,
  } = useQuery(GET_PROFILES, {
    variables: { page: first / rows, size: rows },
    notifyOnNetworkStatusChange: true,
  });

  const {
    loading: stateLoading,
    error: stateError,
    data: stateData,
  } = useQuery(GET_STATE);

  useEffect(() => {
    if (profilesData && stateData) {
      const profiles = profilesData.getProfiles || [];
      

      

      // Combine profile data with state data based on profileId
      const mergedData = profiles.map((profile:any) => {
        console.log("Profile", profile)
        
        const matchingState = fetchProfilesStatus?.planProfiles?.find(
          (p:any) => p.profileId === profile.profileId
        );

        console.log("matchingState", matchingState)
     
        return {
          ...profile,
          state: matchingState ? matchingState.state || matchingState.status: "N/A",
        };
         
      });

      setCombinedData(mergedData);

      console.log("Profile Data", "fetchProfilesStatus>>",fetchProfilesStatus?.planProfiles, "mergedData>>",mergedData)

   
    }
  }, [profilesData, fetchProfilesStatus, stateData]);

  const onPageChange = (event:any) => {
    setFirst(event.first);
    setRows(event.rows);
    refetchProfiles({ page: event.first / event.rows, size: event.rows });
  };

  const handleSearch = (e:any) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = combinedData.filter(
      (profile) =>
        profile.profileKey.toLowerCase().includes(term) ||
        profile.description.toLowerCase().includes(term)
    );
    setCombinedData(filtered);
  };

  const handleStateChange = (e:any, rowData:any) => {
    const newState = e.value;

    // Update the state in combinedData and selectedProfiles
    const updatedData = combinedData.map((profile) =>
      profile.profileId === rowData.profileId
        ? { ...profile, state: newState }
        : profile
    );
    setCombinedData(updatedData);

    const updatedSelectedProfiles = selectedProfiles?.map((profile) =>
      profile.profileId === rowData.profileId
        ? { ...profile, state: newState }
        : profile
    );
    setSelectedProfiles(updatedSelectedProfiles);
    onSelectedProfiles(updatedSelectedProfiles);
  };

  if (profilesError || stateError) {
    return (
      <div>
        Error fetching data: {profilesError?.message || stateError?.message}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex align-items-center justify-content-between mb-3">
        <span className="p-input-icon-left" style={{ width: "300px" }}>
          <InputText
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search Profiles"
            style={{ width: "100%" }}
          />
        </span>
      </div>

      <DataTable
        value={combinedData}
        loading={profilesLoading || stateLoading}
        selectionMode="multiple"
        selection={selectedProfiles ?? []}
        onSelectionChange={(e) => setSelectedProfiles(e.value)}
        dataKey="profileId"
        first={first}
        rows={rows}
        totalRecords={profilesData?.getProfiles?.length || 0}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={onPageChange}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="profileKey" header="Profile Key" />
        <Column field="description" header="Description" />
        <Column
          header="State"
          body={(rowData) => (
            <Dropdown
                value={rowData.state}
                options={stateData?.getState?.map((state:any) => ({
                label: state.state,
                value: state.state,
              }))}
              onChange={(e) => handleStateChange(e, rowData)}
              placeholder="Select State"
            />
          )}
        />
      </DataTable>
    </div>
  );
};

export default PlanProfile;
