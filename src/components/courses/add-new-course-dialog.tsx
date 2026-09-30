import { Fragment, useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Plus, X, RotateCcw } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useForm,
  type DefaultValues,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import {
//   emptyCourseForm,
//   validateCourseField,
//   validateCourseForm,
//   type CourseFormErrors,
// } from "@/lib/course-validation";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch";
import {
  createCourseFormSchema,
  MAX_INSTRUCTORS,
  type CourseFormValues,
} from "@/lib/schemas/course-schema";
import { useEnrollmentStore } from "@/lib/enrollment-store";
/**
 *   (Lab 17): เขียนฟอร์มนี้ใหม่ด้วย Zod + React Hook Form
 *   (ดูตัวอย่างใน components/students/add-new-student-dialog.tsx)
 *   - schema ใหม่ที่ src/lib/schemas/course-schema.ts (แทน course-validation.ts)
 *   - ผู้สอนเป็น Array Fields (useFieldArray) — ชื่อ + อีเมล @cmu.ac.th, 1–3 คน
 *   - หลักสูตร (Select), ภาคการศึกษา (Radio Group), รายละเอียด (Textarea 0/100),
 *     รับข่าวสารทางอีเมล (Switch)
 */

const emptyCourseForm: DefaultValues<CourseFormValues> = {
  courseId: "",
  courseTitle: "",
  instructors: [{ name: "", email: "" }],
  program: undefined,
  semester: undefined,
  description: undefined,
  notifyByEmail: undefined,
};

const programOptions = [
  { value: "CPE", label: "CPE — วิศวกรรมคอมพิวเตอร์" },
  { value: "ISNE", label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย" },
];

const semesterOptions = [
  { value: "1", label: "ภาคการศึกษาที่ 1" },
  { value: "2", label: "ภาคการศึกษาที่ 2" },
  { value: "3", label: "ภาคฤดูร้อน"},
];

export function AddNewCourseDialog() {
  const addCourse = useEnrollmentStore((s) => s.addCourse);
  const courses = useEnrollmentStore((s) => s.courses);
  const [open, setOpen] = useState(false);

  const schema = useMemo(() => createCourseFormSchema(courses), [courses]);

  // state ที่ต้องถือเองสามก้อน (Zod + React Hook Form จะรวมเป็น useForm ตัวเดียว)
  // const [values, setValues] = useState<CourseFormValues>(emptyCourseForm);
  // const [errors, setErrors] = useState<CourseFormErrors>({});
  // const [touched, setTouched] = useState<
  //   Partial<Record<keyof CourseFormValues, boolean>>
  // >({});
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyCourseForm,
    mode: "onBlur",
  })

  const { fields, append, remove } = useFieldArray<CourseFormValues, "instructors">({
    control: form.control,
    name: "instructors",
  });

  const emailsError =
    form.formState.errors.instructors?.root ?? form.formState.errors.instructors;

  // const [instructorInput, setInstructorInput] = useState("");
  // const instructorsAnchor = useComboboxAnchor();

  // const knownInstructors = [...new Set(courses.flatMap((c) => c.instructors))];
  // const typedInstructor = instructorInput.trim();
  // const isNewInstructor =
  //   typedInstructor.length > 0 &&
  //   !knownInstructors.some(
  //     (name) => name.toLowerCase() === typedInstructor.toLowerCase(),
  //   ) &&
  //   !values.instructors.includes(typedInstructor);
  // const instructorItems = [
  //   ...knownInstructors,
  //   ...values.instructors.filter((name) => !knownInstructors.includes(name)),
  //   ...(isNewInstructor ? [typedInstructor] : []),
  // ];

  // const checkField = (name: keyof CourseFormValues, next: CourseFormValues) => {
  //   setErrors((prev) => ({
  //     ...prev,
  //     [name]: validateCourseField(name, next, courses),
  //   }));
  // };

  // const handleChange = <K extends keyof CourseFormValues>(
  //   name: K,
  //   value: CourseFormValues[K],
  // ) => {
  //   const next = { ...values, [name]: value };
  //   setValues(next);
  //   // ช่องที่เคยออกไปแล้ว (touched) เช็กใหม่ทันทีตอนแก้ — error หายเมื่อแก้ถูก
  //   if (touched[name]) checkField(name, next);
  // };

  // // เทียบได้กับ mode: "onBlur" ของ React Hook Form
  // const handleBlur = (name: keyof CourseFormValues) => {
  //   setTouched((prev) => ({ ...prev, [name]: true }));
  //   checkField(name, values);
  // };

  // // ด่านตรวจก่อนเข้า store — เทียบได้กับ form.handleSubmit(onSubmit)
  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const nextErrors = validateCourseForm(values, courses);
  //   setErrors(nextErrors);
  //   setTouched({ courseId: true, courseTitle: true, instructors: true });
  //   if (Object.keys(nextErrors).length > 0) return; // ไม่ผ่าน → ไม่เรียก addCourse

  //   addCourse({
  //     courseId: values.courseId.trim(),
  //     courseTitle: values.courseTitle.trim(),
  //     instructors: values.instructors,
  //   });
  //   resetForm();
  //   setOpen(false);
  // };

  // // ต้องต่อ id / aria-* / ข้อความ error เองทุกช่อง (<FormItem/FormControl/FormMessage> จะทำแทน)
  // const errorOf = (name: keyof CourseFormValues) =>
  //   touched[name] ? errors[name] : undefined;

  // const invalidProps = (name: keyof CourseFormValues) => ({
  //   "aria-invalid": errorOf(name) ? true : undefined,
  //   "aria-describedby": errorOf(name) ? `${name}-error` : undefined,
  // });

  // const fieldError = (name: keyof CourseFormValues) => {
  //   const message = errorOf(name);
  //   return message ? (
  //     <p id={`${name}-error`} className="text-sm text-destructive">
  //       {message}
  //     </p>
  //   ) : null;
  // };

  const resetForm = () => form.reset(emptyCourseForm);

  function onSubmit(values: CourseFormValues) {
    addCourse(values)
      // addCourse({
      //   ...values,
      //   instructors: values.instructors.map((instructor) => ({
      //     ...instructor,
      //     email: instructor.email.map((entry) => entry.email).join(", "),
      //   })),
      // });
      resetForm();
      setOpen(false);
    }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              กรอกรหัสวิชา ชื่อวิชา และผู้สอน
            </DialogDescription>
          </DialogHeader>
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-[10rem_1fr] gap-4">
                <div className="flex w-full">
                  <Controller
                    name="courseId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="courseId">รหัสวิชา</FieldLabel>
                        <Input
                          {...field}
                          id="courseId"
                          placeholder="เช่น 261305"
                          inputMode="numeric"
                          className="border border-input bg-background text-foreground"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name="courseTitle"
                    control={form.control}
                    render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="lastName">ชื่อวิชา</FieldLabel>
                      <Input
                        {...field}
                        id="courseTitle"
                        placeholder="เช่น Mobile Application Development"
                        className="border border-input bg-background text-foreground"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                    )}
                  />
                </div>
              </div>

              <div>
                <Controller
                  name="program"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="program">หลักสูตร</FieldLabel>
                      <Select
                        name={field.name}
                        items={programOptions}
                        value={field.value ?? null}
                        onValueChange={(v) => {
                          field.onChange(v);
                          field.onBlur(); 
                        }}
                        >
                        <SelectTrigger
                          id="program"
                          className="w-full border border-input bg-background text-primary"
                          aria-invalid={fieldState.invalid}
                          ref={field.ref}
                        >
                          <SelectValue placeholder="เลือกหลักสูตร" />
                        </SelectTrigger>
                        <SelectContent>
                          {programOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div>
                <Controller
                  name="semester"
                  control={form.control}
                  render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="semester">ภาคการศึกษา</FieldLabel>
                    <RadioGroup 
                      value={field.value} 
                      onValueChange={field.onChange}
                      className="flex flex-row flex-wrap gap-4"
                    >
                      {semesterOptions.map((s) => (
                        <div key={s.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={s.value} id={`semester-${s.value}-label`} />
                          <Label htmlFor={`semester-${s.value}`}>{s.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                  )}
                />
              </div>

              <div>
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">รายละเอียด (ไม่บังคับ)</FieldLabel>
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="คำอธิบายรายวิชาสั้น ๆ"
                      // className="flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground"
                      className="min-h-16 w-full rounded-lg border border-input px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription  
                      data-invalid={fieldState.invalid}
                      className={
                        (field.value?.length || 0) >= 100 
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {field.value?.length||0}/100 ตัวอักษร
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                  )}
                />
              </div>

              <div>
                 <FieldSet >
                    <FieldLegend variant="label">ผู้สอน</FieldLegend>
                    <FieldDescription>
                      {fields.length}/{MAX_INSTRUCTORS} คน — กรอกชื่อผู้สอน และอีเมล name@cmu.ac.th (ห้ามซ้ำกัน)
                    </FieldDescription>
      
                    <FieldGroup className="gap-3">
                      {fields.map((item, index) => (
                        <div key={item.id} className="flex items-start gap-2">
                          <span className="mt-1.5 w-5 shrink-0 text-sm text-muted-foreground">
                            {index + 1}.
                          </span>
                          <div className="grid flex-1 gap-2 sm:grid-cols-2">
                            <Controller
                              name={`instructors.${index}.name`}
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="flex-1">
                                  <FieldContent>
                                      <Input
                                        {...field}
                                        id={`name-${index}`}
                                        placeholder="กรอกชื่อผู้สอน"
                                        aria-label={`ผู้สอนที่ ${index + 1}`}
                                        aria-invalid={fieldState.invalid}
                                      />
                                    {fieldState.invalid && (
                                      <FieldError errors={[fieldState.error]} />
                                    )}
                                  </FieldContent>
                                </Field>
                              )}
                            />

                            <Controller
                              name={`instructors.${index}.email`}
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="flex-1">
                                  <FieldContent>
                                      <Input
                                        {...field}
                                        id={`email-${index}`}
                                        type="email"
                                        placeholder="ต้องเป็นอีเมล @cmu.ac.th"
                                        aria-label={`อีเมลที่ ${index + 1}`}
                                        aria-invalid={fieldState.invalid}
                                      />
                                    {fieldState.invalid && (
                                      <FieldError errors={[fieldState.error]} />
                                    )}
                                  </FieldContent>
                                </Field>
                              )}
                            />
                          </div>
                          {/* ─── remove(index) ─── */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`ลบอีเมลที่ ${index + 1}`}
                            disabled={fields.length <= 1}
                            onClick={() => remove(index)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </FieldGroup>
      
                    {/* ─── Array Validation: error ระดับ array ─── */}
                    {emailsError?.message && <FieldError errors={[emailsError]} />}
      
                    {/* ─── append({...}) ─── */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      disabled={fields.length >= MAX_INSTRUCTORS}
                      onClick={() => append({ name: "", email: "" })}
                    >
                      <Plus className="size-4" />
                      เพิ่มอีเมล
                    </Button>
                  </FieldSet>
                {/* <Controller
                  name="instructors"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="instructors">ผู้สอน</FieldLabel>
                      <FieldDescription>{field.value?.length||1}/3 คน — กรอกชื่อผู้สอน และอีเมล name@cmu.ac.th (ห้ามซ้ำกัน)</FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                /> */}
              </div>

              <div>
                <Controller
                  name="notifyByEmail"
                  control={form.control}
                  render={({ field, fieldState }) => (    
                    <Field data-invalid={fieldState.invalid}>
                      <FieldGroup>
                        <FieldContent className="flex flex-row w-full gap-2 justify-between rounded-lg border p-3">
                          <div className="flex flex-col gap-0.5">
                            <FieldLabel htmlFor="notifyByEmail">รับข่าวสารทางอีเมล</FieldLabel>
                            <FieldDescription>แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน</FieldDescription>
                          </div>
                          <span>
                            <Switch
                              id="notifyByEmail"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </span>
                        </FieldContent>
                      </FieldGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
            

          {/* <div className="grid gap-1.5">
            <Label htmlFor="courseTitle">ชื่อวิชา</Label>
            <Input
              id="courseTitle"
              placeholder="เช่น Mobile Application Development"
              value={values.courseTitle}
              onChange={(e) => handleChange("courseTitle", e.target.value)}
              onBlur={() => handleBlur("courseTitle")}
              {...invalidProps("courseTitle")}
            />
            {fieldError("courseTitle")}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="instructors">ผู้สอน</Label>
            <Combobox
              multiple
              autoHighlight
              items={instructorItems}
              value={values.instructors}
              onValueChange={(v) => {
                handleChange("instructors", v as string[]);
                setInstructorInput("");
              }}
              inputValue={instructorInput}
              onInputValueChange={setInstructorInput}
            >
              <ComboboxChips ref={instructorsAnchor} className="w-full">
                <ComboboxValue>
                  {(selected: string[]) => (
                    <Fragment>
                      {selected.map((name) => (
                        <ComboboxChip key={name}>{name}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        id="instructors"
                        placeholder={
                          selected.length === 0
                            ? "เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                            : ""
                        }
                        onBlur={() => handleBlur("instructors")}
                        {...invalidProps("instructors")}
                      />
                    </Fragment>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={instructorsAnchor}>
                <ComboboxEmpty>พิมพ์ชื่อเพื่อเพิ่มผู้สอนใหม่</ComboboxEmpty>
                <ComboboxList>
                  {(name: string) => (
                    <ComboboxItem key={name} value={name}>
                      {name === typedInstructor && isNewInstructor
                        ? `+ เพิ่มผู้สอน "${name}"`
                        : name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {fieldError("instructors")}
          </div> */}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4" />
              ล้างฟอร์ม
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
