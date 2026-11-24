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

