import React, { FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_SUBSCRIBER_BY_ID } from "../graphql/queries";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import AppHeader from "../Components/header/AppHeader";

const SubscriberDetails: FC = () => {
  const { subscriberId } = useParams<{ subscriberId: string }>();
  const navigate = useNavigate();

  // Fetch subscriber details using the ID from the URL
  const { loading, error, data } = useQuery(GET_SUBSCRIBER_BY_ID, {
    variables: { subscriberId: parseInt(subscriberId || "0") },
    skip: !subscriberId,
  });

  if (loading)
    return (
      <div className="card w-full h-full">
        <AppHeader title="Subscriber Details" />
        <div
          className="flex items-center justify-center"
          style={{ marginTop: "100px" }}
        >
          <i className="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
          <span className="ml-2 text-xl">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="card w-full h-full">
        <AppHeader title="Subscriber Details" />
        <div style={{ marginTop: "100px", padding: "20px" }}>
          <Card>
            <div className="p-4">
              <h3 className="text-red-500 text-xl mb-2">Error Loading Data</h3>
              <p>Error: {error.message}</p>
              <Button
                icon="pi pi-arrow-left"
                label="Back to Subscribers"
                className="mt-4"
                onClick={() => navigate(-1)}
              />
            </div>
          </Card>
        </div>
      </div>
    );

  if (!data?.getSubscriberById)
    return (
      <div className="card w-full h-full">
        <AppHeader title="Subscriber Details" />
        <div style={{ marginTop: "100px", padding: "20px" }}>
          <Card>
            <div className="p-4">
              <h3 className="text-yellow-500 text-xl mb-2">
                Subscriber Not Found
              </h3>
              <p>The requested subscriber could not be found.</p>
              <Button
                icon="pi pi-arrow-left"
                label="Back to Subscribers"
                className="mt-4"
                onClick={() => navigate(-1)}
              />
            </div>
          </Card>
        </div>
      </div>
    );

  const subscriber = data.getSubscriberById;

  // Prepare chart data for data usage
  const usageChartData = {
    labels: ["Download", "Upload", "Out of Bundle"],
    datasets: [
      {
        data: [
          subscriber.dataUsages?.[0]?.totalDownload / 1e9 || 0,
          subscriber.dataUsages?.[0]?.totalUpload / 1e9 || 0,
          subscriber.dataUsages?.[0]?.obUsage / 1e9 || 0,
        ],
        backgroundColor: ["#42A5F5", "#66BB6A", "#FFA726"],
        hoverBackgroundColor: ["#64B5F6", "#81C784", "#FFB74D"],
      },
    ],
  };

  // Chart options
  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.label + ": " + context.raw.toFixed(2) + " GB";
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="card w-full h-full">
      <AppHeader
        title={`Subscriber Details of ${subscriber.username} #${subscriber.subscriberId} `}
      />

      <div style={{ padding: "20px", marginTop: "80px" }}>
        <Button
          icon="pi pi-arrow-left"
          label="Back to Subscribers"
          className="mb-4"
          onClick={() => navigate(-1)}
        />

        <h2 className="text-2xl font-bold mb-4">
          Subscriber #{subscriber.subscriberId}
        </h2>

        {/* Subscriber Information Card */}
        <Card className="mb-4">
          <h3 className="text-xl font-bold mb-4">Subscriber Information</h3>
          <div className="grid">
            <div className="col-12 md:col-6 lg:col-3 mb-3">
              <p className="font-semibold mb-1">Username</p>
              <p>{subscriber.username}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3 mb-3">
              <p className="font-semibold mb-1">Status</p>
              <p
                className={`${
                  subscriber.status?.toLowerCase() === "active"
                    ? "text-green-600"
                    : subscriber.status?.toLowerCase() === "suspended"
                    ? "text-yellow-600"
                    : subscriber.status?.toLowerCase() === "terminated"
                    ? "text-red-600"
                    : "text-gray-600"
                } font-medium`}
              >
                {subscriber.status}
              </p>
            </div>
            <div className="col-12 md:col-6 lg:col-3 mb-3">
              <p className="font-semibold mb-1">Email</p>
              <p>{subscriber.email}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3 mb-3">
              <p className="font-semibold mb-1">Contact</p>
              <p>{subscriber.contactNo || "N/A"}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3 mb-3">
              <p className="font-semibold mb-1">External ID</p>
              <p>{subscriber.extId || "N/A"}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3 mb-3">
              <p className="font-semibold mb-1">Created Date</p>
              <p>{formatDate(subscriber.createdDate)}</p>
            </div>
            <div className="col-12 md:col-6 lg:col-3 mb-3">
              <p className="font-semibold mb-1">Updated Time</p>
              <p>{formatDate(subscriber.updatedTime)}</p>
            </div>
          </div>
        </Card>

        {/* Subscriber Plan Card */}
        <Card className="mb-4">
          <h3 className="text-xl font-bold mb-4">Subscriber Plan</h3>
          {subscriber.subscriberPlan && subscriber.subscriberPlan.length > 0 ? (
            <div className="grid">
              {subscriber.subscriberPlan.map((plan: any, index: any) => (
                <React.Fragment key={index}>
                  <div className="col-12 md:col-6 lg:col-3 mb-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-gray-600 font-bold mb-1">
                        Plan Name
                      </p>
                      <p className="font-medium">{plan.planName || "N/A"}</p>
                    </div>
                  </div>
                  <div className="col-12 md:col-6 lg:col-3 mb-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-gray-600 font-bold mb-1">
                        Plan ID
                      </p>
                      <p className="font-medium">{plan.planId}</p>
                    </div>
                  </div>
                  <div className="col-12 md:col-6 lg:col-3 mb-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-gray-600 font-bold mb-1">
                        Plan State
                      </p>
                      <p
                        className={`font-medium ${
                          plan.planState?.toLowerCase() === "active"
                            ? "text-green-600"
                            : plan.planState?.toLowerCase() === "suspended"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {plan.planState}
                      </p>
                    </div>
                  </div>
                  <div className="col-12 md:col-6 lg:col-3 mb-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-gray-600 font-bold mb-1">
                        Status Date
                      </p>
                      <p>{formatDate(plan.statusDate)}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center bg-gray-50 rounded">
              <p className="text-gray-500">No plan data available</p>
            </div>
          )}
        </Card>

        {/* Usage and Rollover Section */}
        <div className="grid mb-4">
          {/* Data Usage Card */}
          <div className="col-12 lg:col-6 mb-4 lg:mb-0">
            <Card>
              <h3 className="text-xl font-bold mb-4">Data Usage</h3>

              <div className="grid mb-4">
                <div className="col-12 md:col-6 lg:col-6 xl:col-3 mb-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-600 font-bold mb-1">
                      Total Usage
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                      {(subscriber.dataUsages?.[0]?.totalUsage / 1e9).toFixed(
                        2
                      )}{" "}
                      GB
                    </p>
                  </div>
                </div>
                <div className="col-12 md:col-6 lg:col-6 xl:col-3 mb-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-600 font-bold mb-1">
                      Report Date
                    </p>
                    <p>{formatDate(subscriber.dataUsages?.[0]?.reportDate)}</p>
                  </div>
                </div>
                <div className="col-12 md:col-6 lg:col-6 xl:col-3 mb-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-600 font-bold mb-1">
                      Last Reset
                    </p>
                    <p>{formatDate(subscriber.dataUsages?.[0]?.lastReset)}</p>
                  </div>
                </div>
                <div className="col-12 md:col-6 lg:col-6 xl:col-3 mb-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-600 font-bold mb-1">
                      Next Reset
                    </p>
                    <p>{formatDate(subscriber.dataUsages?.[0]?.nextReset)}</p>
                  </div>
                </div>
              </div>

              <div style={{ height: "250px" }} className="flex justify-center">
                <Chart
                  type="pie"
                  data={usageChartData}
                  options={chartOptions}
                />
              </div>
            </Card>
          </div>

          {/* Data Rollover Card */}
          <div className="col-12 lg:col-6">
            <Card>
              <h3 className="text-xl font-bold mb-4">Data Rollover</h3>

              {subscriber.dataRollovers?.[0] ? (
                <div className="grid">
                  <div className="col-12 md:col-6 mb-3">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-gray-600 font-bold mb-1">
                        Rollover ID
                      </p>
                      <p>
                        {subscriber.dataRollovers?.[0]?.rolloverId || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="col-12 md:col-6 mb-3">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-gray-600 font-bold mb-1">
                        Rollover Date
                      </p>
                      <p>
                        {formatDate(
                          subscriber.dataRollovers?.[0]?.rolloverDate
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="col-12 md:col-6 mb-3">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-gray-600 font-bold mb-1">
                        Quota
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {(
                          subscriber.dataRollovers?.[0]?.rolloverQuotaBytes /
                          1e9
                        ).toFixed(2)}{" "}
                        GB
                      </p>
                    </div>
                  </div>
                  <div className="col-12 md:col-6 mb-3">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-gray-600 font-bold mb-1">
                        Valid Till
                      </p>
                      <p>
                        {formatDate(subscriber.dataRollovers?.[0]?.validTill)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center bg-gray-50 rounded">
                  <p className="text-gray-500">No rollover data available</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Device Whitelist Card */}
        <Card className="mb-4">
          <h3 className="text-xl font-bold mb-4">Device Whitelist</h3>

          <DataTable
            value={subscriber.deviceWhitelist || []}
            rows={5}
            paginator={subscriber.deviceWhitelist?.length > 5}
            rowsPerPageOptions={[5, 10, 20]}
            className="p-datatable-sm"
            emptyMessage="No whitelisted devices available"
            responsiveLayout="scroll"
            showGridlines
          >
            <Column field="id" header="ID" style={{ width: "10%" }} />
            <Column
              field="MACAddress"
              header="MAC Address"
              style={{ width: "20%" }}
            />
            <Column
              field="description"
              header="Description"
              style={{ width: "30%" }}
            />
            <Column
              field="status"
              header="Status"
              body={(rowData) => (
                <span
                  className={`${
                    rowData.status?.toLowerCase() === "active"
                      ? "text-green-600"
                      : rowData.status?.toLowerCase() === "inactive"
                      ? "text-red-600"
                      : "text-gray-600"
                  } font-medium`}
                >
                  {rowData.status}
                </span>
              )}
              style={{ width: "20%" }}
            />
            <Column
              field="createAt"
              header="Created At"
              body={(rowData) => formatDate(rowData.createAt)}
              style={{ width: "20%" }}
            />
          </DataTable>
        </Card>

        {/* Default Plan Parameters Card */}
        <Card className="mb-4">
          <h3 className="text-xl font-bold mb-4">Default Plan Parameters</h3>

          <DataTable
            value={
              subscriber.defaultParameters
                ? subscriber.defaultParameters.flatMap((item:any) =>
                    item.parameters.map((param:any) => ({
                      planId: item.planId,
                      ...param,
                    }))
                  )
                : []
            }
            rows={5}
            paginator={
              subscriber.defaultParameters?.[0]?.parameters?.length > 5
            }
            rowsPerPageOptions={[5, 10, 20]}
            className="p-datatable-sm"
            emptyMessage="No default plan parameters available"
            responsiveLayout="scroll"
            showGridlines
          >
            <Column field="planId" header="Plan ID" style={{ width: "20%" }} />
            
            <Column
              field="parameterName"
              header="Parameter Name"
              style={{ width: "30%" }}
            />
            <Column
              field="parameterValue"
              header="Parameter Value"
              style={{ width: "30%" }}
            />
          </DataTable>
        </Card>

        {/* Plan Parameter Override Card */}
        <Card className="mb-4">
          <h3 className="text-xl font-bold mb-4">Plan Parameter Overrides</h3>

          <DataTable
            value={subscriber.planParameterSubscriberOverRide || []}
            rows={5}
            paginator={subscriber.planParameterSubscriberOverRide?.length > 5}
            rowsPerPageOptions={[5, 10, 20]}
            className="p-datatable-sm"
            emptyMessage="No plan parameter overrides available"
            responsiveLayout="scroll"
            showGridlines
          >
            <Column field="planId" header="Plan ID" style={{ width: "25%" }} />
            <Column
              field="parameterName"
              header="Parameter Name"
              style={{ width: "35%" }}
            />
            <Column
              field="parameterValue"
              header="Parameter Value"
              style={{ width: "40%" }}
            />
          </DataTable>
        </Card>

        {/* Profile AVP Override Card */}
        <Card className="mb-4">
          <h3 className="text-xl font-bold mb-4">Profile AVP Overrides</h3>

          <DataTable
            value={subscriber.profileAvpSubscriberOverRide || []}
            rows={5}
            paginator={subscriber.profileAvpSubscriberOverRide?.length > 5}
            rowsPerPageOptions={[5, 10, 20]}
            className="p-datatable-sm"
            emptyMessage="No profile AVP overrides available"
            responsiveLayout="scroll"
            showGridlines
          >
            <Column field="planId" header="Plan ID" style={{ width: "20%" }} />
            <Column
              field="overRideKey"
              header="Override Key"
              style={{ width: "25%" }}
            />
            <Column
              field="overRideValue"
              header="Override Value"
              style={{ width: "25%" }}
            />
            <Column
              field="overRideWhen"
              header="Override When"
              style={{ width: "30%" }}
            />
          </DataTable>
        </Card>

        {/* Sessions Table Card */}
        <Card>
          <h3 className="text-xl font-bold mb-4">Subscriber Sessions</h3>

          <DataTable
            value={subscriber.subscriberSessions || []}
            rows={5}
            paginator={subscriber.subscriberSessions?.length > 5}
            rowsPerPageOptions={[5, 10, 20]}
            className="p-datatable-sm"
            emptyMessage="No session data available"
            responsiveLayout="scroll"
            showGridlines
          >
            <Column
              field="sessionId"
              header="Session ID"
              style={{ width: "15%" }}
            />
            <Column
              field="startTime"
              header="Start Time"
              body={(rowData) => formatDate(rowData.startTime)}
              style={{ width: "20%" }}
            />
            <Column
              field="nasIpv4"
              header="NAS IPv4"
              style={{ width: "15%" }}
            />
            <Column
              field="nasIpv6"
              header="NAS IPv6"
              style={{ width: "15%" }}
            />
            <Column
              field="nasPort"
              header="NAS Port"
              style={{ width: "10%" }}
            />
            <Column
              field="nasPortType"
              header="NAS Port Type"
              style={{ width: "10%" }}
            />
            <Column
              field="download"
              header="Download"
              body={(rowData) => (
                <span className="text-blue-600 font-medium">
                  {(rowData.downloadBytes / 1e9).toFixed(2)} GB
                </span>
              )}
              style={{ width: "15%" }}
            />
            <Column
              field="upload"
              header="Upload"
              body={(rowData) => (
                <span className="text-green-600 font-medium">
                  {(rowData.uploadBytes / 1e9).toFixed(2)} GB
                </span>
              )}
              style={{ width: "15%" }}
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
};

export default SubscriberDetails;
