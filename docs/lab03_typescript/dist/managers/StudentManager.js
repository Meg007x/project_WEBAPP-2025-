export class StudentManager {
    constructor() {
        this.students = [];
    }
    addStudent(student) {
        this.students.push(student);
        this.saveToLocalStorage();
    }
    getAllStudents() {
        return this.students;
    }
    findStudentByID(id) {
        return this.students.find(s => s.id === id);
    }
    findStudentsByName(keyword) {
        const key = keyword.toLowerCase();
        return this.students.filter(s => s.title_name.toLowerCase().includes(key) ||
            s.first_name.toLowerCase().includes(key) ||
            s.last_name.toLowerCase().includes(key));
    }
    findStudentByEmail(email) {
        return this.students.find(s => s.email.toLowerCase() === email.toLowerCase());
    }
    findStudentsByMajor(major) {
        return this.students.filter(s => s.major.toLowerCase().includes(major.toLowerCase()));
    }
    saveToLocalStorage() {
        localStorage.setItem("students", JSON.stringify(this.students));
    }
    loadFromLocalStorage() {
        const data = localStorage.getItem("students");
        if (data) {
            this.students = JSON.parse(data);
        }
    }
}
