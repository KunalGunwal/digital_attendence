import { Router } from "express";
import { addTeacher, uploadTeacherPhoto, loginTeacher, getCurrentTeacher } from "../controllers/teacher.controller.js";
import { markStuAttendence, markTeacherAttendence, retriveStudents } from "../controllers/markattendence.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route('/addTeacher').post(addTeacher)
router.route("/upload-photo").post(
    verifyJWT,
    upload.single("photo"), 
    uploadTeacherPhoto 
);
//router.route('/saveIp').post(verifyJWT, saveIP)
router.route('/loginTeacher').post(loginTeacher)
router.route('/markStuAttendence').post(verifyJWT, markStuAttendence)
router.route('/markTeacherAttendence').post(verifyJWT, markTeacherAttendence)
router.route('/getCurrentTeacher').post(verifyJWT,getCurrentTeacher)
router.route('/retriveStudents').post(verifyJWT,retriveStudents)

export default router