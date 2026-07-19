const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { auth, adminOnly } = require('../middleware/auth');
const { complaintValidation } = require('../middleware/validation');

router.post('/', auth, complaintValidation, complaintController.createComplaint);
router.get('/my-complaints', auth, complaintController.getUserComplaints);
router.get('/all', auth, adminOnly, complaintController.getAllComplaints);
router.put('/:id', auth, adminOnly, complaintController.updateComplaintStatus);

module.exports = router;
