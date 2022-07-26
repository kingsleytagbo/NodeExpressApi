
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ITCC_User](
	[ITCC_UserID] [int] IDENTITY(1,1) NOT NULL,
	[UserName] [nvarchar](64) NOT NULL,
	[UserID] [uniqueidentifier] NOT NULL,
	[Password] [nvarchar](64) NOT NULL,
	[EmailAddress] [nvarchar](64) NOT NULL,
	[FirstName] [nvarchar](64) NOT NULL,
	[MiddleInitial] [nvarchar](64) NULL,
	[LastName] [nvarchar](128) NOT NULL,
	[HomeAddress1] [nvarchar](max) NULL,
	[HomeAddress2] [nvarchar](max) NULL,
	[OtherHomeAddress] [nvarchar](max) NULL,
	[HomeCity] [nvarchar](64) NULL,
	[HomeState] [nvarchar](64) NULL,
	[HomePostalCode] [nvarchar](64) NULL,
	[HomeCountry] [nvarchar](64) NULL,
	[OfficeAddress1] [nvarchar](max) NULL,
	[OfficeAddress2] [nvarchar](max) NULL,
	[OtherOfficeAddress] [nvarchar](max) NULL,
	[OfficeCity] [nvarchar](64) NULL,
	[OfficeState] [nvarchar](64) NULL,
	[OfficePostalCode] [nvarchar](64) NULL,
	[OfficeCountry] [nvarchar](64) NULL,
	[Birthday] [datetime] NULL,
	[MobilePhoneNumber] [nvarchar](64) NULL,
	[HomePhoneNumber] [nvarchar](64) NULL,
	[OtherHomePhoneNumber] [nvarchar](64) NULL,
	[HomeFaxNumber] [nvarchar](64) NULL,
	[OfficePhoneNumber] [nvarchar](64) NULL,
	[OtherOfficePhoneNumber] [nvarchar](64) NULL,
	[OfficeFaxNumber] [nvarchar](64) NULL,
	[AlternatePhone] [nvarchar](max) NULL,
	[AssistantFullName] [nvarchar](64) NULL,
	[AssistantPhoneNumber] [nvarchar](64) NULL,
	[ManagerFullName] [nvarchar](64) NULL,
	[ManagerPhoneNumber] [nvarchar](64) NULL,
	[LinkedInAddress] [nvarchar](128) NULL,
	[FacebookAddress] [nvarchar](128) NULL,
	[TwitterAddress] [nvarchar](128) NULL,
	[SocialMediaAddress] [nvarchar](max) NULL,
	[WebsiteAddress] [nvarchar](128) NULL,
	[Occupation] [nvarchar](64) NULL,
	[JobTitle] [nvarchar](128) NULL,
	[CompanyName] [nvarchar](128) NULL,
	[DepartmentName] [nvarchar](128) NULL,
	[UserDescription] [nvarchar](max) NULL,
	[IsOnline] [bit] NOT NULL,
	[UserSetting] [nvarchar](max) NULL,
	[UserToken] [uniqueidentifier] NOT NULL,
	[OpenIDProvider] [nvarchar](128) NULL,
	[OpenID] [nvarchar](128) NULL,
	[MobileAlias] [nvarchar](16) NULL,
	[IsAnonymous] [bit] NULL,
	[LastActivityDate] [datetime] NULL,
	[PasswordSalt] [nvarchar](128) NULL,
	[MobilePin] [nvarchar](16) NULL,
	[PasswordQuestion] [nvarchar](max) NULL,
	[PasswordAnswer] [nvarchar](max) NULL,
	[IsApproved] [bit] NOT NULL,
	[IsLockedOut] [bit] NOT NULL,
	[LastLoginDate] [datetime] NULL,
	[LastLogoutDate] [datetime] NULL,
	[LastPasswordChangedDate] [datetime] NULL,
	[LastLockoutDate] [datetime] NULL,
	[FailedPasswordAttemptCount] [int] NULL,
	[FailedPasswordAttemptWindowStart] [datetime] NULL,
	[FailedPasswordAnswerAttemptCount] [int] NULL,
	[FailedPasswordAnswerAttemptWindowStart] [datetime] NULL,
	[AcceptPrivacyPolicy] [bit] NULL,
	[AcceptServiceTerm] [bit] NULL,
	[AcceptEmailContact] [bit] NULL,
	[ITCC_WebsiteID] [int] NULL,
	[ITCC_StatusID] [int] NOT NULL,
	[CreateDate] [datetime] NOT NULL,
	[CreateUserID] [int] NOT NULL,
	[ModifyDate] [datetime] NOT NULL,
	[ModifyUserID] [int] NOT NULL,
	[JoinReason] [nvarchar](256) NULL,
	[JoinReasonNote] [nvarchar](max) NULL,
	[IPAddress] [varchar](64) NULL,
 CONSTRAINT [PK_ITCC_User] PRIMARY KEY CLUSTERED 
(
	[ITCC_UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT (newid()) FOR [UserID]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT ((0)) FOR [IsOnline]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT (newid()) FOR [UserToken]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT ((0)) FOR [IsAnonymous]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT (getdate()) FOR [LastActivityDate]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT ((0)) FOR [IsApproved]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT ((1)) FOR [IsLockedOut]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT ((-1)) FOR [ITCC_StatusID]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT (getdate()) FOR [CreateDate]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT ((-1)) FOR [CreateUserID]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT (getdate()) FOR [ModifyDate]
GO

ALTER TABLE [dbo].[ITCC_User] ADD  DEFAULT ((-1)) FOR [ModifyUserID]
GO

