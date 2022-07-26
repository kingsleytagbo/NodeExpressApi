
/****** Object:  Table [dbo].[ITCC_Role]    Script Date: 7/26/2022 10:41:59 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ITCC_Role](
	[ITCC_RoleID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](384) NOT NULL,
	[Description] [nvarchar](max) NOT NULL,
	[SortOrder] [int] NOT NULL,
	[ITCC_WebsiteID] [int] NULL,
	[ITCC_StatusID] [int] NOT NULL,
	[CreateDate] [datetime] NOT NULL,
	[CreateUserID] [int] NOT NULL,
	[ModifyDate] [datetime] NOT NULL,
	[ModifyUserID] [int] NOT NULL,
 CONSTRAINT [PK_ITCC_Role] PRIMARY KEY CLUSTERED 
(
	[ITCC_RoleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[ITCC_Role] ADD  DEFAULT ((-1)) FOR [SortOrder]
GO

ALTER TABLE [dbo].[ITCC_Role] ADD  DEFAULT ((-1)) FOR [ITCC_WebsiteID]
GO

ALTER TABLE [dbo].[ITCC_Role] ADD  DEFAULT ((-1)) FOR [ITCC_StatusID]
GO

ALTER TABLE [dbo].[ITCC_Role] ADD  DEFAULT (getdate()) FOR [CreateDate]
GO

ALTER TABLE [dbo].[ITCC_Role] ADD  DEFAULT ((-1)) FOR [CreateUserID]
GO

ALTER TABLE [dbo].[ITCC_Role] ADD  DEFAULT (getdate()) FOR [ModifyDate]
GO

ALTER TABLE [dbo].[ITCC_Role] ADD  DEFAULT ((-1)) FOR [ModifyUserID]
GO

