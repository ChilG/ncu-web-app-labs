# ระบบ Time-Travel CRUD (ย้อนเวลาข้อมูล)

แอปพลิเคชัน Full-stack ที่สาธิตสถาปัตยกรรมแบบ Time-Travel CRUD ซึ่งข้อมูลจะไม่ถูกเขียนทับหรือลบทิ้ง แต่ระบบจะเก็บประวัติการเปลี่ยนแปลงทั้งหมดไว้อย่างสมบูรณ์และไม่สามารถแก้ไขได้ (Immutable history) ทำให้ผู้ใช้สามารถดูการเปลี่ยนแปลงเมื่อเวลาผ่านไป และสามารถ "ย้อนกลับ" (Rollback) ไปยังสถานะก่อนหน้าได้

## สถาปัตยกรรมและเทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: Angular 17, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MySQL 8.0
- **Testing**: Mocha, Chai, Chai-HTTP
- **Containerization**: Docker, Docker Compose

## ฟีเจอร์หลัก (Features)

- **Create, Read, Update, Delete (CRUD)**: การทำงานพื้นฐานที่เพิ่มระบบเวลาเข้าไป
  - การอัปเดตข้อมูลจะสร้างเวอร์ชันใหม่ของข้อมูลแทนที่จะแก้ไขของเดิม
  - การลบข้อมูลจะเป็นแบบ "Soft delete" ซึ่งจะปิดการใช้งานไทม์ไลน์ของข้อมูลปัจจุบัน แต่ยังเก็บประวัติเดิมไว้
- **ฟีเจอร์ย้อนเวลา (Time-Travel Operations)**: 
  - เมื่อมีการอัปเดตข้อมูล ระบบจะเพิ่มข้อมูลเวอร์ชันใหม่และปิดสถานะของข้อมูลเก่า (Type 2 Slowly Changing Dimension)
  - สามารถดึงประวัติการแก้ไขทั้งหมดของแต่ละ Record ได้
  - สามารถค้นหาสถานะของข้อมูล ณ เวลา (Timestamp) ใด ๆ แบบเจาะจงได้
  - **การย้อนข้อมูล (Rollback)**: สามารถคัดลอกข้อมูลจากเวอร์ชันในอดีต และนำมาบันทึกต่อท้ายเป็นเวอร์ชันล่าสุดได้ โดยไม่ไปเปลี่ยนแปลงประวัติเดิมเลย

## การติดตั้งและการใช้งาน (Getting Started)

แอปพลิเคชันทั้งหมดถูกบรรจุอยู่ใน Container เพื่อให้ง่ายต่อการติดตั้งและใช้งาน

### สิ่งที่ต้องมีเบื้องต้น (Prerequisites)

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### วิธีรันแอปพลิเคชัน

1. Clone Repository นี้ และเข้าไปที่โฟลเดอร์ `Final Project`:
   ```bash
   cd "Final Project"
   ```

2. รันแอปพลิเคชันทั้งหมด (Database, Backend, Frontend) ด้วย Docker Compose:
   ```bash
   docker compose up -d --build
   ```

3. เข้าใช้งานแอปพลิเคชันได้ที่:
   - **Frontend UI**: [http://localhost:4200](http://localhost:4200)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)

### วิธีหยุดแอปพลิเคชัน

```bash
docker compose down
```

## การทดสอบระบบ (Running Tests)

Backend มีการเขียน Unit และ Integration Tests โดยใช้ Mocha และ Chai-HTTP เพื่อตรวจสอบความถูกต้องของระบบเวลาและฐานข้อมูล

วิธีรันเทสต์ในเครื่องของคุณ:

1. ตรวจสอบให้แน่ใจว่า Database Container กำลังรันอยู่บนพอร์ต `3306`
2. เข้าไปที่โฟลเดอร์ backend:
   ```bash
   cd backend
   ```
3. รันสคริปต์เทสต์:
   ```bash
   npm test
   ```

## โครงสร้าง API (API Structure)

Backend มี RESTful Endpoints ให้บริการอยู่ภายใต้ `/api/records`:

- `POST /`: สร้างข้อมูลใหม่ (Version 1)
- `GET /`: ดึงข้อมูลที่ยังใช้งานอยู่ (Active records) ทั้งหมด
- `GET /:record_id/history`: ดึงประวัติการเปลี่ยนแปลงทั้งหมดของ Record นั้น ๆ โดยเรียงตามลำดับเวลา
- `GET /:record_id/at-time?timestamp=YYYY-MM-DDTHH:MM:SSZ`: ค้นหาสถานะของ Record ณ เวลาที่ระบุ (Timestamp) 
- `PUT /:record_id`: อัปเดตข้อมูล (สร้างข้อมูลเวอร์ชันถัดไป)
- `DELETE /:record_id`: ลบข้อมูลแบบ Soft-delete (ปิดการใช้งานและทำเครื่องหมายว่าถูกลบ)
- `POST /:record_id/rollback/:version`: ดึงข้อมูลเวอร์ชันในอดีตมาสร้างเป็นข้อมูลเวอร์ชันล่าสุดที่ใช้งานอยู่
