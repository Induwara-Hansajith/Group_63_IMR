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
}){
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
}

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

async function withdrawProposal({proposalId, freeLancerId}){
    const pool = await poolPromise;
    const proposalRes = await pool.request()
        .input("ProposalID", sql.BigInt, proposalId)
        .query(SQL.GET_PROPOSAL_WITH_PROJECT);
    const proposal = proposalRes.recordset[0];
    if (!proposal) {
        throw createHttpError(404, "Proposal not found.");
    }
    if (Number(proposal.FreelancerID) !== Number(freeLancerId)) {
        throw createHttpError(403, "You can only withdraw your own proposals.");
    }
    if (proposal.Status !== "pending") {
        throw createHttpError(400, `Can't withdraw a proposal with the status '${proposal.ProposalStatus}'.`);
    }
    const updateRes = await pool.request()
        .input("ProposalID", sql.BigInt, proposalId)
        .input("NewStatus", sql.NVarChar(20), "withdrawn")
        .query(SQL.UPDATE_PROPOSAL_STATUS);
    return updateRes.recordset[0];
}

async function rejectProposal({proposalId, clientId}){
    const pool = await poolPromise;
    const propRes = await pool.request()
        .input("ProposalID", sql.BigInt, proposalId)
        .query(SQL.GET_PROPOSAL_WITH_PROJECT);
    const proposal = proposalRes.recordset[0];
    if (!proposal) {
        throw createHttpError(404, "Proposal not found.");
    }
    if (Number(proposal.ClientID)!== Number(clientId)) {
        throw createHttpError(403, "You can only reject proposals for your own projects.");
    }
    if (proposal.Status !== "pending") {
        throw createHttpError(400, `Can't reject a proposal with the status '${proposal.ProposalStatus}'.`);
    }
    const updateRes = await pool.request()
        .input("ProposalID", sql.BigInt, proposalId)
        .input("NewStatus", sql.NVarChar(20), "rejected")
        .query(SQL.UPDATE_PROPOSAL_STATUS);
    return updateRes.recordset[0];
}

async function acceptProposal({proposalId, clientId}){
    const pool = await poolPromise;
    const proposalRes = await pool.request()
        .input("ProposalID", sql.BigInt, proposalId)
        .query(SQL.GET_PROPOSAL_WITH_PROJECT);
    const proposal = proposalRes.recordset[0];
    if (!proposal){
        throw createHttpError(404,"Proposal not found.");
    }
    if (Number(proposal.ClientID) !== Number(ClientId)){
        throw createHttpError(403,"You can only accept proposals for your own projects.");
    }
    if (proposal.ProposalStatus !== "pending"){
        throw createHttpError(400,`Can't accept a proposal with the status '${proposal.ProposalStatus}'.`);
    }
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try{
        const acceptReq = new sql.Request(transaction);
        const acceptRes = await acceptReq.input("ProposalID", sql.BigInt, proposalId)
            .query(SQL.ACCEPT_TARGET_PROPOSAL);
        if (acceptRes.rowsAffected[0] === 0){
            throw createHttpError(409,"Proposal could not be accepted because its status changed.");
        }
        const rejectReq = new sql.Request(transaction);
        await rejectReq
            .input("ProjectID", sql.BigInt, proposal.ProjectID)
            .input("ProposalID", sql.BigInt, proposalId)
            .query(SQL.REJECT_OTHER_PROPOSALS);

        const assignReq = new sql.Request(transaction);
        const assignRes = await assignReq
            .input("ProjectID", sql.BigInt, proposal.ProjectID)
            .input("FreelancerID", sql.BigInt, proposal.FreelancerID)
            .input("ProposalID", sql.BigInt, proposalId)
            .query(SQL.INSERT_PROJECT_ASSIGNMENT);
        
        const projReq = new sql.Request(transaction);
        await projReq
            .input("ProjectID", sql.BigInt, proposal.ProjectID)
            .input("ProjectStatus", sql.NVarChar(20), "in_progress")
            .query(SQL.SET_PROJECT_IN_PROGRESS);
        await transaction.commit();
        return assignRes.recordset[0];
    } catch (err){
        await transaction.rollback();
        if (err.number === 2627 || err.number === 2601){
            throw createHttpError(409,"A freelancer has already been assigned to this project. The proposal could not be accepted.");  
        }
        throw err;
    }
} 

async function getMyAssignments({userId, role}){
    const pool = await poolPromise;
    const result = await pool.request()
        .input("UserID", sql.BigInt, userId)
        .input("Role", sql.NVarChar(30), role)
        .query(SQL.GET_ASSIGNMENTS_BY_USER);
    return result.recordset;
}

async function getMyProposals({userId, role}){
    if (role !== "freelancer"){
        throw createHttpError(403,"Only freelancers can view their proposals.");
    }
    const pool = await poolPromise;
    const result = await pool.request()
        .input("FreelancerID", sql.BigInt, userId)
        .query(SQL.GET_PROPOSALS_BY_FREELANCER);
    return result.recordset;
}

async function getAssignmentById({assignmentId, requesterId, RequesterRole}){
    const pool = await poolPromise;
    const result = await pool.request()
        .input("AssignmentID", sql.BigInt, assignmentId)
        .query(SQL.GET_ASSIGNMENT_BY_ID);
    const assignment = result.recordset[0];
    if (!assignment){
        throw createHttpError(404,"Assignment not found.");
    }

    const isFreelancer = Number(assignment.FreelancerID) === Number(requesterId);
    const isClient = Number(assignment.ClientID) === Number(requesterId);
    const isAdmin = requesterRole === "admin" || requesterRole === "manager";
    if (!isFreelancer && !isClient && !isAdmin){
        throw createHttpError(403,"You are not the owner of this assignment.");
    }
    return assignment;
}

async function updateAssignmentStatus({ assignmentId, newStatus, requesterId, requesterRole }) {
    const allowedStatuses = ["assigned", "in_progress", "submitted", "completed", "cancelled"];
    if (!allowedStatuses.includes(newStatus)) {
        throw createHttpError(400, `Invalid assignment status '${newStatus}'.`);
    }

    const pool = await poolPromise;
    const currentRes = await pool
        .request()
        .input("AssignmentID", sql.BigInt, assignmentId)
        .query(SQL.GET_ASSIGNMENT_BY_ID);

    const assignment = currentRes.recordset[0];
    if (!assignment) {
        throw createHttpError(404, "Project assignment not found.");
    }

    const isFreelancer = Number(assignment.FreelancerID) === Number(requesterId);
    const isClient = Number(assignment.ClientID) === Number(requesterId);
    const isAdmin = requesterRole === "admin";

    if (!isFreelancer && !isClient && !isAdmin) {
        throw createHttpError(403, "You are not authorized to update this assignment.");
    }

    const currentStatus = assignment.AssignmentStatus;
    if (currentStatus === "completed" || currentStatus === "cancelled") {
        throw createHttpError(400, `Cannot change status once assignment is '${currentStatus}'.`);
    }
    if (currentStatus === newStatus) {
        throw createHttpError(400, `Assignment is already '${newStatus}'.`);
    }
    if (isFreelancer) {
        const validFreelancerMove =
            (currentStatus === "assigned" && newStatus === "in_progress") ||
            (currentStatus === "in_progress" && newStatus === "submitted");

        if (!validFreelancerMove) {
            throw createHttpError(
                403,
                `Freelancers cannot transition assignment from '${currentStatus}' to '${newStatus}'.`
            );
        }
    } else if (isClient) {
        const validClientMove =
            (currentStatus === "submitted" && newStatus === "completed") ||
            (currentStatus === "submitted" && newStatus === "in_progress") ||
            newStatus === "cancelled";

        if (!validClientMove) {
            throw createHttpError(
                403,
                `Clients cannot transition assignment from '${currentStatus}' to '${newStatus}'.`
            );
        }
    } else if (isAdmin && newStatus !== "cancelled") {
        throw createHttpError(403, "Administrators can only cancel an active assignment.");
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const updateReq = new sql.Request(transaction);
        const updateRes = await updateReq
            .input("AssignmentID", sql.BigInt, assignmentId)
            .input("NewStatus", sql.NVarChar(20), newStatus)
            .query(SQL.UPDATE_ASSIGNMENT_STATUS);

        if (newStatus === "completed" || newStatus === "cancelled") {
            const syncReq = new sql.Request(transaction);
            await syncReq
                .input("ProjectID", sql.BigInt, assignment.ProjectID)
                .input("ProjectStatus", sql.NVarChar(20), newStatus)
                .query(SQL.SYNC_PROJECT_STATUS_FROM_ASSIGNMENT);
        }

        await transaction.commit();
        return updateRes.recordset[0];
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

module.exports = {
    submitProposal,
    getMyProposals,
    getProjectProposals,
    withdrawProposal,
    rejectProposal,
    acceptProposal,
    getMyAssignments,
    getAssignmentById,
    updateAssignmentStatus,
    getProposalsByFreelancer,

};