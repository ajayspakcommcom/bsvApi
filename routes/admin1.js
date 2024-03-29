const express = require('express');
const router = express.Router();

const controller = require('../controller/admin1');

router.get('/admin-report1', controller.getAdminReport);
router.get('/admin-report-tdr', controller.getAdminTdr);

router.post('/admin-report1-filter', controller.filterAdminReport);
router.post('/admin-report-tdr1-filter', controller.getAdminTdrFilter);

module.exports = router;

/**
 *  get doctor list
 *  get doctor profile
 *  save medicine report
 * 
 */