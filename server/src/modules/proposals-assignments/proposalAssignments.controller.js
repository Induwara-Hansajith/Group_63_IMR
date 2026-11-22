const service = require("./proposalAssignments.service");
function parsePositiveInt(value){
    const num = Number(value);
    return Number.isInteger(num) && num > 0 ? num :null;
}

function handleError(res, err){
    if (err.status){
        return res.status(err.status).json({ error: err.message });
    }
    console.error("[ProposalAssignments Error]:", err);
    return res.status(500).json({ error: "Internal Server Error" });
}

async function submitProposalHandler(req, res){
    try{
        if (req.user.role !== "freelancer"){
            return res.status(403).json({ error: "Only freelancers can submit proposals." });
        }
        const projectId = parsePositiveInt(req.body.projectId);
        const coverLetter = typeof req.body.coverLetter === "string" ? req.body.coverLetter.trim() : "";
        const proposedAmount = Number(req.body.proposedAmount);
        const currencyCode = typeof req.body.currencyCode === "string" ? req.body.currencyCode.trim() : "USD";
        const estimatedDays = req.body.estimatedDays === undefined || req.body.estimatedDays === null || req.body.estimatedDays === ""
            ? null
            : parsePositiveInt(req.body.estimatedDays);

        if (!projectId){
            return res.status(400).json({ error: "Invalid projectId." });
        }
        if (!coverLetter){
            return res.status(400).json({ error: "Cover letter is required." });
        }
        if (!Number.isFinite(proposedAmount) || proposedAmount < 0){
            return res.status(400).json({ error: "Proposed amount must be a non-negative number." });
        }
        if (
            req.body.estimatedDays !== undefined &&
            req.body.estimatedDays !== null &&
            req.body.estimatedDays !== "" &&
            !estimatedDays
        ){
            return res.status(400).json({ error: "Estimated days must be a positive integer or null." });
        }
        if (currencyCode.length !==3){
            return res.status(400).json({ error: "Currency code must be a 3-letter ISO code." });
        }
        const proposal = await service.submitProposal({
            freelancerId: req.user.userid,
            projectId,
            coverLetter,
            proposedAmount,
            currencyCode,
            estimatedDays,
        });

        return res.status(201).json({
            message: "Proposal submitted successfully.",
            proposal,
        });


    } catch (err){

        return handleError(res, err);   
    }
}

async function getMyProposalhandler(req, res){
    try{
        if (req.user.role !== "freelancer"){
            return res.status(403).json({ error: "Only freelancers can view their proposals." });
        }
        const proposals = await service.getMyProposals(req.user.userid);
        return res.json({ proposals });
    }catch(err){
        return handleError(res, err);
    }
}

async function getProjectProposalHandler(req, res){
    try{
        if (req.user.role !== "client" && req.user.role !== "admin"){
            return res.status(403).json({message: "ONly clients or administrators can view project proposals "});
        }

        const projectId = parsePositiveInt(req.params.projectId);
        if(!projectId){
            return res.status(400).json({message: "Invalid projectId."});
        }
        const proposals = await service.getProjectProposals({
            projectId,
            requesterId: req.user.userid,
            requesterRole: req.user.role,
        });
        return res.json({proposals});
    }catch(err){
        return handleError(res, err);
    }
}

async function withdrawProposalHandler(req, res) {
    try {
        if (req.user.role !== "freelancer") {
            return res.status(403).json({ message: "Only freelancers can withdraw proposals." });
        }

        const proposalId = parsePositiveInt(req.params.proposalId);
        if (!proposalId) {
            return res.status(400).json({ message: "Invalid proposalId." });
        }

        const proposal = await service.withdrawProposal({
            proposalId,
            freelancerId: req.user.userid,
        });

        return res.json({
            message: "Proposal withdrawn.",
            proposal,
        });
    } catch (err) {
        return handleError(res, err);
    }
}

 
async function rejectProposalHandler(req, res) {
    try {
        if (req.user.role !== "client") {
            return res.status(403).json({ message: "Only clients can reject proposals." });
        }

        const proposalId = parsePositiveInt(req.params.proposalId);
        if (!proposalId) {
            return res.status(400).json({ message: "Invalid proposalId." });
        }

        const proposal = await service.rejectProposal({
            proposalId,
            clientId: req.user.userid,
        });

        return res.json({
            message: "Proposal rejected.",
            proposal,
        });
    } catch (err) {
        return handleError(res, err);
    }
}

 
async function acceptProposalHandler(req, res) {
    try {
        if (req.user.role !== "client") {
            return res.status(403).json({ message: "Only clients can accept proposals." });
        }

        const proposalId = parsePositiveInt(req.params.proposalId);
        if (!proposalId) {
            return res.status(400).json({ message: "Invalid proposalId." });
        }

        const assignment = await service.acceptProposal({
            proposalId,
            clientId: req.user.userid,
        });

        return res.status(201).json({
            message: "Proposal accepted and project assigned.",
            assignment,
        });
    } catch (err) {
        return handleError(res, err);
    }
}

