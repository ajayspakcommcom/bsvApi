
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
                    .execute('USP_HAEMAT_ADMIN_REPORT')
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

                const stDate = new Date(objParam.startDate).setDate(new Date(objParam.startDate).getDate() + 1);
                const enDate = new Date(objParam.endDate).setDate(new Date(objParam.endDate).getDate() + 1);

                let startDate = new Date(stDate);
                let endDate = new Date(enDate);

                request
                    .input("EmpId", sql.Int, objParam.empId)
                    .input("StartDate", sql.Date, startDate)
                    .input("EndDate", sql.Date, endDate)
                    .execute('USP_HAEMAT_ADMIN_REPORT')
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

exports.sendMail = (req, res, next) => {

    //const reportData = [];

    cron.schedule('* * * * *', () => {
        //0 8 * * *
        //https://cron.help/#8_16_*_*_*    
        console.log('Ram Ram..');
        const dbConn = new sql.ConnectionPool(dbConfig.dataBaseConfig);
        dbConn.connect().then(function () {
            const request = new sql.Request(dbConn);
            request.execute('USP_HAEMAT_ADMIN_REPORT').then((resp) => resp.recordsets[0])
                .then((resData) => {

                    console.log(resData);


                    const summaryData = resData.map((item) => {

                        return {
                            "ZoneName": item.Zonename,
                            "EmployeeName": item.EmployeeName,
                            "OrderDate": new Date(item.OrderDate[0]).toLocaleDateString('en-GB'),
                            "DoctorsName": item.DoctorsName[0],
                            "Speciality": item.Speciality[0],
                            "HospitalName": item.HospitalName[0],
                            "Indication": item.Indication ? getIndicationText(item.Indication) : 0,

                            "Thymogam NoOfPatients": item.Thymogam_NoOfPatients ? parseInt(item.Thymogam_NoOfPatients) : 0,
                            "Revugam NoOfPatients": (item.Revugam_NoOfPatients || item['Revugam-25_NoOfPatients']) ? parseInt((item.Revugam_NoOfPatients || item['Revugam-25_NoOfPatients'])) : 0,
                            "Oncyclo NoOfPatients": item.Oncyclo_NoOfPatients ? parseInt(item.Oncyclo_NoOfPatients) : 0,

                            "ThymogamVials": item.Thymogam_strips ? parseInt(item.Thymogam_strips) : 0,
                            "RevugamStrips": (item.Revugam_strips || item['Revugam-25_strips']) ? parseInt((item.Revugam_strips || item['Revugam-25_strips'])) : 0,
                            "OncycloStrips": item.Oncyclo_strips ? parseInt(item.Oncyclo_strips) : 0,

                            "ThymogamPap": item.Thymogam_PapValue ? parseInt(item.Thymogam_PapValue) : 0,
                            "RevugamPap": (item.Revugam_PapValue || item['Revugam-25_PapValue']) ? parseInt((item.Revugam_PapValue || item['Revugam-25_PapValue'])) : 0,
                            "OncycloPap": item.Oncyclo_PapValue ? parseInt(item.Oncyclo_PapValue) : 0,
                        }
                    });


                    request.execute('spMedicineUsageTDR').then((resp) => {
                        const tdrData = resp.recordsets[0];

                        const exportDataFile = async () => {
                            const workbook = new Excel.Workbook();
                            const summaryWorksheet = workbook.addWorksheet('Raw Data');
                            const tdrWorksheet = workbook.addWorksheet('Tdr Data');

                            summaryWorksheet.columns = [
                                { key: 'ZoneName', header: 'Zone Name' },
                                { key: 'EmployeeName', header: 'Employee Name' },
                                { key: 'OrderDate', header: 'Order Date' },
                                { key: 'DoctorsName', header: 'Doctor Name' },
                                { key: 'Speciality', header: 'Speciality' },
                                { key: 'HospitalName', header: 'Hospital Name' },
                                { key: 'Indication', header: 'Indication' },
                                { key: 'ThymogamNoOfPatients', header: 'Thymogam No OfPatients' },
                                { key: 'RevugamNoOfPatients', header: 'RevugamNo Of Patients' },
                                { key: 'OncycloNoOfPatients', header: 'Oncyclo No Of Patients' },
                                { key: 'ThymogamVials', header: 'ThymogamVials' },
                                { key: 'RevugamStrips', header: 'RevugamStrips' },
                                { key: 'OncycloStrips', header: 'OncycloStrips' },
                                { key: 'ThymogamPap', header: 'ThymogamPap' },
                                { key: 'RevugamPap', header: 'RevugamPap' },
                                { key: 'OncycloPap', header: 'OncycloPap' }
                            ];

                            summaryData.forEach((item) => {
                                summaryWorksheet.addRow(item);
                            });

                            tdrWorksheet.columns = [
                                { key: 'Orderdate', header: 'Order Date' },
                                { key: 'EmployeeName', header: 'Employee Name' },
                                { key: 'DoctorsName', header: 'Doctors Name' },
                                { key: 'NoofPatients', header: 'No Of Patients' }
                            ];

                            tdrData.forEach((item) => {
                                tdrWorksheet.addRow(item);
                            });

                            const exportPath = path.resolve(__dirname, 'Report.xlsx');
                            await workbook.xlsx.writeFile(exportPath);
                        }

                        exportDataFile();

                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'ajay@spakcomm.com',
                                pass: 'ajayundershivbhai'
                            }
                        });

                        const mailOptions = {
                            from: 'ajay@spakcomm.com',
                            to: 'ajay@spakcomm.com, shiv@spakcomm.com',
                            subject: 'Haemat P2C Report',
                            html: `<b>Haemat P2C Report</b>`,
                            attachments: [{
                                filename: 'Report.xlsx',
                                path: path.resolve(__dirname, 'Report.xlsx')
                            }]
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                                issue(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                                resolve(info.response);
                            }
                        });

                        dbConn.close();
                    })
                        .catch((error) => console.log(error));

                })
                .catch(function (err) {
                    console.log(err);
                    dbConn.close();
                });
        }).catch(function (err) {
            console.log(err);
        });
    });
};


const getIndicationText = (itemObj) => {
    if (itemObj === 'aa') {
        return 'Aplastic Anaemia';
    } else if (itemObj === 'itp') {
        return 'Immune Thrombocytopenic Purpura';
    } else {
        return '-NA-';
    }
}

const groupByKey = (array, key) => {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result;
    }, {});
}