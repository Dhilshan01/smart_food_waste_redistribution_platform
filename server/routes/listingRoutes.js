import express from 'express';
import {
    createListing,
    getAvailableListings,
    getMyListings,
    getListingById,
    updateListingStatus,
    deleteListing,
    getMarketplaceListings,
    getMatchedListings
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';


const router = express.Router();

router.post('/', protect, authorizeRoles('donor'), createListing);
router.get('/available', protect, authorizeRoles('charity', 'admin'), getAvailableListings);
router.get('/my-listings', protect, authorizeRoles('donor'), getMyListings);
router.get('/marketplace', protect, authorizeRoles('donor'), getMarketplaceListings);
router.get('/matched', protect, authorizeRoles('charity'), getMatchedListings);
router.get('/:id', protect, getListingById);
router.patch('/:id/status', protect, authorizeRoles('donor'), updateListingStatus);
router.delete('/:id', protect, authorizeRoles('donor'), deleteListing);

export default router;
