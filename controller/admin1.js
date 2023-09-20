const { response } = require('express');
const path = require('path');
const sql = require('mssql');
const dbConfig = require('./config');
let _STATUSCODE = 200;
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Excel = require('exceljs');
//const _allowedDesignaiton = ['ADMIN'];

exports.getAdminReport = (req, res, next) => {
    getAdminReport(req.params).then((result) => {
        res.status(_STATUSCODE).json(result);
    });
};

function getAdminReport(objParam) {
    return new Promise((resolve) => {
        var dbConn = new sql.ConnectionPool(dbConfig.dataBaseConfig);
        dbConn
            .connect()
            .then(function () {
                var request = new sql.Request(dbConn);
                request
                    .input("EmpId", sql.Int, objParam.empId === null ? null : objParam.empId)
                    .input("StartDate", sql.Date, objParam.startDate === null ? null : objParam.startDate)
                    .input("EndDate", sql.Date, objParam.endDate === null ? null : objParam.endDate)
                    .execute('spMedicineUsageSummary')
                    .then(function (resp) {
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

exports.getAdminTdr = (req, res, next) => {
    getAdminTdr(req.params).then((result) => {
        res.status(_STATUSCODE).json(result);
    });
};

exports.filterAdminReport = (req, res, next) => {
    filterAdminReport(req.body).then((result) => {
        res.status(_STATUSCODE).json(result);
    });
};

function filterAdminReport(objParam) {
    return new Promise((resolve) => {
        var dbConn = new sql.ConnectionPool(dbConfig.dataBaseConfig);
        dbConn
            .connect()
            .then(function () {
                var request = new sql.Request(dbConn);

                const stDate = new Date(objParam.startDate).setDate(new Date(objParam.startDate).getDate() + 0);
                const enDate = new Date(objParam.endDate).setDate(new Date(objParam.endDate).getDate() + 0);

                let startDate = new Date(stDate);
                let endDate = new Date(enDate);

                request
                    .input("EmpId", sql.Int, objParam.empId === null ? null : objParam.empId)
                    .input("StartDate", sql.Date, objParam.startDate === null ? null : startDate)
                    .input("EndDate", sql.Date, objParam.endDate === null ? null : endDate)
                    .execute('spMedicineUsageSummary')
                    .then(function (resp) {
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

function getAdminTdr(objParam) {
    return new Promise((resolve) => {
        var dbConn = new sql.ConnectionPool(dbConfig.dataBaseConfig);
        dbConn
            .connect()
            .then(function () {
                var request = new sql.Request(dbConn);
                request
                    .input("EmpId", sql.Int, objParam.EmpId === null ? null : objParam.EmpId)
                    .input("StartDate", sql.Date, objParam.StartDate === null ? null : objParam.StartDate)
                    .input("EndDate", sql.Date, objParam.EndDate === null ? null : objParam.EndDate)
                    .execute('spMedicineUsageTDR')
                    .then(function (resp) {
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


