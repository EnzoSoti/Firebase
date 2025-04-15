import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
        import {
            getDatabase,
            ref,
            set,
            get,
            child,
            update,
            remove,
            onValue
        } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyCFORcmk4E7fS7NHJk17L4_1wzEshOH4e0",
            authDomain: "fire9db-90459.firebaseapp.com",
            projectId: "fire9db-90459",
            storageBucket: "fire9db-90459.firebasestorage.app",
            messagingSenderId: "54133688215",
            appId: "1:54133688215:web:820ddb8799f861219326d2"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase();

        const namebox = document.getElementById("Namebox");
        const rollbox = document.getElementById("Rollbox");
        const secbox = document.getElementById("Secbox");
        const genbox = document.getElementById("Genbox");

        const insBtn = document.getElementById("Insbtn");
        const selBtn = document.getElementById("Selbtn");
        const updBtn = document.getElementById("Updbtn");
        const delBtn = document.getElementById("Delbtn");

        // Function to show toast notifications
        function showToast(message, type = 'success') {
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                style: {
                    background: type === 'success' ? "#059669" : "#dc2626",
                },
                close: true,
            }).showToast();
        }

        // Function to show confirmation toast
        function showConfirmationToast(message, onConfirm) {
            let toastElement;
            
            const confirmToast = Toastify({
                text: `
                    <div class="flex items-center justify-between w-full">
                        <span>${message}</span>
                        <div class="ml-4">
                            <button class="px-2 py-1 bg-emerald-600 text-white rounded mr-2 confirm-btn">Yes</button>
                            <button class="px-2 py-1 bg-rose-600 text-white rounded cancel-btn">No</button>
                        </div>
                    </div>
                `,
                duration: -1,
                gravity: "top",
                position: "center",
                close: false,
                escapeMarkup: false,
                style: {
                    background: "#1f2937",
                    minWidth: "300px",
                },
                onClick: function(e) {
                    if (e.target.classList.contains('confirm-btn')) {
                        onConfirm();
                        toastElement.hideToast();
                    } else if (e.target.classList.contains('cancel-btn')) {
                        toastElement.hideToast();
                    }
                }
            });
            
            toastElement = confirmToast.showToast();
        }

        function isValidInput() {
            if (!namebox.value.trim() || !rollbox.value.trim() || !secbox.value.trim()) {
                showToast("Please fill all fields", "error");
                return false;
            }
            return true;
        }

        function insertData() {
            if (!isValidInput()) return;

            set(ref(db, "TheStudents/" + rollbox.value), {
                NameOfStd: namebox.value,
                RollNo: rollbox.value,
                Section: secbox.value,
                Gender: genbox.value
            })
            .then(() => {
                showToast("Student data added successfully!");
                clearInputs();
            })
            .catch((error) => {
                showToast(error.message, "error");
            });
        }

        function selectData() {
            if (!rollbox.value.trim()) {
                showToast("Please enter a Roll No to search", "error");
                return;
            }

            const dbref = ref(db);
            get(child(dbref, "TheStudents/" + rollbox.value))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    namebox.value = snapshot.val().NameOfStd;
                    secbox.value = snapshot.val().Section;
                    genbox.value = snapshot.val().Gender;
                    showToast("Data retrieved successfully!");
                } else {
                    showToast("No data found", "error");
                    clearInputs();
                }
            })
            .catch((error) => {
                showToast(error.message, "error");
            });
        }

        function updateData() {
            if (!isValidInput()) return;

            update(ref(db, "TheStudents/" + rollbox.value), {
                NameOfStd: namebox.value,
                Section: secbox.value,
                Gender: genbox.value
            })
            .then(() => {
                showToast("Student data updated successfully!");
                clearInputs();
            })
            .catch((error) => {
                showToast(error.message, "error");
            });
        }

        function deleteData() {
            if (!rollbox.value.trim()) {
                showToast("Please enter a Roll No to delete", "error");
                return;
            }

            showConfirmationToast("Are you sure you want to delete this record?", () => {
                remove(ref(db, "TheStudents/" + rollbox.value))
                .then(() => {
                    showToast("Student data deleted successfully!");
                    clearInputs();
                })
                .catch((error) => {
                    showToast(error.message, "error");
                });
            });
        }

        function clearInputs() {
            namebox.value = "";
            rollbox.value = "";
            secbox.value = "";
            genbox.value = "Male";
        }

        function setupRealtimeStudents() {
            const tableBody = document.getElementById("studentTableBody");
            const studentsRef = ref(db, "TheStudents/");

            onValue(studentsRef, (snapshot) => {
                tableBody.innerHTML = "";
                
                if (snapshot.exists()) {
                    const students = [];
                    
                    snapshot.forEach((childSnapshot) => {
                        students.push(childSnapshot.val());
                    });
                    
                    students.sort((a, b) => a.RollNo.localeCompare(b.RollNo));
                    
                    students.forEach((student) => {
                        const row = document.createElement("tr");
                        row.className = "hover:bg-zinc-800/30 transition-colors";
                        
                        row.innerHTML = `
                            <td class="px-4 py-3 text-zinc-100">${student.NameOfStd}</td>
                            <td class="px-4 py-3 text-zinc-100">${student.RollNo}</td>
                            <td class="px-4 py-3 text-zinc-100">${student.Section}</td>
                            <td class="px-4 py-3 text-zinc-100">${student.Gender}</td>
                        `;
                        
                        tableBody.appendChild(row);
                    });
                } else {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="px-4 py-3 text-center text-zinc-500">
                                No records found
                            </td>
                        </tr>
                    `;
                }
            }, (error) => {
                showToast(error.message, "error");
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="px-4 py-3 text-center text-rose-400">
                            Error loading data: ${error.message}
                        </td>
                    </tr>
                `;
            });
        }

        document.addEventListener("DOMContentLoaded", setupRealtimeStudents);

        insBtn.addEventListener('click', insertData);
        selBtn.addEventListener('click', selectData);
        updBtn.addEventListener('click', updateData);
        delBtn.addEventListener('click', deleteData);