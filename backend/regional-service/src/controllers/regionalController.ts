import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { Region, IRegion, ITribe } from '../models/Regional';
import { AuthError } from '../middleware/authMiddleware';

// @desc    Get all regions
// @route   GET /api/v1/regional/regions
// @access  Public
export const getAllRegions = asyncHandler(async (req: Request, res: Response) => {
    const regions = await Region.find({ isActive: true }).select('-tribes.traditionalDishes -tribes.cookingMethods -tribes.description -culturalInfo -ingredients');
    res.status(200).json({ success: true, count: regions.length, data: regions });
});

// @desc    Get single region details
// @route   GET /api/v1/regional/regions/:id
// @access  Public
export const getRegionDetails = asyncHandler(async (req: Request, res: Response) => {
    const region = await Region.findOne({ _id: req.params.id, isActive: true });
    if (!region) {
        throw new AuthError(`Region not found with id of ${req.params.id}`, 404);
    }
    res.status(200).json({ success: true, data: region });
});

// @desc    Get all tribes (globally, or consider if this should be per region)
// @route   GET /api/v1/regional/tribes
// @access  Public
export const getAllTribes = asyncHandler(async (req: Request, res: Response) => {
    // This will fetch all regions and then extract tribes. 
    // For performance on a large dataset, consider a dedicated Tribe collection if global querying is frequent.
    const regions = await Region.find({ isActive: true }).select('name tribes');
    const allTribes: any[] = [];
    regions.forEach((region: IRegion) => {
        region.tribes.forEach((tribe: ITribe) => {
            if (tribe.isActive) {
                allTribes.push({
                    regionName: region.name,
                    tribeName: tribe.name,
                    tribeDescription: tribe.description, // Consider if description should be here or in a dedicated tribe detail endpoint
                });
            }
        });
    });
    res.status(200).json({ success: true, count: allTribes.length, data: allTribes });
});

// @desc    Get recipes by region (Placeholder - Recipe data is in RecipeService)
// @route   GET /api/v1/regional/recipes/:regionName
// @access  Public
export const getRecipesByRegion = asyncHandler(async (req: Request, res: Response) => {
    const regionName = req.params.regionName;
    // In a real microservice architecture, you would typically:
    // 1. Validate the regionName exists (e.g., query local Region model).
    // 2. Make an internal HTTP request to RecipeService to fetch recipes filtered by this regionName.
    // For now, we'll just simulate a response.
    const region = await Region.findOne({ name: regionName, isActive: true });
    if (!region) {
        throw new AuthError(`Region '${regionName}' not found or is not active`, 404);
    }
    res.status(200).json({ 
        success: true, 
        message: `This endpoint should return recipes for region: ${regionName}. Integration with RecipeService is needed.`,
        regionId: region._id
    });
});

// @desc    Get tribal recipes (Placeholder - Recipe data is in RecipeService)
// @route   GET /api/v1/regional/recipes/tribe/:tribeName
// @access  Public
export const getRecipesByTribe = asyncHandler(async (req: Request, res: Response) => {
    const tribeName = req.params.tribeName;
    // Similar to getRecipesByRegion, this would involve:
    // 1. Validate tribeName (potentially search across all regions or within a specific region if provided).
    // 2. Call RecipeService.
    // For now, simulate.
    const regionsContainingTribe = await Region.find({ "tribes.name": tribeName, "tribes.isActive": true, isActive: true });
    if (!regionsContainingTribe || regionsContainingTribe.length === 0) {
        throw new AuthError(`Tribe '${tribeName}' not found or is not active in any region`, 404);
    }
    res.status(200).json({ 
        success: true, 
        message: `This endpoint should return recipes for tribe: ${tribeName}. Integration with RecipeService is needed. Found in regions: ${regionsContainingTribe.map((r: IRegion)=>r.name).join(', ')}` 
    });
});

// ADMIN ROUTES

// @desc    Create a new region
// @route   POST /api/v1/regional/regions
// @access  Private/Admin
export const createRegion = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, popularDishes, ingredients, culturalInfo, tribes } = req.body;
    const region = await Region.create({ name, description, popularDishes, ingredients, culturalInfo, tribes });
    res.status(201).json({ success: true, data: region });
});

// @desc    Update a region
// @route   PUT /api/v1/regional/regions/:id
// @access  Private/Admin
export const updateRegion = asyncHandler(async (req: Request, res: Response) => {
    let region = await Region.findById(req.params.id);
    if (!region) {
        throw new AuthError(`Region not found with id of ${req.params.id}`, 404);
    }
    region = await Region.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: region });
});

// @desc    Delete a region
// @route   DELETE /api/v1/regional/regions/:id
// @access  Private/Admin
export const deleteRegion = asyncHandler(async (req: Request, res: Response) => {
    const region = await Region.findById(req.params.id);
    if (!region) {
        throw new AuthError(`Region not found with id of ${req.params.id}`, 404);
    }
    // Instead of deleting, we can set isActive to false for soft delete
    region.isActive = false;
    await region.save();
    // await Region.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: `Region ${region.name} marked as inactive.` });
});

// @desc    Create a new tribe within a specific region
// @route   POST /api/v1/regional/regions/:regionId/tribes
// @access  Private/Admin
export const createTribeInRegion = asyncHandler(async (req: Request, res: Response) => {
    const { regionId } = req.params;
    const { name, description, traditionalDishes, cookingMethods } = req.body as ITribe;

    const region = await Region.findById(regionId);
    if (!region) {
        throw new AuthError(`Region not found with id of ${regionId}`, 404);
    }

    // Check if tribe already exists in this region
    const tribeExists = region.tribes.find((tribe: ITribe) => tribe.name.toLowerCase() === name.toLowerCase());
    if (tribeExists) {
        throw new AuthError(`Tribe '${name}' already exists in region '${region.name}'`, 400);
    }

    const newTribe: ITribe = { name, description, traditionalDishes, cookingMethods, isActive: true } as ITribe;
    region.tribes.push(newTribe);
    await region.save();

    res.status(201).json({ success: true, data: region });
});


// @desc    Update a tribe within a specific region
// @route   PUT /api/v1/regional/regions/:regionId/tribes/:tribeName
// @access  Private/Admin
export const updateTribeInRegion = asyncHandler(async (req: Request, res: Response) => {
    const { regionId, tribeName } = req.params;
    const tribeDataToUpdate = req.body as Partial<ITribe>;

    const region = await Region.findById(regionId);
    if (!region) {
        throw new AuthError(`Region not found with id of ${regionId}`, 404);
    }

    const tribeIndex = region.tribes.findIndex((tribe: ITribe) => tribe.name.toLowerCase() === tribeName.toLowerCase());
    if (tribeIndex === -1) {
        throw new AuthError(`Tribe '${tribeName}' not found in region '${region.name}'`, 404);
    }

    // Update specific fields of the tribe
    Object.assign(region.tribes[tribeIndex], tribeDataToUpdate);
    // Ensure name uniqueness if it's being changed (and if it's different from original)
    if (tribeDataToUpdate.name && tribeDataToUpdate.name.toLowerCase() !== tribeName.toLowerCase()){
        const existingTribeWithName = region.tribes.find((tribe: ITribe, index: number) => index !== tribeIndex && tribe.name.toLowerCase() === tribeDataToUpdate.name!.toLowerCase());
        if (existingTribeWithName) {
            throw new AuthError(`Another tribe with name '${tribeDataToUpdate.name}' already exists in region '${region.name}'`, 400);
        }
    }

    await region.save();
    res.status(200).json({ success: true, data: region });
});

// @desc    Delete a tribe (mark as inactive) within a specific region
// @route   DELETE /api/v1/regional/regions/:regionId/tribes/:tribeName
// @access  Private/Admin
export const deleteTribeInRegion = asyncHandler(async (req: Request, res: Response) => {
    const { regionId, tribeName } = req.params;

    const region = await Region.findById(regionId);
    if (!region) {
        throw new AuthError(`Region not found with id of ${regionId}`, 404);
    }

    const tribeIndex = region.tribes.findIndex((tribe: ITribe) => tribe.name.toLowerCase() === tribeName.toLowerCase());
    if (tribeIndex === -1) {
        throw new AuthError(`Tribe '${tribeName}' not found in region '${region.name}'`, 404);
    }

    region.tribes[tribeIndex].isActive = false; // Soft delete
    await region.save();

    res.status(200).json({ success: true, message: `Tribe '${tribeName}' in region '${region.name}' marked as inactive.` });
});

// @desc    Get all tribes for a specific region
// @route   GET /api/v1/regional/regions/:regionId/tribes
// @access  Public
export const getTribesByRegion = asyncHandler(async (req: Request, res: Response) => {
    const { regionId } = req.params;
    const region = await Region.findOne({ _id: regionId, isActive: true }).select('name tribes');

    if (!region) {
        throw new AuthError(`Region not found with id of ${regionId} or is not active`, 404);
    }

    const activeTribes = region.tribes.filter((tribe: ITribe) => tribe.isActive);

    res.status(200).json({ 
        success: true, 
        regionName: region.name,
        count: activeTribes.length, 
        data: activeTribes.map((t: ITribe) => ({name: t.name, description: t.description})) // Send limited info
    });
}); 