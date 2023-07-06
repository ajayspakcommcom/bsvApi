const { response } = require('express');
const path = require('path');
const sql = require('mssql');
const dbConfig = require('./config');
let _STATUSCODE = 200;
const _allowedDesignaiton = ['ADMIN'];

/**
 * USP_HAEMAT_ADD_ORDER_DETAILS
USP_HAEMAT_GET_DOC_DETAILS
USP_HAEMAT_GET_DOC_LIST
 */


exports.getMyDoctorList = (req, res, next) => {
    getMyDoctorList(req.params).then((result) => {
        res.status(_STATUSCODE).json(result);
    });
};

function getMyDoctorList(objParam) {
    //console.clear();
    //console.log(dbConfig)
    //console.log(objParam);
    //console.log(storeProc)
    return new Promise((resolve) => {
        var dbConn = new sql.ConnectionPool(dbConfig.dataBaseConfig);
        dbConn
            .connect()
            .then(function () {
                var request = new sql.Request(dbConn);
                request
                    .input("empID", sql.Int, objParam.empId)
                    .execute('USP_HAEMAT_GET_DOC_LIST')
                    .then(function (resp) {
                        //console.log(resp)
                        resolve(resp.recordset);
                        dbConn.close();
                    })
                    .catch(function (err) {
                        console.log(err);
                        dbConn.close();
                    });
            })
            .catch(function (err) {
                console.log(err);
            });
    });
};




exports.getDoctorDetails = (req, res, next) => {

    getDoctorDetails(req.params).then((result) => {
        res.status(_STATUSCODE).json(result);
    });
};

function getDoctorDetails(objParam) {
    //console.clear();
    //console.log(dbConfig)
    //console.log(objParam);
    //console.log(storeProc)
    return new Promise((resolve) => {
        var dbConn = new sql.ConnectionPool(dbConfig.dataBaseConfig);
        dbConn
            .connect()
            .then(function () {
                var request = new sql.Request(dbConn);
                request
                    .input("doctorId", sql.Int, objParam.doctorId)
                    .execute('USP_HAEMAT_GET_DOC_DETAILS')
                    .then(function (resp) {
                        //console.log(resp)
                        resolve(resp.recordsets);
                        dbConn.close();
                    })
                    .catch(function (err) {
                        console.log(err);
                        dbConn.close();
                    });
            })
            .catch(function (err) {
                console.log(err);
            });
    });
};




exports.addBrandDetails = (req, res, next) => {
    let params = Object.assign(req.params, req.body);
    addBrandDetails(params).then((result) => {
        res.status(_STATUSCODE).json(result);
    });
};

function addBrandDetails(objParam) {
    //console.clear();
    console.log(objParam);
    return new Promise((resolve) => {
        var dbConn = new sql.ConnectionPool(dbConfig.dataBaseConfig);
        dbConn
            .connect()
            .then(function () {
                var request = new sql.Request(dbConn);
                request
                    .input("doctorId", sql.Int, objParam.doctorId)
                    .input("empID", sql.Int, objParam.empID)
                    .input("medId", sql.Int, objParam.medId)
                    .input("orderDate", sql.Date, objParam.orderDate)
                    .input("NoOfVials", sql.Int, objParam.NoOfVials)
                    .input("NoOfStrips", sql.Int, objParam.NoOfStrips)
                    .input("NoOfPatients", sql.Int, objParam.NoOfPatients)
                    .input("papValue", sql.Int, objParam.papValue)
                    .input("indication", sql.NVarChar, objParam.indication)
                    .execute('USP_HAEMAT_ADD_ORDER_DETAILS')
                    .then(function (resp) {
                        //console.log(resp)
                        resolve(resp.recordsets);
                        dbConn.close();
                    })
                    .catch(function (err) {
                        //   console.log(err);
                        dbConn.close();
                    });
            })
            .catch(function (err) {
                // console.log(err);
            });
    });
};