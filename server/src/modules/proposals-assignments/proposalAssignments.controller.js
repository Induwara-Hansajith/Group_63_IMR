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