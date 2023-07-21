const express = require('express');
const router = express.Router();

const controller = require('../controller/admin');

router.get('/admin-report', controller.getAdminReport);
router.get('/', controller.sendMail);

module.exports = router;


/**
 *  get doctor list
 *  get doctor profile
 *  save medicine report
 * 
 */