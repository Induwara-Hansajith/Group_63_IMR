const jwt = require("jsonwebtoken");

function requireAuth(req, res, next){
    const header = req.headers.authorization || "";
    const[scheme, token] = header.split(" ");

    if(scheme !== "bearer" || !token){
        return res.status(401).json({message: "Sign-in-required."});
    }

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userid: Number(payload.sub),
            role: payload.role,
        };
        next();
    } catch{
        return res.status(401).json({message: "Invalid or expired token"});
    }
}

module.exports = requireAuth;