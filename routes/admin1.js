const express = require('express');
const router = express.Router();

const controller = require('../controller/admin1');

router.get('/admin-report1', controller.getAdminReport);
router.get('/admin-report-tdr', controller.getAdminTdr);

module.exports = router;

/**
 *  get doctor list
 *  get doctor profile
 *  save medicine report
 * 
 */