const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
async function apiRequest(endpoint,options ={}){
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${endpoint}`,{
        ...options,
        header:{
            "Content-Type": "application/json",
            ...(token ? {Authorization: `bearer ${token}`} :{}),
            ...options.header,
        },
    });

    const data =  await response.json();
    if (!response.ok){
        throw new Error(data.error || "Request failed.");
    }
    return data;
}

export function submitProposal({projectId, coverLetter, proposalAmout, currencyCode = "USD", estimatedDays}){
    return apiRequest("/proposals",{
        method: "POST",
        body: JSON.stringify({
            projectId: Number(projectId),
            coverLetter,
            proposedAmount: Number(proposedAmount),
            currencyCode,
            estimatedDays: estimatedDays ? Number(estimatedDays) : null,
        }),
    });
}

export function getMyProposals(){
    return apiRequest("/proposals/my",{method: "GET"});
}

export function getProjectProposals(projectId){
    return apiRequest(`/proposals/project/${projectId}`,{method: "GET"});
}

export function withdrawProposal(proposalId){
    return apiRequest(`/proposals/${proposalId}`,{method: "PATCH"});
}

export function rejectProposal(proposalId){
    return apiRequest(`/proposals/${proposalId}/reject`,{method: "PATCH"});
}

export function acceptProposal(proposalId){
    return apiRequest(`/proposals/${proposalId}/accept`,{method: "POST"});
}

export function getMyAssignments(){
    return apiRequest("/assignments/my",{method: "GET"});
}

export function getAssignmentById(assignmentId){
    return apiRequest(`/assignments/${assignmentId}`,{method: "GET"});
}

export function updateAssignment(assignmentId, status){
    return apiRequest(`/assignments/${assignmentId}/status`,
        {method: "PATCH", body: JSON.stringify({status}),});
}
