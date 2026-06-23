import express from 'express';
import {
    createListing,
    getAvailableListings,
    getMyListings,
    getListingById,
    updateListingStatus,
    deleteListing
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { getMarketplaceListings } from '../controllers/listingController.js';


const router = express.Router();

router.post('/', protect, authorizeRoles('donor'), createListing);
router.get('/available', protect, authorizeRoles('charity', 'admin'), getAvailableListings);
router.get('/my-listings', protect, authorizeRoles('donor'), getMyListings);
router.get('/:id', protect, getListingById);
router.patch('/:id/status', protect, authorizeRoles('donor'), updateListingStatus);
router.delete('/:id', protect, authorizeRoles('donor'), deleteListing);
router.get('/marketplace', protect, authorizeRoles('donor', 'business'), getMarketplaceListings);

export default router;