<template>
    <div class="container d-flex justify-content-center align-items-center homepage" :style="{ backgroundImage: `url(${backgroundImage})` }">
      <div class="card mt-3 col-6">
        <div class="card-body">
          <div class="mt-3 mt-sm-5">
            <div
              class="card item-card mt-2"
              v-for="(task, index) in tasks"
              :key="index"
            >
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="task.isDone"
                  />
                  <div>
                    <p class="fw-semibold">{{ task.description }}</p>
                  </div>
                  <div>
                    <svg class="delete-button" @click="deleteTask(index)">
                      <path :d="mdiDelete" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <hr />
          </div>

          <h1 class="text-center mt-5">To-Do List</h1>
          <input 
            class="add-edit-input" 
            type="text" 
            placeholder="Add todo..." 
            v-model="todo" 
          />
          <svg class="add-confirm-icon" @click="writeToDatabase">
            <path :d="mdiPlus" fill="#000" />
          </svg>

          <div v-for="(todoItem, index) in todos" :key="index" class="todo">
            <h1>{{ todoItem.todo }}</h1>
            <svg class="edit-button" @click="handleUpdate(todoItem)">
              <path :d="mdiPencil" />
            </svg>
            <svg class="delete-button" @click="handleDelete(todoItem.uidd)">
              <path :d="mdiDelete" />
            </svg>
          </div>

          <div v-if="isEdit">
            <svg class="add-confirm-icon" @click="handleEditConfirm">
              <path :d="mdiCheck" />
            </svg>
          </div>

          <svg class="logout-icon" @click="handleSignOut">
            <path :d="mdiLogout" />
          </svg>
        </div>
      </div>
    </div>
</template>
  
<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { uid } from 'uid';
import { set, ref as dbRef, onValue, remove, update } from 'firebase/database';
import { mdiPencil, mdiDelete, mdiPlus, mdiCheck, mdiLogout } from '@mdi/js';
import backgroundImage from '../assets/background2.jpg';

export default defineComponent({
  name: 'HomePage',
  setup() {
    const newTask = ref("");
    const tasks = ref([
      { description: "Review pending activities", isDone: false },
      { description: "Attend daily meetings", isDone: false },
    ]);
    
    const todo = ref('');
    const todos = ref<Array<{ todo: string, uidd: string }>>([]);
    const isEdit = ref(false);
    const tempUidd = ref('');
    const router = useRouter();

    const addTask = () => {
      if (!newTask.value) return;
      tasks.value.unshift({
        description: newTask.value,
        isDone: false,
      });
      localStorage.setItem("tasks", JSON.stringify(tasks.value));
      newTask.value = "";
    };

    const deleteTask = (index) => {
      tasks.value.splice(index, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks.value));
    };

    const deleteAllTasks = () => {
      tasks.value = [];
      localStorage.removeItem("tasks");
    };

    const pendingTasks = computed(() => {
      return tasks.value.filter((x) => x.isDone === false).length;
    });

    watch(
      tasks,
      () => {
        if (tasks.value.length > 4) {
          alert('You have reached the maximum number of possible tasks (5)');
        }
      },
      { deep: true }
    );

    onMounted(() => {
      if (localStorage.tasks) {
        tasks.value = JSON.parse(localStorage.getItem("tasks")) || [];
      }
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userTodosRef = dbRef(db, `/${auth.currentUser?.uid}`);
          onValue(userTodosRef, (snapshot) => {
            const data = snapshot.val();
            todos.value = data ? Object.values(data) : [];
          });
        } else {
          router.push('/');
        }
      });
    });

    const writeToDatabase = () => {
      if (todo.value.trim() === "") return; // Prevent empty todos
      const uidd = uid();
      const userRef = dbRef(db, `/${auth.currentUser?.uid}/${uidd}`);
      set(userRef, { todo: todo.value, uidd });
      todo.value = '';
    };

    const handleUpdate = (todoItem) => {
  isEdit.value = true;
  todo.value = todoItem.todo; // Set the input to the current todo
  tempUidd.value = todoItem.uidd; // Save the unique ID of the item to be updated
};

const handleEditConfirm = async () => {
  try {
    await update(dbRef(db, `/${auth.currentUser.uid}/${tempUidd.value}`), {
      todo: todo.value, // Updated todo value
      uidd: tempUidd.value // Keep the unique ID consistent
    });
    
    // Reset input field and editing state
    todo.value = '';
    isEdit.value = false; 
  } catch (error) {
    console.error("Error updating todo:", error);
  }
};


    const handleDelete = (uid) => {
      const userRef = dbRef(db, `/${auth.currentUser?.uid}/${uid}`);
      remove(userRef);
    };

    const handleSignOut = () => {
      signOut(auth)
        .then(() => {
          router.push('/');
        })
        .catch((error) => {
          alert(error.message);
        });
    };

    return {
      newTask,
      tasks,
      addTask,
      deleteTask,
      deleteAllTasks,
      pendingTasks,
      todo,
      todos,
      isEdit,
      handleUpdate,
      handleEditConfirm,
      writeToDatabase,
      handleDelete,
      handleSignOut,
      backgroundImage,
      mdiPencil,
      mdiDelete,
      mdiPlus,
      mdiCheck,
      mdiLogout,
    };
  },
});
</script>

  
  <style scoped>
  .homepage {
    height: 100vh;
    width: 100vw;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
  }
  
  .card-body h1 {
    color: #141414c1;
  }
  
  .add-edit-input {
    position: absolute;
    top: 20px;
    outline: none;
    border: none;
    height: 30px;
    font-size: 25px;
    padding: 5px 20px;
  }
  
  .add-confirm-icon {
    position: absolute;
    transform: scale(2);
    top: 27px;
    right: 750px;
    cursor: pointer;
    font-size: 24px;
    width: 30px;
    margin-left: 10px;
    fill: #000;
  }
  
  .todo {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    margin-bottom: 10px;
    background-color: #1fdb22;
    padding: 2px 10px;
    border-radius: 10px;
    height: 30px;
    

  }
  
  .todo > h1 {
    width: 500px;
    background-color: rgb(211, 211, 211);
    padding: 5px 10px;
    font-size: 16px;
    color: #333;
    margin: 0 10px;
    flex: 1;
  }

  .todo svg {
    width: 20px;                   /* Set a fixed width for icons */
    height: 20px;                  /* Set a fixed height for icons */
    cursor: pointer;               /* Change cursor on hover */
}
  
  .edit-button,
  .delete-button {
    cursor: pointer;
    padding: 8px 16px;
    font-size: 16px;
  }
  
  .message {
    color: red;
    margin-top: 10px;
  }
  
  .logout-icon {
    cursor: pointer;
    position: absolute;
    top: 10px;
    right: 10px;
  }
  </style>
  