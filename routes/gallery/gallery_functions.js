
const sql = require("mssql");
const roleNames = "'anonymous', 'subscriber'";

const ImageFunctions = {

    /*
            SELECT a paged list of Images & associated roles from SQL Server
    */
    getItems: async (config, privateKeyID, offset, pageSize) => {
        try {
            await sql.connect(config);

            let query = ' SELECT DISTINCT US.* ';
            query += ' FROM [ITCC_Image] US ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (US.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' WHERE ( (WS.PrivateKeyID = @PrivateKeyID) ) ';
            query += ' ORDER BY US.ModifyDate Desc ';
            query += ' OFFSET @Offset ROWS ';
            query += ' FETCH NEXT @PageSize ROWS ONLY ';

            const request = new sql.Request();
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('Offset', sql.Int, offset);
            request.input('PageSize', sql.Int, pageSize);

            //console.log({getImages: query, privateKeyID: privateKeyID, offset: offset, pageSize: pageSize});
            const result = await request.query(query);
            return result;

        } catch (err) {
            //console.log({getImages: err});
            throw err
        }
    },

    /*
        SELECTS a singLe Image & associated roles from SQL Server
    */
    getItem: async (config, privateKeyID, id) => {

        try {
            await sql.connect(config);
            let query = ' SELECT DISTINCT US.* ';
            query += ' FROM [ITCC_Image] US ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (US.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' WHERE ( ' +
                ' (US.ITCC_ImageID = @ID) AND (WS.PrivateKeyID = @PrivateKeyID) ' +
                ') ';

            const request = new sql.Request();
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('ID', sql.Int, id);
            const result = await request.query(query);
            return result;

        } catch (err) {
            throw err
        }
    },

    /*
        Updates a singLe Image's information on SQL Server
    */
    updateItem: async (config, privateKeyID, id, Imagename, emailaddress) => {
        privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;

        try {
            await sql.connect(config);
            let query = ' UPDATE ITCC_Image SET ';
            query += ' Imagename = @Imagename, EmailAddress = @EmailAddress ';
            query += ' WHERE ( ' +
                ' ( ITCC_ImageID = @ID ) ' +
                '); SELECT @@ROWCOUNT; ';

            const request = new sql.Request();
            request.input('ID', sql.Int, id);
            request.input('Imagename', sql.NVarChar(64), Imagename);
            request.input('EmailAddress', sql.NVarChar(64), emailaddress);
            const result = await request.query(query);
            return result;

        } catch (err) {
            throw err
        }
    },

    /*
        Deletes a singLe non-admin Image's information on SQL Server  
    */
    deleteItem: async (config, privateKeyID, id) => {

        try {
            await sql.connect(config);

            let query = ' BEGIN TRAN; ';

            // DELETE ImageROLE
            query += ' DELETE UR ';
            query += ' FROM [ITCC_Image] US (NOLOCK) JOIN [ITCC_WebsiteImage] WU (NOLOCK) ';
            query += ' ON (US.ITCC_ImageID = WU.ITCC_ImageID) ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (WU.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' JOIN [ITCC_ImageROLE] UR (NOLOCK) ON (WS.ITCC_WebsiteID = UR.ITCC_WebsiteID) ';
            query += ' JOIN [ITCC_ROLE] IR (NOLOCK) ON (UR.ITCC_ROLEID = IR.ITCC_ROLEID) ';
            query += ' WHERE ( ' +
                ' (UR.ITCC_ImageID = @ID) AND (WS.PrivateKeyID = @PrivateKeyID) AND (UR.ITCC_ImageID > 1) ' +
                '); ';


            // DELETE WEBSITEImage
            query += ' DELETE WU ';
            query += ' FROM [ITCC_Image] US (NOLOCK) JOIN [ITCC_WebsiteImage] WU (NOLOCK) ';
            query += ' ON (US.ITCC_ImageID = WU.ITCC_ImageID) ';
            query += ' JOIN [ITCC_Website] WS (NOLOCK) ON (WU.ITCC_WebsiteID = WS.ITCC_WebsiteID) ';
            query += ' JOIN [ITCC_ImageROLE] UR (NOLOCK) ON (WS.ITCC_WebsiteID = UR.ITCC_WebsiteID) ';
            query += ' JOIN [ITCC_ROLE] IR (NOLOCK) ON (UR.ITCC_ROLEID = IR.ITCC_ROLEID) ';
            query += ' WHERE ( ' +
                ' (WU.ITCC_ImageID = @ID) AND (WS.PrivateKeyID = @PrivateKeyID) AND (WU.ITCC_ImageID > 1) ' +
                '); ';

            // DELETE Image
            query += ' DELETE US ';
            query += ' FROM [ITCC_Image] US (NOLOCK) ';
            query += ' WHERE ( ' +
                ' (US.ITCC_ImageID = @ID) AND (US.ITCC_ImageID > 1) ' +
                '); ';

            query += ' COMMIT';

            const request = new sql.Request();
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('ID', sql.Int, id);
            const result = await request.query(query);
            return result;

        } catch (err) {
            throw err
        }
    },

    /*
        Creates a singLe Image & associated roles in SQL Server
    */
    createItem: async (config, privateKeyID,
        Imagename, firstname, lastname, email, isonline, isapproved, islockedout,
        password, statusid, createImageid, modifyImageid) => {
        privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;

        try {
            await sql.connect(config);
            let query = ' SELECT @SiteID = ITCC_WebsiteID FROM ITCC_WEBSITE (NOLOCK) WHERE (PrivateKeyID = @PrivateKeyID) ';
            query += ' BEGIN TRAN; ';
            query += ' INSERT INTO ITCC_Image (';
            query += ' ImageName, Password, FirstName, LastName, EmailAddress, ';
            query += ' IsOnline, IsApproved, IsLockedOut, ITCC_StatusID, ';
            query += ' ImageID, ImageToken, CreateDate, CreateImageID, ModifyDate, ModifyImageID';
            query += ' ) ';
            query += ' VALUES ( ' +
                ' @ImageName, @Password, @FirstName, @LastName, @EmailAddress, ' +
                ' @IsOnline, @IsApproved, @IsLockedOut, @StatusID, ' +
                ' NewID(), NewID(), getdate(), 1, getdate(), 1' +
                '); SELECT @NEWID = SCOPE_IDENTITY();';

            query += ' INSERT INTO ITCC_WEBSITEImage (ITCC_WebsiteID, ITCC_ImageID, CreateDate, CreateImageID, ModifyDate, ModifyImageID )';
            query += ' SELECT  @SiteID, @NEWID, getdate(), 1, getdate(), 1';

            query += ' INSERT INTO ITCC_ImageROLE (ITCC_WebsiteID, ITCC_ImageID, ITCC_ROLEID )';
            query += ' SELECT DISTINCT @SiteID, @NEWID, RL.ITCC_ROLEID ';
            query += ' FROM ITCC_WEBSITE WS JOIN ITCC_ROLE RL ';
            query += ' ON (WS.ITCC_WebsiteID = RL.ITCC_WebsiteID) ';
            query += ' WHERE ( (WS.PrivateKeyID = @PrivateKeyID) AND RL.NAME IN (' + roleNames + ' ) ); '

            query += ' SELECT @NEWID NEWID,  @SiteID SiteID; COMMIT;'

            const request = new sql.Request();
            request.output('NewID', sql.Int);
            request.output('SiteID', sql.Int);
            request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
            request.input('ImageName', sql.NVarChar(64), Imagename);
            request.input('EmailAddress', sql.NVarChar(64), email);
            request.input('Password', sql.NVarChar(64), password);
            request.input('FirstName', sql.NVarChar(64), firstname);
            request.input('LastName', sql.NVarChar(128), lastname);
            request.input('StatusID', sql.Bit, 1);
            request.input('IsApproved', sql.Bit, 1);
            request.input('IsOnline', sql.Bit, 1);
            request.input('IsLockedOut', sql.Bit, 1);
            const result = await request.query(query);
            return result;

        } catch (err) {
            throw err
        }
    },
};

module.exports = ImageFunctions;