
const sql = require("mssql");

const LoginFunctions = {

    /* Get a User's Authentication Token from the Authorization Header*/
    getAuthenticationToken(req) {
        const base64AuthenticationHeader =
          (req.headers.authorization || '').split(' ')[1] || '';
        const [authToken] = Buffer.from(base64AuthenticationHeader, 'base64')
          .toString()
          .split(':');
        return authToken;
      },

    /*
        Authenticate's a User's Login Info based on their UserName & Password & 
        Select the User's authentication & associated roles from SQL Server
    */
    getUserByLogin: async (config, username, password, privateKeyID) => {
        privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;
        username = username ? String(username).trim().toLowerCase() : username;
        password = password ? String(password).trim() : password;

        try {
            await sql.connect(config);
            const roleQuery = ' RoleNames = STUFF( ( ' +
            '    SELECT  ' + "'" + ','  + "'" + ' + R.Name ' + ' FROM ITCC_Role R(NOLOCK) JOIN ITCC_UserRole UR (NOLOCK) ON (R.ITCC_RoleID = UR.ITCC_RoleID) ' +
            '                JOIN ITCC_Website W1 (NOLOCK) ON (UR.ITCC_WebsiteID = W1.ITCC_WebsiteID) ' +
            '    WHERE ( (UR.ITCC_UserID = WU.ITCC_UserID) AND (W1.PrivateKeyID = @PrivateKeyID) ) ' +
            '    FOR XML PATH(' + "''" + ') ) ' + ' ,1,1, ' + " '') ";
            let query = ' SELECT US.UserToken, ISNULL(US.LastLoginDate, GETDATE()) AS LastLoginDate, ';
            query += ' DATEDIFF(mi, ISNULL(US.LastLoginDate, GETDATE()), GETDATE()) AS TimeDiffMin, NewID() AS AuthID ';
            query += ' ,WU.ITCC_WebsiteID ,US.ITCC_UserID, WS.Title AS WebsiteName, US.UserName' ;
            query += ' , ' + roleQuery;

            query += ' FROM [ITCC_User] US (NOLOCK) JOIN [ITCC_WebsiteUser] WU (NOLOCK) ';
            query += ' ON (US.ITCC_UserID = WU.ITCC_UserID) ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (WU.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query +=   ' WHERE ( ' +
            ' (RTRIM(LTRIM(LOWER(US.UserName))) = @Username) AND (RTRIM(LTRIM(US.Password)) = @Password) ' +
            ' AND (WS.PrivateKeyID = @PrivateKeyID ) ' +
            ') ';

            const request = new sql.Request();

            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('Username', sql.NVarChar(64), username);
            request.input('Password', sql.NVarChar(64), password);

            const result = await request.query(query);
            return result;

        } catch (err) {
            //console.log({getUserByLogin: err});
            throw err
        }
    },

    /*
        Update's a User's Login Info based on their UserName & Password & 
        Update the User's UserToken & Login date in SQL Server
    */
    updateUserLoginInfo: async (config, username, password, privateKeyID, authID) => {
        privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;
        username = username ? String(username).trim().toLowerCase() : username;
        password = password ? String(password).trim() : password;

        try {
            await sql.connect(config);
            let query = ' UPDATE ITCC_USER SET ' ;
            query += 'UserToken = @AuthID, ';
            query += 'LastLoginDate = GETDATE()';
            query += ' FROM [ITCC_User] US (NOLOCK) JOIN [ITCC_WebsiteUser] WU (NOLOCK) ';
            query += ' ON (US.ITCC_UserID = WU.ITCC_UserID) ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (WU.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query +=   ' WHERE ( ' +
            ' (RTRIM(LTRIM(LOWER(US.UserName))) = @Username) AND (RTRIM(LTRIM(US.Password)) = @Password) ' +
            ' AND (WS.PrivateKeyID = @PrivateKeyID) ' +
            ') ';

            const request = new sql.Request();
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('AuthID', sql.UniqueIdentifier, authID);
            request.input('Username', sql.NVarChar(64), username);
            request.input('Password', sql.NVarChar(64), password);

            // console.log({updateUserLoginInfo: query});
            const result = await request.query(query);
            return result;

        } catch (err) {
            //console.log({updateUserLoginInfo: err});
            throw err
        }
    },

    /*
        Authenticate's a User's Login Info based on a UserToken 
        Select the User whose associated roles from SQL Server
    */
    getUserByAuthToken: async (config, privateKeyID, authID) => {
        privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;

        try {
            await sql.connect(config);

            const roleQuery =
            ' RoleNames = STUFF( ( ' +
            '    SELECT  ' + "'" + ','  + "'" + ' + R.Name ' + ' FROM ITCC_Role R(NOLOCK) JOIN ITCC_UserRole UR (NOLOCK) ON (R.ITCC_RoleID = UR.ITCC_RoleID) ' +
            '                JOIN ITCC_Website W1 (NOLOCK) ON (UR.ITCC_WebsiteID = W1.ITCC_WebsiteID) ' +
            '    WHERE ( (UR.ITCC_UserID = WU.ITCC_UserID) AND (W1.PrivateKeyID = @PrivateKeyID) ) ' +
            '    FOR XML PATH(' + "''" + ') ) ' + ' ,1,1, ' + " '') ";

            let query = ' SELECT US.*';
            query += ' , ' + roleQuery;
            query += ' FROM [ITCC_User] US (NOLOCK) JOIN [ITCC_WebsiteUser] WU (NOLOCK) ';
            query += ' ON (US.ITCC_UserID = WU.ITCC_UserID) ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (WU.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query +=   ' WHERE ( ' +
            ' (US.UserToken = @AuthId) ' +
            ' AND (WS.PrivateKeyID = @PrivateKeyID) ' +
            ') ';

            const request = new sql.Request();
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('AuthID', sql.UniqueIdentifier, authID);
            
            const authResult = await request.query(query);
            const result = (authResult && authResult.recordset && authResult.recordset.length > 0) ? authResult.recordset[0] : null;

            return result;
        } catch (err) {
            //console.log({getUserByLogin: err});
            throw err
        }
    },

    /*
        Select a User's Role Names as an array. Depends on another function
    */
    getUserRolesByAuthToken: async (config, privateKeyID, authID) => {
        const authResult = await LoginFunctions.getUserByAuthToken(config, privateKeyID, authID);
        const authUser = authResult;
        const roleNames = (authUser && authUser.RoleNames) ? String(authUser.RoleNames).split(',') : null;
        return roleNames;
    }
};

module.exports = LoginFunctions;

