const router = require('express').Router();
const configs = require('../../config');
const login = require('./login_functions');

// check if an AUTHID or Token is valid
router.post("/:siteid", async (request, response) => {
    try {
        const siteid = request.params.siteid || request.headers['pin'];
        const headers = request.headers;
        const authid = headers.authid;

        const config = configs.find(c => c.privateKeyID === siteid);
        const authResult = await login.getUserByAuthToken(config, siteid,  authid);
        const authUser =  (authResult.recordset && authResult.recordset.length === 1)? authResult.recordset[0] : null;

        const payload = {auth: (authUser ? true : false), authid: authid};

        return response.send(payload);
    }
    catch (err) {
        throw err;
        //return response.send({error: "an error has occured! "});
    }
});


module.exports = router;