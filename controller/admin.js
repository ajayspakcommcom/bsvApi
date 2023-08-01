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

exports.sendMail = (req, res, next) => {

    //const reportData = [];

    cron.schedule('0 8 * * *', () => {
        //0 8 * * *
        //https://cron.help/#8_16_*_*_*
        console.log('Ram');
        const dbConn = new sql.ConnectionPool(dbConfig.dataBaseConfig);
        dbConn.connect().then(function () {
            const request = new sql.Request(dbConn);
            request.execute('USP_HAEMAT_ADMIN_REPORT').then(function (resp) {
                const rawData = resp.recordsets[0];
                const filteredReport = resp.recordsets[0].map((item) => {
                    return {
                        "ZoneName": item.ZoneName,
                        "EmployeeName": item.EmployeeName,
                        "OrderDate": item.OrderDate[0],
                        "DoctorsName": item.DoctorsName[0],
                        "Speciality": item.Speciality[0],
                        "HospitalName": item.HospitalName[0],
                        "Indication": item.Indication ? getIndicationText(item.Indication[0]) : '-NA-', //getIndicationText(item.Indication),

                        "ThymogamNoOfPatients": item.medID === 37 ? item.NoOfPatients : '-NA-',
                        "RevugamNoOfPatients": (item.medID === 36 || item.medID === 38) ? item.NoOfPatients : '-NA-',
                        "OncycloNoOfPatients": item.medID === 35 ? item.NoOfPatients : '-NA-',

                        "ThymogamVials": item.medID === 37 ? item.NoOfVials : '-NA-',
                        "RevugamStrips": (item.medID === 36 || item.medID === 38) ? item.strips : '-NA-',
                        "OncycloStrips": item.medID === 35 ? item.strips : '-NA-',

                        "ThymogamPap": item.medID === 37 ? item.PapValue : '-NA-',
                        "RevugamPap": (item.medID === 36 || item.medID === 38) ? item.PapValue : '-NA-',
                        "OncycloPap": item.medID === 35 ? item.PapValue : '-NA-',
                    };
                });

                const rawFilteredData = rawData.map((item) => {
                    return {
                        CreatedDate: item.OrderDate[0],
                        ZoneName: item.ZoneName,
                        DoctorsID: item.DoctorsID[0],
                        DoctorsName: item.DoctorsName[0],
                        Speciality: item.Speciality[0],
                        HospitalName: item.HospitalName[0],
                        HospitalCity: item.hospitalCity,
                        Indication: item.Indication ? item.Indication[0] : '',
                        NoOfPatients: item.NoOfPatients,
                        NoOfVials: item.NoOfVials,
                        NoOfStrips: item.strips,
                        PapValue: item.PapValue,
                        medID: item.medID,
                        EmpID: item.EmpID,
                        EmployeeName: item.EmployeeName
                    };
                });

                const groupedRawFilteredData = groupByKey(rawFilteredData, 'DoctorsID');
                const groupedRawFilteredDataByDate = [];
                const tdrData = [];

                for (const key in groupedRawFilteredData) {
                    groupedRawFilteredDataByDate.push(groupByKey(groupedRawFilteredData[key], 'CreatedDate'));
                }

                for (const item of groupedRawFilteredDataByDate) {
                    for (const key in item) {

                        let isTdr = false;

                        if (item[key].length === 3) {
                            let oncycloMed = item[key].find(item => item.medID === 35);
                            let revugamMed = item[key].find(item => item.medID === 36);
                            let thymogamMed = item[key].find(item => item.medID === 37);

                            if (oncycloMed && revugamMed && thymogamMed) {
                                if ((parseInt(oncycloMed?.NoOfStrips) > 0) && (parseInt(revugamMed?.NoOfStrips)) && (parseInt(thymogamMed?.NoOfVials))) {
                                    isTdr = true;
                                }
                            }
                        }

                        if (isTdr) {
                            tdrData.push({
                                'EmployeeName': item[key][0].EmployeeName,
                                'drName': item[key][0].DoctorsName,
                                'noOfPatients': item[key][0].NoOfPatients,
                                'tdr': item[key].length === 3 ? 'Yes' : 'No',
                                'date': new Date(item[key][0].CreatedDate).toLocaleDateString()
                            });
                        }
                    }
                }

                const filteredTdr = tdrData.filter(item => item.tdr.toLowerCase() === "yes");
                const data = [...filteredReport];

                const exportDataFile = async () => {
                    const workbook = new Excel.Workbook();
                    const worksheet = workbook.addWorksheet('Raw Data');
                    const tdrworksheet = workbook.addWorksheet('Tdr Data');

                    worksheet.columns = [
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

                    tdrworksheet.columns = [
                        { key: 'EmployeeName', header: 'Employee Name' },
                        { key: 'drName', header: 'Doctor Name' },
                        { key: 'noOfPatients', header: 'No Of Patient' },
                        { key: 'tdr', header: 'Tdr' },
                        { key: 'date', header: 'Date' }
                    ];

                    data.forEach((item) => {
                        worksheet.addRow(item);
                    });

                    filteredTdr.forEach((item) => {
                        tdrworksheet.addRow(item);
                    });

                    const exportPath = path.resolve(__dirname, 'Report.xlsx');
                    await workbook.xlsx.writeFile(exportPath);
                };

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
                    to: 'ajay@spakcomm.com, shiv@spakcomm.com, manali.tamhane@bsvgroup.com, Priyanka.Chauhan@bsvgroup.com, yash.suthar@bsvgroup.com',
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
            }).catch(function (err) {
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