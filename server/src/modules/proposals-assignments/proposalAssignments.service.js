const{sql,poolPromise} = require("../../config/db");
const SQL = require("./proposalAssignments.sql");

function createHttpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}
async function submitProposal({
    freelancerId,
    projectId,
    coverLetter,
    proposedAmount,
    currencyCode="USD",
    estimatedDays=null
}) {
    const pool = await poolPromise;
    const freelancerRes = await pool.request()
     .input("FreelancerID", sql.BigInt, freelancerId)
     .query(SQL.GET_FREELANCER_PROFILE);
    if (freelancerRes.recordset.length === 0) {
        throw createHttpError(403, "Complete your freelancer profile before submitting a proposal.");
    }
    const projectRes = await pool
        .request()
        .input("ProjectID", sql.BigInt, projectId)
        .query(SQL.GET_PROJECT_BY_ID);
    
    const project = projectRes.recordset[0];
    if (!project) {
        throw createHttpError(404, "Project not found.");
    }
    if (project.Status !== "open") {
        throw createHttpError(400, "Cannot submit a proposal to a project that is not open.");
    }
    if (project.Deadline){
        const deadlineDate = new Date(project.Deadline); 
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if(deadlineDate < today){
            throw createHttpError(400, "Cannot submit a proposal to a project past its deadline.");
        }   
    }
    const existinRes = await pool.request()
        .input("ProjectID", sql.BigInt, projectId)
        .input("FreelancerID", sql.BigInt, freelancerId)
        .query(SQL.CHECK_EXISTING_PROPOSAL);
    if (existingProposal.recordset.length > 0) {
        throw createHttpError(400, "You have already submitted a proposal for this project.");
    }

    const insertRes = await pool.request()
        .input("ProjectID", sql.BigInt, projectId)
        .input("FreelancerID", sql.BigInt, freelancerId)
        .input("CoverLetter", sql.NVarChar(sql.MAX), coverLetter.trim())
        .input("ProposedAmount", sql.Decimal(18, 2), proposedAmount)
        .input("CurrencyCode", sql.NVarChar(3),(currencyCode || project.CurrencyCode || "USD").toUpperCase())
        .input("EstimatedDays", sql.Int, estimatedDays)
        .query(SQL.INSERT_PROPOSAL);
    return insertRes.recordset[0];

    async function getProposalsByFreelancer(freelancerId){
        const pool = await poolPromise;
        const res = await pool.request()
            .input("FreelancerID", sql.BigInt, freelancerId)
            .query(SQL.GET_PROPOSALS_BY_FREELANCER);
        return res.recordset;
    }

    async function getProjectProposals({ projectId, requesterId, requesterRole }) {
    const pool = await poolPromise;

    const projectRes = await pool
        .request()
        .input("ProjectID", sql.BigInt, projectId)
        .query(SQL.GET_PROJECT_BY_ID);

    const project = projectRes.recordset[0];
    if (!project) {
        throw createHttpError(404, "Project not found.");
    }

    if (requesterRole !== "admin" && Number(project.ClientID) !== Number(requesterId)) {
        throw createHttpError(403, "You are not authorized to view proposals for this project.");
    }

    const result = await pool
        .request()
        .input("ProjectID", sql.BigInt, projectId)
        .query(SQL.GET_PROPOSALS_BY_PROJECT);

    return result.recordset;
}

} 