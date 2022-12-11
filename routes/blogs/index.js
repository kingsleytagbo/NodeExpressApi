const router = require('express').Router();
const configs = require('../../config_functions'); //require('../../config');
const blogs = require('./blog_functions');
const login = require('../login/login_functions');
const LoginFunctions = require('../login/login_functions');

const BlogFactory = {
    Fields: {
        Name: '', Description: '', Slug: '', BlogType: '', Permalink: '', PostDate: '', PostSummary:'',
        Category: '', Tags:'', ITCC_UserID: -1, ITCC_WebsiteID: -1, ITCC_StatusID: -1, ITCC_BlogID: 0,
        CreateDate: new Date(), ModifyDate: new Date(), CreateUserID:-1, ModifyUserID: -1, RoleName: 'subscriber'
    }
    , Set: function (value) {
        this.Fields = Object.assign(this.Fields, value);
    }
    , Get: function () {
        return this.Fields;
    }
};


//  http://localhost:3010/api/gallery/FEA91F56-CBE3-4138-8BB6-62F9A5808D57/1
//  http://localhost:3010/api/users/1DC52158-0175-479F-8D7F-D93FC7B1CAA4/page/1
//  https://nodeapi.launchfeatures.com/api/gallery/88B8B45E-2BE7-44CB-BBEA-547BB9A8C7D5/2
// get a paginated list of users
router.get("/:siteid/page/:pagenum?", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const pageNum = (request.params.pagenum) ? request.params.pagenum : 1;
    const pageSize = 20; 
    const offset = (pageNum - 1) * pageSize;

    /*
    console.log({
        'list blogs': {
            params: request.params, authID: authID,  authToken:  authToken
        }
    })
    */

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await LoginFunctions.getUserRolesByAuthToken(config, siteid, authID);
    const itemsResult = await blogs.getItems(config, siteid, offset, pageSize);
    const result = itemsResult.recordset;

    if (roleNames && roleNames.indexOf('admin') > -1) {
        return response.status(200).send(result);
    }
    else {
        // return a trimmed down result
        return response.status(200).send(result);
    }

});

// get one blog
router.get("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    /*
    console.log({
        'one blog': {
            params: request.params, authid: authID, id: id, authToken: authToken
        }
    })
    */

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const roleNames = await LoginFunctions.getUserRolesByAuthToken(config, siteid, authID);
    const authResult = await blogs.getItem(config, siteid, id);
    const result =  (authResult.recordset && (authResult.recordset.length > 0))
    ? authResult.recordset[0] : null;

    if (roleNames && roleNames.indexOf('admin') > -1) {
        return response.send(result);
    }
    else {
        return response.send(result);
    }
});

// create a new Item along with some basic roles needed to access the system
router.post("/:siteid", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);
    //console.log({authUser: authUser});

    if (authUser.RoleNames.indexOf('admin') > -1) {
        BlogFactory.Set(request.body);
        const dataValues = BlogFactory.Get();
        
        const authResult = await blogs.createItem(config, siteid, authUser, dataValues);
        const result =  authResult;
        return response.send(result);
    }
    else {
        return response.status(401).send({error: 'you\'re not authorized to access this'});
    }

});

// update an Item
router.put("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser.RoleNames.indexOf('admin') > -1) {
        BlogFactory.Set(request.body);
        const dataValues = BlogFactory.Get();

        const authResult = await blogs.updateItem(config, siteid, authUser, dataValues);
        const result =  authResult.recordset;
        return response.send(result);
    }
    else {
        return response.status(401).send({error: 'you\'re not authorized to access this'});
    }
});

// delete a Item
router.delete("/:siteid/:id", async function (request, response) {
    const siteid = request.params.siteid;
    const authToken = LoginFunctions.getAuthenticationToken(request);
    const authID = authToken || (request.headers.authid);
    const id = request.params.id;

    const config = configs.find(siteid); //(c => c.privateKeyID === siteid);
    const authUser = await LoginFunctions.getUserByAuthToken(config, siteid, authID);

    if (authUser.RoleNames.indexOf('admin') > -1) {
        await blogs.deleteItem(config, siteid, id);
        return response.send(id);
    }
    else {
        return response.status(401).send({error: 'you\'re not authorized to access this'});
    }
});


module.exports = router;