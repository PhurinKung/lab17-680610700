import { z } from "zod";

import type { Course } from "@/lib/types";

export const MAX_INSTRUCTORS = 3;

export const courseFormSchema = z.object({
    courseId: z.string().regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก"),
    courseTitle: z.string().trim().min(1, "กรอกชื่อวิชา").max(100, "ชื่อวิชายาวได้ไม่เกิน 100 ตัวอักษร"),
    // instructors: z.array(z.string()).min(1, "เลือกผู้สอนอย่างน้อย 1 คน"),
    instructors: z.array(
        z.object({
            name: z.string().trim().min(1, { message: "กรอกชื่อผู้สอน" }),
            email: z.string().regex(/^[a-zA-Z0-9._+-]+@cmu.ac.th$/,"อีเมลไม่ถูกต้อง"),
        })
    )
    .refine(
        (items) => 
            new Set(items.map((i) => i.email.toLowerCase())).size === items.length,
        { message: "อีเมลผู้สอนซ้ำกัน" },
    ),
    program: z.enum(["CPE", "ISNE"], { message: "เลือกหลักสูตร" }),
    semester: z.enum(["1", "2", "3"], { message: "เลือกภาคการศึกษา"}),
    description: z.string().max(100, "รายละเอียดยาวได้ไม่เกิน 100 ตัวอักษร").optional(),
    notifyByEmail: z.boolean().optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

//กันวิชาซ้ำ?
export function createCourseFormSchema(existingCourses: Course[]){
    return courseFormSchema.refine(
        (data) => !existingCourses.some((c) => c.courseId === data.courseId),
        { message: "รหัสวิชานี้มีอยู่แล้ว", path: ["courseId"] },
    )
}