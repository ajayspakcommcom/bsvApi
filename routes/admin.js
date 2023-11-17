const express = require('express');
const router = express.Router();

const controller = require('../controller/admin');

router.get('/admin-report', controller.getAdminReport);
router.post('/admin-report', controller.filterAdminReport);
router.get('/mail-send', controller.sendMail);

module.exports = router;


/**
 *  get doctor list
 *  get doctor profile
 *  save medicine report
 * 
 */