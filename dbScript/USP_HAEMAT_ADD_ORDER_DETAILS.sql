

drop PROCEDURE USP_HAEMAT_ADD_ORDER_DETAILS  
go
-- USP_HAEMAT_ADD_ORDER_DETAILS 1000, 2, 2, '1-May-2023', 10    
------------------------------    
-- CREATED BY: GURU SINGH    
-- CREATED DATE: 24-MAY-2023    
------------------------------    
CREATE PROCEDURE USP_HAEMAT_ADD_ORDER_DETAILS    
(    
    @doctorId INT,    
    @empID int,    
    @medId int,    
    @orderDate date,    
    @NoOfVials int,  
    @NoOfStrips int,  
    @NoOfPatients int, 
    @papValue int,
    @indication NVARCHAR(50)    
)    
AS    
    SET NOCOUNT ON;    
    
       -- SELECT top 10 * FROM MedicineUsage    
        declare     
            @doctorCode NVARCHAR(100),    
            @doctorName NVARCHAR(100),    
            @HospitalName NVARCHAR(100),     
            @HospitalCity NVARCHAR(100),    
            @Speciality NVARCHAR(100);    
    
             select @doctorCode = d.customerCode,     
             @doctorName = d.doctorName,      
             @HospitalCity = d.cityName,     
             @HospitalName = d.hospitalName,    
             @Speciality = s.specialtyName    
             from tbldoctors d    
                INNER JOIN tblspecialty s on s.specialtyId = d.specialtyId and s.isActive = 0    
            where d.doctorID = @doctorId    
            
            -- select @doctorCode, @doctorName, @HospitalCity, @HospitalName, @Speciality    
    
                
            insert into MedicineUsage (empId, medID, orderDate, DoctorsID, DoctorsName, NoOfVials, HospitalName, HospitalCity,     
            Indication, Speciality, CreatedDate, NoOfPatients, strips, papValue)    
            VALUES(@empID, @medId, @orderDate, @doctorCode, @doctorName, @NoOfVials, @HospitalName, @HospitalCity,     
                @indication, @Speciality, GETDATE(), @NoOfPatients, @NoOfStrips, @papValue )    
    
            select 'true' as flag, 'Record added successfully' as msg   
    SET NOCOUNT OFF; 