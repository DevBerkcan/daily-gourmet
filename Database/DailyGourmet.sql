IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Allergens] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Allergens] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [FeatureFlags] (
        [Id] uniqueidentifier NOT NULL,
        [Key] nvarchar(50) NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(500) NULL,
        [DefaultEnabled] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_FeatureFlags] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [RecipeCategories] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_RecipeCategories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [TargetAudienceGroups] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_TargetAudienceGroups] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Tenants] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [MainContactName] nvarchar(200) NOT NULL,
        [MainContactEmail] nvarchar(256) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Tenants] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Locations] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Address] nvarchar(300) NOT NULL,
        [ContactPerson] nvarchar(200) NOT NULL,
        [CapacityPortions] int NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Locations] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Locations_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [MealPlans] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [CalendarWeek] int NOT NULL,
        [Year] int NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_MealPlans] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_MealPlans_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [StorageLocations] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_StorageLocations] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_StorageLocations_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Suppliers] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [ContactPerson] nvarchar(200) NULL,
        [Phone] nvarchar(50) NULL,
        [Email] nvarchar(256) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Suppliers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Suppliers_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [TenantFeatureFlags] (
        [TenantId] uniqueidentifier NOT NULL,
        [FeatureFlagId] uniqueidentifier NOT NULL,
        [Enabled] bit NOT NULL,
        CONSTRAINT [PK_TenantFeatureFlags] PRIMARY KEY ([TenantId], [FeatureFlagId]),
        CONSTRAINT [FK_TenantFeatureFlags_FeatureFlags_FeatureFlagId] FOREIGN KEY ([FeatureFlagId]) REFERENCES [FeatureFlags] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TenantFeatureFlags_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [TenantNotificationSettings] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [EventKey] nvarchar(50) NOT NULL,
        [Enabled] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_TenantNotificationSettings] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_TenantNotificationSettings_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [TenantProfiles] (
        [TenantId] uniqueidentifier NOT NULL,
        [VatId] nvarchar(50) NULL,
        [Street] nvarchar(200) NULL,
        [PostalCode] nvarchar(10) NULL,
        [City] nvarchar(100) NULL,
        [Phone] nvarchar(50) NULL,
        [Email] nvarchar(256) NULL,
        [Timezone] nvarchar(50) NOT NULL,
        [Currency] nvarchar(3) NOT NULL,
        [LogoUrl] nvarchar(500) NULL,
        CONSTRAINT [PK_TenantProfiles] PRIMARY KEY ([TenantId]),
        CONSTRAINT [FK_TenantProfiles_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [TenantSettings] (
        [TenantId] uniqueidentifier NOT NULL,
        [DefaultOrderDeadlineOffsetDays] int NOT NULL,
        [DefaultOrderDeadlineTime] time NOT NULL,
        [ExcludeWeekendsFromDeadline] bit NOT NULL,
        [RequireReviewBeforePublish] bit NOT NULL,
        [UnpublishRequiresNoOrders] bit NOT NULL,
        [FacilityNumberPrefix] nvarchar(10) NOT NULL,
        [ArticleNumberPrefix] nvarchar(10) NOT NULL,
        CONSTRAINT [PK_TenantSettings] PRIMARY KEY ([TenantId]),
        CONSTRAINT [FK_TenantSettings_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Facilities] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [LocationId] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [CustomerNumber] nvarchar(20) NOT NULL,
        [Address] nvarchar(300) NOT NULL,
        [ContactPerson] nvarchar(200) NOT NULL,
        [Email] nvarchar(256) NOT NULL,
        [Phone] nvarchar(50) NOT NULL,
        [OrderDeadlineOffsetDays] int NULL,
        [OrderDeadlineTime] time NULL,
        [ActiveWeekdays] nvarchar(20) NOT NULL,
        [PortionPrice] decimal(10,2) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [Notes] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Facilities] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Facilities_Locations_LocationId] FOREIGN KEY ([LocationId]) REFERENCES [Locations] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Facilities_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [ProcurementLists] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [LocationId] uniqueidentifier NOT NULL,
        [Label] nvarchar(200) NOT NULL,
        [CalendarWeek] int NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_ProcurementLists] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProcurementLists_Locations_LocationId] FOREIGN KEY ([LocationId]) REFERENCES [Locations] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProcurementLists_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [ProductionPlans] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [LocationId] uniqueidentifier NOT NULL,
        [Date] date NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_ProductionPlans] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductionPlans_Locations_LocationId] FOREIGN KEY ([LocationId]) REFERENCES [Locations] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProductionPlans_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [MealPlanDays] (
        [Id] uniqueidentifier NOT NULL,
        [MealPlanId] uniqueidentifier NOT NULL,
        [Weekday] nvarchar(20) NOT NULL,
        [Date] date NOT NULL,
        [Note] nvarchar(500) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_MealPlanDays] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_MealPlanDays_MealPlans_MealPlanId] FOREIGN KEY ([MealPlanId]) REFERENCES [MealPlans] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [MealPlanLocations] (
        [MealPlanId] uniqueidentifier NOT NULL,
        [LocationId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_MealPlanLocations] PRIMARY KEY ([MealPlanId], [LocationId]),
        CONSTRAINT [FK_MealPlanLocations_Locations_LocationId] FOREIGN KEY ([LocationId]) REFERENCES [Locations] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MealPlanLocations_MealPlans_MealPlanId] FOREIGN KEY ([MealPlanId]) REFERENCES [MealPlans] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [IngredientCategories] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [DefaultStorageLocationId] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_IngredientCategories] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_IngredientCategories_StorageLocations_DefaultStorageLocationId] FOREIGN KEY ([DefaultStorageLocationId]) REFERENCES [StorageLocations] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [MealPlanFacilities] (
        [MealPlanId] uniqueidentifier NOT NULL,
        [FacilityId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_MealPlanFacilities] PRIMARY KEY ([MealPlanId], [FacilityId]),
        CONSTRAINT [FK_MealPlanFacilities_Facilities_FacilityId] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MealPlanFacilities_MealPlans_MealPlanId] FOREIGN KEY ([MealPlanId]) REFERENCES [MealPlans] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Orders] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [FacilityId] uniqueidentifier NOT NULL,
        [MealPlanId] uniqueidentifier NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [SubmittedAt] datetime2 NULL,
        [DeadlineAtUtc] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Orders_Facilities_FacilityId] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Orders_MealPlans_MealPlanId] FOREIGN KEY ([MealPlanId]) REFERENCES [MealPlans] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Orders_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NULL,
        [FacilityId] uniqueidentifier NULL,
        [Name] nvarchar(200) NOT NULL,
        [Email] nvarchar(256) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [Role] nvarchar(20) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [LastLoginAt] datetime2 NULL,
        [FailedLoginCount] int NOT NULL,
        [LockedUntil] datetime2 NULL,
        [InvitationToken] nvarchar(200) NULL,
        [InvitationExpiresAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Users_Facilities_FacilityId] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Users_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Ingredients] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [CategoryId] uniqueidentifier NOT NULL,
        [SupplierId] uniqueidentifier NULL,
        [Name] nvarchar(200) NOT NULL,
        [ArticleNumber] nvarchar(50) NOT NULL,
        [BaseUnit] nvarchar(10) NOT NULL,
        [PurchaseUnit] nvarchar(100) NOT NULL,
        [ConversionFactor] decimal(12,4) NOT NULL,
        [PurchasePrice] decimal(12,2) NULL,
        [Vegetarian] bit NOT NULL,
        [Vegan] bit NOT NULL,
        [Bio] bit NOT NULL,
        [Regional] bit NOT NULL,
        [Active] bit NOT NULL,
        [Nutrition_Kcal] decimal(10,2) NOT NULL,
        [Nutrition_ProteinG] decimal(10,2) NOT NULL,
        [Nutrition_FatG] decimal(10,2) NOT NULL,
        [Nutrition_CarbsG] decimal(10,2) NOT NULL,
        [Nutrition_SugarG] decimal(10,2) NOT NULL,
        [Nutrition_SaltG] decimal(10,2) NOT NULL,
        [Nutrition_Source] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Ingredients] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Ingredients_IngredientCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [IngredientCategories] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Ingredients_Suppliers_SupplierId] FOREIGN KEY ([SupplierId]) REFERENCES [Suppliers] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_Ingredients_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [AuditLogs] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NULL,
        [UserId] uniqueidentifier NULL,
        [Action] nvarchar(200) NOT NULL,
        [Entity] nvarchar(100) NOT NULL,
        [EntityId] nvarchar(100) NOT NULL,
        [OldValues] nvarchar(max) NULL,
        [NewValues] nvarchar(max) NULL,
        [Reason] nvarchar(500) NULL,
        [IpAddress] nvarchar(45) NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AuditLogs_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AuditLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Deviations] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [ProductionPlanId] uniqueidentifier NULL,
        [Category] nvarchar(30) NOT NULL,
        [Subject] nvarchar(200) NOT NULL,
        [Quantity] nvarchar(100) NULL,
        [Action] nvarchar(500) NOT NULL,
        [ReportedByUserId] uniqueidentifier NOT NULL,
        [ReportedAt] datetime2 NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [ResolvedAt] datetime2 NULL,
        [ResolvedByUserId] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Deviations] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Deviations_ProductionPlans_ProductionPlanId] FOREIGN KEY ([ProductionPlanId]) REFERENCES [ProductionPlans] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Deviations_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Deviations_Users_ReportedByUserId] FOREIGN KEY ([ReportedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Deviations_Users_ResolvedByUserId] FOREIGN KEY ([ResolvedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Drivers] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [Phone] nvarchar(50) NOT NULL,
        [VehicleDescription] nvarchar(200) NOT NULL,
        [LicensePlate] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Drivers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Drivers_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Drivers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Notifications] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [RecipientUserId] uniqueidentifier NULL,
        [Title] nvarchar(200) NOT NULL,
        [Text] nvarchar(1000) NOT NULL,
        [IsRead] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Notifications_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Notifications_Users_RecipientUserId] FOREIGN KEY ([RecipientUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [QualityControls] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [ProductionPlanId] uniqueidentifier NULL,
        [Type] nvarchar(30) NOT NULL,
        [Area] nvarchar(200) NOT NULL,
        [TargetValue] nvarchar(50) NOT NULL,
        [MeasuredValue] nvarchar(50) NOT NULL,
        [PerformedByUserId] uniqueidentifier NOT NULL,
        [PerformedAt] datetime2 NOT NULL,
        [Status] nvarchar(10) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_QualityControls] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_QualityControls_ProductionPlans_ProductionPlanId] FOREIGN KEY ([ProductionPlanId]) REFERENCES [ProductionPlans] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_QualityControls_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_QualityControls_Users_PerformedByUserId] FOREIGN KEY ([PerformedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Recipes] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [CategoryId] uniqueidentifier NOT NULL,
        [CreatedByUserId] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(2000) NOT NULL,
        [RecipeNumber] nvarchar(50) NULL,
        [StandardPortions] int NOT NULL,
        [PortionWeightG] decimal(10,2) NULL,
        [PrepTimeMinutes] int NOT NULL,
        [Difficulty] nvarchar(20) NOT NULL,
        [Vegetarian] bit NOT NULL,
        [Vegan] bit NOT NULL,
        [ProductionNotes] nvarchar(1000) NULL,
        [ImageUrl] nvarchar(500) NULL,
        [CoreTemperatureC] decimal(5,2) NULL,
        [StorageNote] nvarchar(500) NULL,
        [ShelfLifeAfterPrep] nvarchar(200) NULL,
        [Active] bit NOT NULL,
        [Version] int NOT NULL,
        [Nutrition_Kcal] decimal(10,2) NULL,
        [Nutrition_Kj] decimal(10,2) NULL,
        [Nutrition_FatG] decimal(10,2) NULL,
        [Nutrition_SaturatedFatG] decimal(10,2) NULL,
        [Nutrition_CarbsG] decimal(10,2) NULL,
        [Nutrition_SugarG] decimal(10,2) NULL,
        [Nutrition_FiberG] decimal(10,2) NULL,
        [Nutrition_ProteinG] decimal(10,2) NULL,
        [Nutrition_SaltG] decimal(10,2) NULL,
        [Nutrition_AlcoholG] decimal(10,2) NULL,
        [NutriScore] nvarchar(1) NULL,
        [NutriScoreCategory] nvarchar(100) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Recipes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Recipes_RecipeCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [RecipeCategories] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Recipes_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Recipes_Users_CreatedByUserId] FOREIGN KEY ([CreatedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [SupportSessions] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [StartedByUserId] uniqueidentifier NOT NULL,
        [StartedAtUtc] datetime2 NOT NULL,
        [ExpiresAtUtc] datetime2 NOT NULL,
        [EndedAtUtc] datetime2 NULL,
        [EndedReason] nvarchar(10) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_SupportSessions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SupportSessions_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_SupportSessions_Users_StartedByUserId] FOREIGN KEY ([StartedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [SupportTickets] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [CreatedByUserId] uniqueidentifier NOT NULL,
        [TicketNumber] nvarchar(20) NOT NULL,
        [Category] nvarchar(10) NOT NULL,
        [Priority] nvarchar(10) NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [PageUrl] nvarchar(500) NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_SupportTickets] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SupportTickets_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_SupportTickets_Users_CreatedByUserId] FOREIGN KEY ([CreatedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [IngredientAdditives] (
        [Id] uniqueidentifier NOT NULL,
        [IngredientId] uniqueidentifier NOT NULL,
        [Text] nvarchar(100) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_IngredientAdditives] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_IngredientAdditives_Ingredients_IngredientId] FOREIGN KEY ([IngredientId]) REFERENCES [Ingredients] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [IngredientAllergens] (
        [IngredientId] uniqueidentifier NOT NULL,
        [AllergenId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_IngredientAllergens] PRIMARY KEY ([IngredientId], [AllergenId]),
        CONSTRAINT [FK_IngredientAllergens_Allergens_AllergenId] FOREIGN KEY ([AllergenId]) REFERENCES [Allergens] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_IngredientAllergens_Ingredients_IngredientId] FOREIGN KEY ([IngredientId]) REFERENCES [Ingredients] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [ProcurementListItems] (
        [Id] uniqueidentifier NOT NULL,
        [ProcurementListId] uniqueidentifier NOT NULL,
        [IngredientId] uniqueidentifier NOT NULL,
        [Unit] nvarchar(10) NOT NULL,
        [TotalQuantityBase] decimal(12,3) NOT NULL,
        [PurchaseQuantity] decimal(12,3) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_ProcurementListItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProcurementListItems_Ingredients_IngredientId] FOREIGN KEY ([IngredientId]) REFERENCES [Ingredients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProcurementListItems_ProcurementLists_ProcurementListId] FOREIGN KEY ([ProcurementListId]) REFERENCES [ProcurementLists] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [Routes] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [DriverId] uniqueidentifier NOT NULL,
        [LocationId] uniqueidentifier NULL,
        [Name] nvarchar(200) NOT NULL,
        [Date] date NOT NULL,
        [PlannedDepartureTime] time NOT NULL,
        [PlannedReturnTime] time NULL,
        [DistanceKm] decimal(6,1) NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Routes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Routes_Drivers_DriverId] FOREIGN KEY ([DriverId]) REFERENCES [Drivers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Routes_Locations_LocationId] FOREIGN KEY ([LocationId]) REFERENCES [Locations] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Routes_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [MealPlanItems] (
        [Id] uniqueidentifier NOT NULL,
        [MealPlanDayId] uniqueidentifier NOT NULL,
        [RecipeId] uniqueidentifier NOT NULL,
        [RecipeSnapshotJson] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_MealPlanItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_MealPlanItems_MealPlanDays_MealPlanDayId] FOREIGN KEY ([MealPlanDayId]) REFERENCES [MealPlanDays] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_MealPlanItems_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [OrderItems] (
        [Id] uniqueidentifier NOT NULL,
        [OrderId] uniqueidentifier NOT NULL,
        [Date] date NOT NULL,
        [RecipeId] uniqueidentifier NOT NULL,
        [Portions] int NOT NULL,
        [Note] nvarchar(500) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_OrderItem_Portions] CHECK ([Portions] >= 0),
        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_OrderItems_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [ProductionPlanItems] (
        [Id] uniqueidentifier NOT NULL,
        [ProductionPlanId] uniqueidentifier NOT NULL,
        [RecipeId] uniqueidentifier NOT NULL,
        [OrderedQuantity] int NOT NULL,
        [AdjustmentQuantity] int NOT NULL,
        [AdjustmentReason] nvarchar(500) NULL,
        [Status] nvarchar(20) NOT NULL,
        [WorkStatus] nvarchar(20) NOT NULL,
        [StagedQuantity] int NULL,
        [Workstation] nvarchar(100) NULL,
        [Equipment] nvarchar(100) NULL,
        [StartTime] time NULL,
        [FinishByTime] time NULL,
        [BatchCount] int NULL,
        [PortionsPerBatch] int NULL,
        [ResponsiblePerson] nvarchar(200) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_ProductionPlanItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductionPlanItems_ProductionPlans_ProductionPlanId] FOREIGN KEY ([ProductionPlanId]) REFERENCES [ProductionPlans] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ProductionPlanItems_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [RecipeAdditiveOverrides] (
        [Id] uniqueidentifier NOT NULL,
        [RecipeId] uniqueidentifier NOT NULL,
        [Text] nvarchar(100) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_RecipeAdditiveOverrides] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RecipeAdditiveOverrides_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [RecipeAllergenOverrides] (
        [Id] uniqueidentifier NOT NULL,
        [RecipeId] uniqueidentifier NOT NULL,
        [Text] nvarchar(100) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_RecipeAllergenOverrides] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RecipeAllergenOverrides_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [RecipeIngredients] (
        [Id] uniqueidentifier NOT NULL,
        [RecipeId] uniqueidentifier NOT NULL,
        [IngredientId] uniqueidentifier NOT NULL,
        [Quantity] decimal(12,3) NOT NULL,
        [Unit] nvarchar(10) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_RecipeIngredients] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RecipeIngredients_Ingredients_IngredientId] FOREIGN KEY ([IngredientId]) REFERENCES [Ingredients] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_RecipeIngredients_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [RecipeNutritionClaims] (
        [Id] uniqueidentifier NOT NULL,
        [RecipeId] uniqueidentifier NOT NULL,
        [Text] nvarchar(200) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_RecipeNutritionClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RecipeNutritionClaims_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [RecipePrepSteps] (
        [Id] uniqueidentifier NOT NULL,
        [RecipeId] uniqueidentifier NOT NULL,
        [StepNumber] int NOT NULL,
        [Text] nvarchar(1000) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_RecipePrepSteps] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RecipePrepSteps_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [RecipeTargetGroups] (
        [RecipeId] uniqueidentifier NOT NULL,
        [TargetAudienceGroupId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_RecipeTargetGroups] PRIMARY KEY ([RecipeId], [TargetAudienceGroupId]),
        CONSTRAINT [FK_RecipeTargetGroups_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_RecipeTargetGroups_TargetAudienceGroups_TargetAudienceGroupId] FOREIGN KEY ([TargetAudienceGroupId]) REFERENCES [TargetAudienceGroups] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [SupportTicketReplies] (
        [Id] uniqueidentifier NOT NULL,
        [TicketId] uniqueidentifier NOT NULL,
        [AuthorUserId] uniqueidentifier NOT NULL,
        [Role] nvarchar(20) NOT NULL,
        [Text] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_SupportTicketReplies] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SupportTicketReplies_SupportTickets_TicketId] FOREIGN KEY ([TicketId]) REFERENCES [SupportTickets] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_SupportTicketReplies_Users_AuthorUserId] FOREIGN KEY ([AuthorUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [RouteStops] (
        [Id] uniqueidentifier NOT NULL,
        [RouteId] uniqueidentifier NOT NULL,
        [FacilityId] uniqueidentifier NOT NULL,
        [SequenceNumber] int NOT NULL,
        [PlannedArrivalTime] time NOT NULL,
        [DeliveryWindowStart] time NULL,
        [DeliveryWindowEnd] time NULL,
        [ContactName] nvarchar(200) NOT NULL,
        [ContactPhone] nvarchar(50) NOT NULL,
        [Note] nvarchar(500) NULL,
        [Status] nvarchar(20) NOT NULL,
        [ProblemNote] nvarchar(500) NULL,
        [DeliveredAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_RouteStops] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RouteStops_Facilities_FacilityId] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_RouteStops_Routes_RouteId] FOREIGN KEY ([RouteId]) REFERENCES [Routes] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [ProductionAdjustments] (
        [Id] uniqueidentifier NOT NULL,
        [ProductionPlanItemId] uniqueidentifier NOT NULL,
        [OldQuantity] int NOT NULL,
        [NewQuantity] int NOT NULL,
        [Reason] nvarchar(500) NOT NULL,
        [ChangedByUserId] uniqueidentifier NOT NULL,
        [ChangedAt] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_ProductionAdjustments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductionAdjustments_ProductionPlanItems_ProductionPlanItemId] FOREIGN KEY ([ProductionPlanItemId]) REFERENCES [ProductionPlanItems] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ProductionAdjustments_Users_ChangedByUserId] FOREIGN KEY ([ChangedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE TABLE [RouteStopItems] (
        [Id] uniqueidentifier NOT NULL,
        [RouteStopId] uniqueidentifier NOT NULL,
        [RecipeId] uniqueidentifier NOT NULL,
        [OrderId] uniqueidentifier NULL,
        [OrderItemId] uniqueidentifier NULL,
        [Portions] int NOT NULL,
        [ContainerDescription] nvarchar(100) NOT NULL,
        [TemperatureRequirement] nvarchar(50) NOT NULL,
        [Note] nvarchar(500) NULL,
        [IsPacked] bit NOT NULL,
        [PackedAt] datetime2 NULL,
        [IsLoaded] bit NOT NULL,
        [LoadedAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_RouteStopItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RouteStopItems_OrderItems_OrderItemId] FOREIGN KEY ([OrderItemId]) REFERENCES [OrderItems] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_RouteStopItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_RouteStopItems_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_RouteStopItems_RouteStops_RouteStopId] FOREIGN KEY ([RouteStopId]) REFERENCES [RouteStops] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Allergens_Name] ON [Allergens] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_TenantId_CreatedAtUtc] ON [AuditLogs] ([TenantId], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_UserId] ON [AuditLogs] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Deviations_ProductionPlanId] ON [Deviations] ([ProductionPlanId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Deviations_ReportedByUserId] ON [Deviations] ([ReportedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Deviations_ResolvedByUserId] ON [Deviations] ([ResolvedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Deviations_TenantId] ON [Deviations] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Drivers_TenantId] ON [Drivers] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Drivers_UserId] ON [Drivers] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Facilities_LocationId] ON [Facilities] ([LocationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Facilities_TenantId_CustomerNumber] ON [Facilities] ([TenantId], [CustomerNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_FeatureFlags_Key] ON [FeatureFlags] ([Key]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_IngredientAdditives_IngredientId] ON [IngredientAdditives] ([IngredientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_IngredientAllergens_AllergenId] ON [IngredientAllergens] ([AllergenId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_IngredientCategories_DefaultStorageLocationId] ON [IngredientCategories] ([DefaultStorageLocationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_IngredientCategories_Name] ON [IngredientCategories] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Ingredients_CategoryId] ON [Ingredients] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Ingredients_SupplierId] ON [Ingredients] ([SupplierId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Ingredients_TenantId_ArticleNumber] ON [Ingredients] ([TenantId], [ArticleNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Locations_TenantId] ON [Locations] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MealPlanDays_MealPlanId] ON [MealPlanDays] ([MealPlanId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MealPlanFacilities_FacilityId] ON [MealPlanFacilities] ([FacilityId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MealPlanItems_MealPlanDayId] ON [MealPlanItems] ([MealPlanDayId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MealPlanItems_RecipeId] ON [MealPlanItems] ([RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MealPlanLocations_LocationId] ON [MealPlanLocations] ([LocationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_MealPlans_TenantId_Year_CalendarWeek] ON [MealPlans] ([TenantId], [Year], [CalendarWeek]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Notifications_RecipientUserId] ON [Notifications] ([RecipientUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Notifications_TenantId] ON [Notifications] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_RecipeId] ON [OrderItems] ([RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Orders_FacilityId_MealPlanId] ON [Orders] ([FacilityId], [MealPlanId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_MealPlanId] ON [Orders] ([MealPlanId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_TenantId] ON [Orders] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProcurementListItems_IngredientId] ON [ProcurementListItems] ([IngredientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ProcurementListItems_ProcurementListId_IngredientId_Unit] ON [ProcurementListItems] ([ProcurementListId], [IngredientId], [Unit]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProcurementLists_LocationId] ON [ProcurementLists] ([LocationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProcurementLists_TenantId] ON [ProcurementLists] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProductionAdjustments_ChangedByUserId] ON [ProductionAdjustments] ([ChangedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProductionAdjustments_ProductionPlanItemId] ON [ProductionAdjustments] ([ProductionPlanItemId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ProductionPlanItems_ProductionPlanId_RecipeId] ON [ProductionPlanItems] ([ProductionPlanId], [RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProductionPlanItems_RecipeId] ON [ProductionPlanItems] ([RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProductionPlans_LocationId] ON [ProductionPlans] ([LocationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ProductionPlans_TenantId_Date_LocationId] ON [ProductionPlans] ([TenantId], [Date], [LocationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_QualityControls_PerformedByUserId] ON [QualityControls] ([PerformedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_QualityControls_ProductionPlanId] ON [QualityControls] ([ProductionPlanId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_QualityControls_TenantId] ON [QualityControls] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RecipeAdditiveOverrides_RecipeId] ON [RecipeAdditiveOverrides] ([RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RecipeAllergenOverrides_RecipeId] ON [RecipeAllergenOverrides] ([RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RecipeCategories_Name] ON [RecipeCategories] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RecipeIngredients_IngredientId] ON [RecipeIngredients] ([IngredientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RecipeIngredients_RecipeId] ON [RecipeIngredients] ([RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RecipeNutritionClaims_RecipeId] ON [RecipeNutritionClaims] ([RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RecipePrepSteps_RecipeId] ON [RecipePrepSteps] ([RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Recipes_CategoryId] ON [Recipes] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Recipes_CreatedByUserId] ON [Recipes] ([CreatedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Recipes_TenantId] ON [Recipes] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RecipeTargetGroups_TargetAudienceGroupId] ON [RecipeTargetGroups] ([TargetAudienceGroupId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Routes_DriverId] ON [Routes] ([DriverId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Routes_LocationId] ON [Routes] ([LocationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Routes_TenantId] ON [Routes] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RouteStopItems_OrderId] ON [RouteStopItems] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RouteStopItems_OrderItemId] ON [RouteStopItems] ([OrderItemId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RouteStopItems_RecipeId] ON [RouteStopItems] ([RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RouteStopItems_RouteStopId] ON [RouteStopItems] ([RouteStopId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RouteStops_FacilityId] ON [RouteStops] ([FacilityId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RouteStops_RouteId] ON [RouteStops] ([RouteId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_StorageLocations_TenantId] ON [StorageLocations] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Suppliers_TenantId] ON [Suppliers] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SupportSessions_StartedByUserId] ON [SupportSessions] ([StartedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SupportSessions_TenantId] ON [SupportSessions] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SupportTicketReplies_AuthorUserId] ON [SupportTicketReplies] ([AuthorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SupportTicketReplies_TicketId] ON [SupportTicketReplies] ([TicketId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SupportTickets_CreatedByUserId] ON [SupportTickets] ([CreatedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SupportTickets_TenantId] ON [SupportTickets] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_SupportTickets_TicketNumber] ON [SupportTickets] ([TicketNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_TargetAudienceGroups_Name] ON [TargetAudienceGroups] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_TenantFeatureFlags_FeatureFlagId] ON [TenantFeatureFlags] ([FeatureFlagId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_TenantNotificationSettings_TenantId_EventKey] ON [TenantNotificationSettings] ([TenantId], [EventKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Users_FacilityId] ON [Users] ([FacilityId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Users_TenantId] ON [Users] ([TenantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260815205800_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260815205800_InitialCreate', N'10.0.11');
END;

COMMIT;
GO

