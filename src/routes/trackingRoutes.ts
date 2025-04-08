import { Router } from 'express'
import TrackingController from '../controllers/TrackingController'

const trackingRouter = Router()

// TrackingController.post('/request', TrackingController.sendTrackingRequest);
// TrackingController.post('/accept', TrackingController.acceptTrackingRequest);
// TrackingController.delete('/request/cancel', TrackingController.cancelRequestBeforeAccept);
// TrackingController.delete('/cancel', TrackingController.stopTrackingUser);
// TrackingController.post('/block', TrackingController.blockUser);
// TrackingController.delete('/unblock', TrackingController.unblockUser);
// TrackingController.get('/followers/:userId', TrackingController.getFollowers);
// TrackingController.get('/following/:userId', TrackingController.getFollowing);
// TrackingController.post('/update-location', TrackingController.updateLocation);
// TrackingController.get('/get-location/:userId', TrackingController.getLocation);

export default trackingRouter
