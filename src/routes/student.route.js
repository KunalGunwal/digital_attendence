import { Router } from "express";
import { addStudent } from "../controllers/student.controller.js";

const router = Router()

router.route('/addStudent').post(addStudent)

export default router