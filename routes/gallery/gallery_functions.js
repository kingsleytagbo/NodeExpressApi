
const sql = require("mssql");
const roleNames = "'anonymous', 'subscriber'";

const GalleryFunctions = {

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
        Creates a singLe Image & associated roles in SQL Server
    */
        createItem: async (config, privateKeyID, user, data) => {
            privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;
    
            try {
                await sql.connect(config);
                const request = new sql.Request();
                request.input('Name', sql.NVarChar(255), data.Name);
                request.input('Description', sql.NVarChar(), data.Description);
                request.input('Slug', sql.VarChar(96), (data.Slug || ''));
                request.input('Category', sql.NVarChar(), (data.Category || ''));
                request.input('Tags', sql.NVarChar(), (data.Tags || ''));
                request.input('Title', sql.NVarChar(255), (data.Title || ''));

                request.input('FilePath', sql.NVarChar(383), (data.FilePath || ''));
                request.input('FileGroup', sql.NVarChar(255), (data.FileGroup || ''));
                request.input('PublishUrl', sql.NVarChar(383), (data.PublishUrl || ''));
                request.input('SiteID', sql.VarChar(), data.ITCC_WebsiteID);
                request.input('IsActive', sql.Bit, 1);
                request.input('CreateDate', sql.DateTime, data.CreateDate);
                request.input('ModifyDate', sql.DateTime, data.ModifyDate);
                request.input('UpdateDate', sql.DateTime, data.ModifyDate);
                request.input('ModifyAccountID', sql.VarChar(), user.ITCC_UserID);
                request.input('UpdateUserID', sql.VarChar(), user.ITCC_UserID);
                request.input('CreateAccountID', sql.VarChar(), user.ITCC_UserID);

                request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
    
                let query = ' SELECT @SiteID = ITCC_WebsiteID FROM ITCC_WEBSITE (NOLOCK) WHERE (PrivateKeyID = @PrivateKeyID) ';
                query += ' BEGIN TRAN; ';
                query += ' INSERT INTO ITCC_Image (Name, Description, Slug, Category, Tags, Title, FilePath, FileGroup, PublishUrl, ';
                query += ' ITCC_WebsiteID, IsActive, CreateDate, ModifyDate, UpdateDate, ModifyAccountID, UpdateUserID, CreateAccountID, CreateUserID )';
                query += '  VALUES (@Name, @Description, @Slug, @Category, @Tags, @Title, @FilePath, @FileGroup, @PublishUrl, ';
                query += ' @SiteID, @IsActive, @CreateDate, @ModifyDate, @UpdateDate, @ModifyAccountID, @UpdateUserID, @CreateAccountID, @CreateAccountID )';
        
                query += ' COMMIT TRANSACTION;';
                query += ' SELECT SCOPE_IDENTITY() NEWID;';
        
                const authResult = await request.query(query);
                const result = (authResult && authResult.recordset && authResult.recordset.length > 0) ? authResult.recordset[0] : null;
    
                return result;
    
            } catch (err) {
                console.log({PostImage: err})
                throw err
            }
        },

    /*
        Updates a singLe Image's information on SQL Server
    */
        updateItem: async (config, privateKeyID, user, data) => {
            privateKeyID = privateKeyID ? String(privateKeyID).trim().toLowerCase() : privateKeyID;
    
            try {
                await sql.connect(config);
                const request = new sql.Request();
                request.input('Name', sql.VarChar(125), data.Name);
                request.input('Description', sql.VarChar(), data.Description);
                request.input('Slug', sql.VarChar(96), (data.Slug || ''));
                request.input('ImageType', sql.VarChar(), (data.ImageType || ''));
                request.input('PostDate', sql.DateTime2, data.PostDate);
                request.input('SortOrder', sql.Int, (data.SortOrder || 0));
                request.input('Category', sql.VarChar(), (data.Category || ''));
                request.input('Tags', sql.VarChar(), (data.Tags || ''));
                request.input('PostSummary', sql.VarChar(), (data.PostSummary || {}));
                request.input('ITCC_ImageID', sql.Int, data.ITCC_ImageID);
                request.input('ITCC_UserID', sql.Int, user.ITCC_UserID);
                request.input('SiteID', sql.VarChar(), data.ITCC_WebsiteID);
                request.input('ITCC_StatusID', sql.VarChar(), 2);
                request.input('CreateDate', sql.DateTime, data.CreateDate);
                request.input('ModifyDate', sql.DateTime, data.ModifyDate);
                request.input('ModifyAccountID', sql.VarChar(), data.ModifyAccountID);
                request.input('RoleName', sql.VarChar(), data.RoleName);
                request.input('PrivateKeyID', sql.UniqueIdentifier, privateKeyID);
    
                let query = ' ';
                query += ' BEGIN TRAN; ';
                query += ' UPDATE ITCC_Image SET Name=@Name, Description=@Description, Slug=@Slug, ImageType=@ImageType, ';
                query += ' PostDate = @PostDate, Category=@Category, Tags=@Tags, ITCC_StatusID=@ITCC_StatusID, ModifyDate = @ModifyDate, SortOrder = @SortOrder ';
                query += ' WHERE ITCC_ImageID = @ITCC_ImageID; '; 
                query += ' COMMIT TRANSACTION;';
                query += ' SELECT @@ROWCOUNT;';
        
                console.log(query)
                const authResult = await request.query(query);
                const result = data;
    
                console.log({result: result});
                return result;
    
            } catch (err) {
                console.log({PostImage: err})
                throw err
            }
        },

    /*
        Deletes a singLe non-admin Image's information on SQL Server  
    */
    deleteItem: async (config, privateKeyID, id) => {

        try {
            await sql.connect(config);

            let query = ' DELETE US ';
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
    }
};

module.exports = GalleryFunctions;