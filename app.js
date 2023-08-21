const express = require('express');
const multer = require("multer");
const bodyParser = require("body-parser");
const url = require('url');
const path = require("path");
const moongoose = require('mongoose');
const app = express();
const obj = require("./module/admin_login.js");
const add_student = require('./module/add_student.js');
const add_teacher = require('./module/add_teacher.js');
const add_classroom = require('./module/add_classroom.js');
const add_result = require('./module/add_result.js');
const add_project = require('./module/add_project.js');
const classroom_students = require('./module/classroom_students.js');
const session = require("express-session");
const alert = require('alert');
const { v4: uuidv4 } = require("uuid");
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
require("dotenv").config();

app.use(session({
    secret: "yug1234", // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/"); // Specify the destination folder here
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    const originalFileName = file.originalname
      .split(".")
      .slice(0, -1)
      .join("."); // Extract the original filename without extension
    cb(null, originalFileName + extname); // Use the original filename with the extracted extension
  },
});
const upload = multer({ storage: storage });


const storage_result = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,"./public/result/");
    },
    filename:(req,file,cb) => {
        const extname = path.extname(file.originalname);
        const originalFileName = file.originalname
          .split(".")
          .slice(0, -1)
          .join("."); // Extract the original filename without extension
        cb(null, originalFileName + extname);
    }
})
const upload_result = multer({ storage: storage_result });


const storage_project = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public/project")
    },
    filename:(req,file,cb)=>{
        const extname = path.extname(file.originalname);
        const originalFileName = file.originalname
          .split(".")
          .slice(0, -1)
          .join("."); // Extract the original filename without extension
        cb(null, originalFileName + extname);
    }
})
const upload_project = multer({ storage: storage_project });

app.get("/",(req,res)=>{
    res.render('index');
});


app.get("/project",(req,res)=>{
var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    const type = query.loginAs;
    if(type=="admin")    
    {
        res.render("AdminLogin");
    }

    else if(type=="teacher")
    {
        res.render("TeacherLogin");
    }

    else
    {
        res.render("StudentLogin");
    }
})

app.get("/AdminLogin",async function(req,res){
    const gotdata = await obj.find({});
    let realName = null;
    let realpassword = null;
    gotdata.forEach(element => {
        realName = element.name;
        realpassword = element.password;
    });

    const inputname = req.query.username;
    const inputpassword = req.query.password;
    
    if(inputname.toLowerCase() == realName.toLowerCase() && inputpassword == realpassword)
    {
        res.redirect("/Success");
    }
    else
    {
        const errorMessage = "Invalid username or password";
        res.render("AdminLogin", { errorMessage });
    }
});



app.get("/success",async function(req,res){
    const all_student = await add_student.find();
    const size_student = all_student.length;
    const all_teacher = await add_teacher.find();
    const size_teacher = all_teacher.length;
    const all_classroom = await add_classroom.find();
    const size_classroom = all_classroom.length;
    res.render("AdminHome", { size_student: size_student, size_teacher :size_teacher,size_classroom:size_classroom});
});


app.get("/Add_student",function(req,res){
    res.render("Add_student");
});


app.post("/Add_student_action",upload.single('photo'),async function(req,res){
    const fname = req.body.fname;
    const lname = req.body.lname;
    const eno = req.body.eno;
    const sem = req.body.sem;
    const branch = req.body.branch;
    const mob = req.body.mob;
    const photo = req.file.filename;
    const fnameRegex = /^[A-Za-z\s]+$/;
    const lnameRegex = /^[A-Za-z\s]+$/;
    console.log(fname);
    console.log(lname);
    console.log(eno);
    console.log(branch);
    console.log(photo);
    const errorMessages = [];
    if (!fnameRegex.test(fname)) {
    errorMessages.push("Invalid First name");
    }
    if (!lnameRegex.test(lname)) {
    errorMessages.push("Invalid Last name");
    }

    if (eno.length != 12) {
        errorMessages.push("Enrollment Number Should be 12 Digit");
    }

    if(mob.length!=10)
    {
        errorMessages.push("Mobile Number Should be of 10 Digit");
    }

    let type = photo.split(".");
    if(!(type[1]=="png"||type[1]=="jpg"||type[1]=="jpeg"))
    {
        errorMessages.push("Photo must be a PNG or JPEG or JPG");
    }

    if (errorMessages.length > 0) {
        res.render("Add_student", { errorMessages });
    } else {
    const submitted = await new add_student({
        fname,
        lname,
        eno,
        sem,
        branch,
        mob,
        photo,
    }).save();

    if(submitted)
    {
        alert("Successfully Inserted student Record");
        res.redirect("/Add_student");
    }
    else
    {
        res.send("<h1>Cannot Insert Student Record</h1>")
    }
        
    }
});

app.get("/View_all_students", async function(req, res){
    const alldata = await add_student.find({});
    res.render("ViewStudent", { details: alldata });
});

app.get("/Delete",async function(req,res){
    const idforDelete = req.query.id;
    const success_deleted = await add_student.findByIdAndRemove(idforDelete);
    if(success_deleted)
    {
        res.redirect("/View_all_students");
    }
    else
    {
        res.send("<h1>Cannot Delete Student Record</h1>");
    }
});

app.get("/Update", async function (req, res) {
    const idforUpdate = req.query.id;
    const information = await add_student.findById(idforUpdate);
    res.render("UpdateStudent", { details: information , idforStudent: idforUpdate });
});

app.get("/update_student_action", upload.single("photo"), async function (req, res) {
    const fname = req.query.fname;
    const lname = req.query.lname;
    const eno = req.query.eno;
    const sem = req.query.sem;
    const branch = req.query.branch;
    const mob = req.query.mob;
    const photo = req.query.photo;
    const id_for_update = req.query._id;
    
     let private_id = null;
     for (let i = 0; i < id_for_update.length - 1; i++) {
       private_id += id_for_update[i];
     }
    private_id = private_id.replace("null", "");
    const update_data = await add_student.findByIdAndUpdate(private_id,{
        fname:fname,
        lname:lname,
        eno:eno,
        sem:sem,
        branch:branch,
        mob:mob,
        photo:photo,
    }); 

    if(update_data)
    {
        alert("Updated Record Successfully");
        res.redirect("/View_all_students");
    }
    else
    {
        res.status(404).json({message:"Couldn't Update student"});
    }
});

app.get("/search", async (req, res) => {
    const studentArray = await add_student.find();
    const name = req.query.name;
    const data = studentArray.filter(x => String(x.fname).includes(name));
    res.send(data);
});

app.get("/Add_Teacher",async function(req, res) {
    res.render("Add_Teacher");
});

app.get("/Add_teacher_action",async function(req, res) {
    const tname = req.query.tname;
    const tmob = req.query.tmob;
    const tsalary = req.query.tsalary;
    const tnameRegex = /^[a-zA-Z]+$/;
    const errorMessages = [];
    if (!tnameRegex.test(tname)) {
      errorMessages.push("Invalid First name");
    }

    if (tmob.length != 10) {
      errorMessages.push("Mobile Number Should be of 10 Digit");
    }

    if (errorMessages.length > 0) {
      res.render("Add_Teacher", { errorMessages });
    }
    else
    {
        const add_teacher_record = await new add_teacher({
            tname:tname,
            tmob:tmob,
            tsalary:tsalary
        }).save();
        if(add_teacher_record)
        {
            alert("SuccessFully Inserted Teacher Record");
            res.redirect("/Add_Teacher");
        }
        else
        {
            alert("<h1>Couldn't Insert Record</h1>")
            res.redirect("/Add_Teacher");
        }
    }

});


app.get("/view_all_teacher",async function(req, res){
    const alldata = await add_teacher.find();
    res.render("view_all_teacher",{details:alldata});
});

app.get("/search_Teacher", async (req, res) => {
  const TeacherArray = await add_teacher.find();
  const t_name = req.query.t_name;
  const data = TeacherArray.filter((x) => String(x.tname).includes(t_name));
  res.send(data);
});

app.get("/Delete_Teacher",async function(req, res){
    const teacher_id_for_teacher = req.query.id;
    const success_deleted = await add_teacher.findByIdAndRemove(teacher_id_for_teacher);
    if (success_deleted) {
      res.redirect("/view_all_teacher");
    } else {
      res.send("<h1>Cannot Delete Student Record</h1>");
    }
    
});

app.get("/Update_Teacher", async function (req, res) {
  const id = req.query.id;
  const all_information = await add_teacher.findById(id);
  console.log(all_information);
  res.render("Update_Teacher", { details : all_information});
});

app.get("/Update_Teacher_Action", async function (req, res) {
  const id = req.query._id;
  const tname = req.query.tname;
  const tmob = req.query.tmob;
  const tsalary = req.query.tsalary;
  const tnameRegex = /^[a-zA-Z]+$/;
  const errorMessages = [];
  if (!tnameRegex.test(tname)) {
    errorMessages.push("Invalid First name");
  }

  if (tmob.length != 10) {
    errorMessages.push("Mobile Number Should be of 10 Digit");
  }

  if (errorMessages.length > 0) {
    res.render("Add_Teacher", { errorMessages });
  } else {
    const update_information = await add_teacher.findByIdAndUpdate(id, {
      tname: tname,
      tmob: tmob,
      tsalary: tsalary,
    });

    if (update_information) {
      alert("Teacher Record Updated Successfully");
      res.redirect("/view_all_teacher");
    } else {
      res.send("<h1>Cannot update Student Record</h1>");
    }
  }
});

app.get("/Create_classroom",async function (req,res){
    const all_teacher = await add_teacher.find();
    const uniqueId = uuidv4();
    res.render("create_classroom",{classroom_id: uniqueId,details: all_teacher});
});

app.post("/Create_Classroom_Action",upload.single('coverimage'),async function (req,res){
    const classname = req.body.classname;
    const teachername = req.body.teachername;
    const coverimage = req.file.filename;
    const classcode = req.body.classcode;
    const teacherid = req.body.teacherid;

    const add_new_classroom = await new add_classroom({
      classname: classname,
      teachername: teachername,
      coverimage: coverimage,
      classcode: classcode,
      teacherid: teacherid,
    }).save();

    if(add_new_classroom)
    {
        alert("Classroom Added Successfully");
        res.redirect("/Create_classroom");
    }
    else
    {
        res.redirect("/Create_classroom").send("<h1>Couldn't Add Classroom</h1>");
    }
});

app.get("/View_all_classroom",async function(req,res){
    const all_classroom = await add_classroom.find();
    res.render("viewclassroom",{details:all_classroom});
});

// app.get("/Class",async function(req,res){
//     const Class_code = req.query.Class_code;
//     const all_classroom = await add_classroom.find();
//     all_classroom.map((item) => {
//         if (item.classcode == Class_code) {
//             res.render("class",{details:item});
//         }
//     })
// });

app.get("/Delete_classroom",async function(req, res){
    const classcode_for_delete = req.query.classcode;
    const success = await add_classroom.deleteOne({classcode: classcode_for_delete});
    if(success)
    {
        res.redirect("/View_all_classroom");
    }
    else
    {
        alert("couldn't Classroom deleted");
    }
});

app.get("/Update_classroom", async function(req, res){
    const id_of_classroom = req.query.classcode;
    const all_classroom = await add_classroom.find();
    let id_for_update = null;
    all_classroom.forEach(element => {
        if(element.classcode == id_of_classroom)
        {
            id_for_update = element._id;
            id_for_update = id_for_update.toString();
            res.render("update_classroom", { details: element, id_for_update_final: id_for_update });
        }
    });
});

app.get("/Update_Classroom_Action",async function (req, res) {
    const classname = req.query.classname;
    const teachername = req.query.teachername;
    const coverimage = req.query.coverimage;
    const id = req.query.id;
    const success = await add_classroom.findByIdAndUpdate(id,{
        classname: classname,
        teachername: teachername,
    })
    if(success)
    {
        alert("Successfully updated Record");
        res.redirect("/View_all_classroom");
    }
    else
    {
        res.send("<h1>Couldn't update Record</h1>")
    }
});


app.post("/login_teacher_part2", async function(req, res) {
    const username = req.body.username;
    const faculty = req.body.faculty;
    const all_teacher_record = await add_teacher.find();
    
    let validCredentials = false;
    
    all_teacher_record.forEach(element => {
        if (element.tname == username && element.tid == faculty) {
            validCredentials = true;
        }
    });
    
    if (validCredentials) {
        req.session.username=username;
        req.session.faculty=faculty;
        res.redirect("/view_your_classroom_teacher");
    } else {
        res.render("TeacherLogin", { errorMessage: "Invalid username or Faculty Id" });
    }
});

app.get("/create_classroom_teacher",function(req,res){
    const uniqueId = uuidv4();
    const teacher_name_session = req.session.username;
    const faculty_id_session = req.session.faculty;
    res.render("create_classroom_teacher", { classroom_id: uniqueId, teacher_name: teacher_name_session, faculty_id: faculty_id_session });

}); 

app.post("/Create_Classroom_teacher_Action",upload.single("coverimage"),async function(req,res){
    const classname = req.body.classname;
    const teachername = req.body.teachername;
    const teacherid = req.body.teacherid;
    const coverimage = req.file.filename;
    const classcode = req.body.classcode;
    const add_classroom_success = await new add_classroom({
        classname: classname,
        teachername: teachername,
        teacherid: teacherid,
        coverimage: coverimage,
        classcode: classcode,
    }).save();

    if(add_classroom_success)
    {
        alert("Classroom Added Successfully");
        res.redirect("/create_classroom_teacher");
    }
    else
    {
        res.send("<h1>Cannot Add Classroom</h1>")
    }
});

app.get("/view_your_classroom_teacher",async function(req,res){
    const teacher_name_session = req.session.username;
    const faculty_id_session = req.session.faculty;
    let id_array = [];
    const allclassroom_teacher = await add_classroom.find();
    allclassroom_teacher.forEach(element => {
        if(element.teacherid == faculty_id_session)
        {
            id_array.push(element)
        }
    });
    res.render("view_your_classroom_teacher",{details:id_array});
});

app.get("/Delete_classroom_Teacher",async function(req, res){
    const classcode_for_delete = req.query.classcode;
    const success = await add_classroom.deleteOne({classcode: classcode_for_delete});
    if(success)
    {
        res.redirect("/view_your_classroom_teacher");
    }
    else
    {
        alert("couldn't Classroom deleted");
    }
});

app.get("/Update_classroom_Teacher", async function(req, res){
    const id_of_classroom = req.query.classcode;
    const all_classroom = await add_classroom.find();
    let id_for_update = null;
    all_classroom.forEach(element => {
        if(element.classcode == id_of_classroom)
        {
            id_for_update = element._id;
            id_for_update = id_for_update.toString();
            res.render("update_classroom_Teacher", { details: element, id_for_update_final: id_for_update });
        }
    });
});

app.get("/Update_Classroom_Action_Teacher",async function (req, res) {
    const classname = req.query.classname;
    const teachername = req.query.teachername;
    const coverimage = req.query.coverimage;
    const id = req.query.id;
    const success = await add_classroom.findByIdAndUpdate(id,{
        classname: classname,
        teachername: teachername,
    })
    if(success)
    {
        alert("Successfully updated Record");
        res.redirect("/view_your_classroom_teacher");
    }
    else
    {
        res.send("<h1>Couldn't update Record</h1>")
    }
});

app.get("/Class_Teacher",async function(req, res){
    const classcode = req.query.Class_code;
    req.session.classcode_for_teacher_result = classcode;
    let resultArray = [];
    const classroom_information = await add_classroom.find();
    const all_result = await add_result.find();
    all_result.forEach((element) => {
      if (element.classcode == classcode) {
        resultArray.push(element.name);
      }
    });
    classroom_information.forEach((element) => {
      if (element.classcode == classcode) {
        res.render("class_for_teacher_main", {
          details: element,
          allresult: resultArray,
          classcode_navbar: req.session.classcode_for_teacher_result,
        });
      }
    });
});

// app.get("/Class_people",async function(req,res){
//     const classcode_final = req.session.classcode;
//     const teacher_of_classroom = await add_classroom.find();
//     teacher_of_classroom.forEach(element => {
//         if(element.classcode==classcode_final)
//         {
//             res.render("Class_For_People",{details:element});
//         }
//     });
// });

app.post("/login_student",async function(req,res){
    let username = req.body.username;
    username=username.replace(" ", "");
    console.log(username);
    let istrue = false;
    const enrollment = req.body.enrollment;
    const all_student = await add_student.find();
    all_student.forEach(element => {
        if(((element.fname+element.lname).toLowerCase()==username.toLowerCase())&&(element.eno==enrollment))
        {
            istrue=true;
        }
    });

    if(istrue)
    {
        let student_classroom = [];
        const all_classroom = await add_classroom.find();
        // console.log(all_classroom);
        req.session.student_name = username;
        req.session.student_enrollment = enrollment
        const classroom_of_particular_student = await classroom_students.find();
        classroom_of_particular_student.forEach(element => {
            if(element.eno == req.session.student_enrollment)
            {
                all_classroom.forEach(element_classroom => {
                    if(element_classroom.classcode==element.classcode)
                    {
                        student_classroom.push({
                          coverimage: element_classroom.coverimage,
                          classcode: element.classcode,
                          classname: element_classroom.classname,
                          teachername: element_classroom.teachername,
                        });
                    }
                });
            }
        });
        // console.log(student_classroom);
        res.render("StudentHome", {student_name: req.session.student_name,details: student_classroom});
    }
    else
    {
        res.render("StudentLogin",{errorMessage:"Invalid username or enrollment Number"});
    }
});

app.get("/Upload_Result",async function(req, res){
    res.render("upload_result", {classcode_navbar: req.session.classcode_for_teacher_result});
});

app.post("/Upload_Res",upload_result.single("result"),async function (req, res) {
    try {
        const upload = req.file.originalname;
        let upload_valid = upload;
        let classcode_result = req.session.classcode;
        upload_valid = upload_valid.split(".");
        if(upload_valid[1]!="pdf")
        {
            res.render("upload_result",{errorMessage:"Result must be pdf only"});
        }
        else
        {
            const add_result_details = await new add_result({
              name: upload,
              classcode: classcode_result,
            }).save();
            if(add_result_details)
            {
                alert("Result Uploaded successfully");
                res.render("upload_result");
            }
            else
            {
                res.send("<h1>Upload Failed</h1>")
            }
        }
    } catch (error) {
        console.log(error);
    }
  }
);

app.get("/view_result",async function(req,res){
    let all_result_display = [];
    const all_result = await add_result.find();
    const all_teacher = await add_classroom.find();
    all_result.forEach(element => {
        all_teacher.forEach(element_teacher => {
            if(element.classcode == element_teacher.classcode)
            {
                all_result_display.push({
                  teachername: element_teacher.teachername,
                  name: element.name,
                  classcode: element.classcode,
                  classname: element_teacher.classname,
                });
            }
        });
    });
    res.render("view_result_admin", { details: all_result_display });
})

app.get("/result_download_admin_pdf",async function (req, res){
    const name = req.query.name;
    console.log(name);
    const publicFolderPath = path.join(__dirname, "public");
     const pdfPath = path.join(publicFolderPath, "result", name);
     console.log(pdfPath);
     res.download(pdfPath, name,function(req,res,err){
        if(err)
        {
            console.log(err);
        }
        else
        {
            alert("PDF download successfully");
        }
        res.redirect("/view_result");
     });
});

app.get("/Join",async function(req, res){
    res.render("Join_Classroom", { student_name: req.session.student_name });
});

app.get("/Join_class",async function(req, res){
    const classcode = req.query.Class_code;
    let isvalid=true;
    console.log(classcode);
    const student_enrollment = req.session.student_enrollment;
    const all_Data_of_classroom_verify = await classroom_students.find();
    all_Data_of_classroom_verify.forEach(element => {
        if(element.eno==student_enrollment)
        {
            if(element.classcode==classcode)
            {
                isvalid=false;
            }
        }
    });
    if(isvalid==false)
    {
        res.render("Join_Classroom", {
          student_name: req.session.student_name,
          errorMessage: "You Have Already Join Class",
        });
    }
    else{
    const add_student_in_classroom = await new classroom_students({
      classcode: classcode,
      eno: req.session.student_enrollment,
      name: req.session.student_name,
    }).save();

    if(add_student_in_classroom)
    {
        alert("Classroom Joined Sucessfully")
        let student_classroom = [];
        const all_classroom = await add_classroom.find();
        const classroom_of_particular_student = await classroom_students.find();
        classroom_of_particular_student.forEach((element) => {
          if (element.eno == req.session.student_enrollment) {
            all_classroom.forEach((element_classroom) => {
              if (element_classroom.classcode == element.classcode) {
                student_classroom.push({
                  coverimage: element_classroom.coverimage,
                  classcode: element.classcode,
                  classname: element_classroom.classname,
                  teachername: element_classroom.teachername,
                });
              }
            });
          }
        });
        // console.log(student_classroom);
        res.render("StudentHome", {
          student_name: req.session.student_name,
          details: student_classroom,
        });
    }
    else
    {
        res.send("<h1>Couldn't Join Classroom</h1>")
    }
}
});

app.get("/Class_Student",async function(req,res){
    let all_result_of_class = [];
    const Class_code = req.query.Class_code;
    const all_result = await add_result.find();
    all_result.forEach(element => {
        if(element.classcode == Class_code)
        {
            all_result_of_class.push(element.name)
        }
    });
    // console.log(all_result_of_class);
    req.session.classcode_result = Class_code;
    // console.log(Class_code);
    const all_classroom = await add_classroom.find();
    all_classroom.forEach(element => {
        if(element.classcode == Class_code)
        {
            req.session.teacher_name_for_result = element.teachername;
            req.session.teacher_id_for_result = element.teacherid;
            res.render("class_for_student",{details: element,allresult:all_result_of_class});
        }
    });
});

app.get("/Upload_project",async function(req,res){
    console.log(req.session.classcode_result);
    res.render("upload_project", { details: req.session.classcode_result });
});

app.post("/Upload_Project_Action",upload_project.single("project"),async function(req,res){
    try {
    const upload = req.file.originalname;
    let classcode_result = req.session.classcode_result;
        const add_project_details = await new add_project({
            classcode: classcode_result,
            result: upload,
            teachername:req.session.teacher_name_for_result,
            teacherid:req.session.teacher_id_for_result,
            studentname:req.session.student_name,
            studenteno:req.session.student_enrollment
        }).save();
        if (add_project_details) {
            alert("Project Uploaded successfully");
            res.render("upload_project", {details: req.session.classcode_result,});
        } else {
            res.send("<h1>Upload Failed</h1>");
        }
    }
    catch (error) {
        console.log(error);
    }
});

app.get("/Download_Result", async function (req, res) {
  const file = req.query.file;
  console.log(file);
  const project_path = path.join(__dirname, "public");
  const final_path = path.join(project_path, "result", file);
  console.log(final_path);
  res.download(final_path, file, async function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("<h1>Couldn't download project</h1>");
    } else {
      alert("Result downloaded successfully");
    }
  });
});

app.get("/Class_people_student",async function(req,res){
    const Class_code = req.query.Class_code;
    let allstudentinclassroom = [];
    const all_teacher_information = await add_classroom.find();
    const all_student_information = await classroom_students.find();
    const all_student = await add_student.find();
    
    all_student_information.forEach(element => {
        if(element.classcode==Class_code)
        {
            all_student.forEach(element_student => {
                console.log(element_student.fname+element_student.lname);
                if((element_student.fname+element_student.lname).toLowerCase()==(element.name).toLowerCase()) 
                {
                    allstudentinclassroom.push({fname: element_student.fname.toUpperCase(),lname: element_student.lname.toUpperCase(),photo: element_student.photo,
                    }); 
                }
            });
        }
    });
    console.log(allstudentinclassroom);
    all_teacher_information.forEach(element => {
        if(element.classcode==Class_code)
        {
            res.render("class_total_student",{details:element,allstudent:allstudentinclassroom});
        }
    });
});

app.get("/class_admin",async function(req,res){
    const classcode = req.query.classcode; 
    let resultArray=[];
    const classroom_information = await add_classroom.find();
    const all_result = await add_result.find();
    all_result.forEach(element => {
        if(element.classcode==classcode)
        {
            resultArray.push(element.name);
        }
    });
    classroom_information.forEach(element => {
            if (element.classcode == classcode) {
                res.render("class_for_admin", { details: element,allresult:resultArray});
            }
    });
});

app.get("/Class_people_admin",async function(req,res){
    const classcode = req.query.Class_code;
    let teacher_name = null;
    const all_project = await add_project.find();
    const all_student = await add_student.find();
    const all_classroom = await add_classroom.find();
    all_classroom.forEach(element => {
        if(element.classcode == classcode)
        {
            teacher_name = element.teachername;
        }
    });
    let resultArray = [];
    all_project.forEach(element => {
        if(element.classcode == classcode)
        {
            // resultArray.push(element);
            all_student.forEach(element_student => { 
                if(element.studenteno == element_student.eno)
                {
                    resultArray.push({ teachername: element.teachername, fname:element_student.fname.toUpperCase(),lname:element_student.lname.toUpperCase(),result:element.result,photo:element_student.photo,eno:element_student.eno});
                }
            });
        }
    });
    console.log(resultArray);
    res.render("class_people_admin_total",{details:resultArray,teacher_name_display:teacher_name})
});

app.get("/Download_Result",function(req,res){
    const file = req.query.file;
  console.log(file);
  const project_path = path.join(__dirname, "public");
  const final_path = path.join(project_path, "result", file);
  console.log(final_path);
  res.download(final_path, file, async function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("<h1>Couldn't download project</h1>");
    } else {
      alert("Result downloaded successfully");
    }
})
})

app.get("/Download_Project_admin",async function (req, res) {
    const file_name = req.query.file
    const path1 = path.join(__dirname,"public");
    const path_for_download = path.join(path1,"project",file_name);
    res.download(path_for_download,file_name,async function(req,res,err){
        if(err)
        {
            console.log("Couldn't download project");
        }
        else
        {
            alert("Project download Successful");
        }
    })
});

app.get("/Class_people",async function(req,res){
     const classcode = req.session.classcode_for_teacher_result;
     let teacher_name = null;
     const all_project = await add_project.find();
     const all_student = await add_student.find();
     const all_classroom = await add_classroom.find();
     all_classroom.forEach((element) => {
       if (element.classcode == classcode) {
         teacher_name = element.teachername;
       }
     });
     let resultArray = [];
     all_project.forEach((element) => {
       if (element.classcode == classcode) {
         // resultArray.push(element);
         all_student.forEach((element_student) => {
           if (element.studenteno == element_student.eno) {
             resultArray.push({
               teachername: element.teachername,
               fname: element_student.fname.toUpperCase(),
               lname: element_student.lname.toUpperCase(),
               result: element.result,
               photo: element_student.photo,
               eno: element_student.eno,
             });
           }
         });
       }
     });
     console.log(resultArray);
     res.render("class_total_student_teacher", {
       details: resultArray,
       teacher_name_display: teacher_name,
       classcode_navbar: req.session.classcode_for_teacher_result,
     });
})



app.get("/Logout",async function(req,res){
    res.redirect("/");
});


app.listen(5000,(req,res)=>{
    console.log("listening on 5000 Port");
});   


moongoose
  .connect(process.env.CONNECT_LINK)
  .then(() => console.log("Connected To Database"))
  .catch((err) => console.log(err + "Error in connection"));