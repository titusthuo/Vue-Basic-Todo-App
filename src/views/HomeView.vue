<template>
  <div class="welcome" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <h1>Todo - List</h1>
    <div class="login-register-container">
      <!-- Registering form -->
      <template v-if="isRegistering">
        <input type="email" placeholder="Email" v-model="registerInformation.email" />
        <input type="email" placeholder="Confirm Email" v-model="registerInformation.confirmEmail" />
        <input type="password" placeholder="Password" v-model="registerInformation.password" />
        <input type="password" placeholder="Confirm Password" v-model="registerInformation.confirmPassword" />
        <button class="sign-in-register-button" @click="handleRegister">Register</button>
        <button class="create-account-button" @click="isRegistering = false">Have an account? Go back</button>
      </template>
      
      <!-- Signing in form -->
      <template v-else>
        <input type="email" placeholder="Email" v-model="email" />
        <input type="password" placeholder="Password" v-model="password" />
        <button class="sign-in-register-button" @click="handleSignIn">Sign In</button>
        <button class="create-account-button" @click="isRegistering = true">Create an account</button>
      </template>

      <!-- Reset password functionality -->
      <template v-if="resetPasswordMode">
        <template v-if="resetPasswordSent">
          <p style="font-size: 1.5em; font-weight: bold; color: red">Check your email to reset your password.</p>
          <input type="email" placeholder="Enter your email" v-model="resetEmail" />
          <input type="password" placeholder="Enter your new password" v-model="password" />
          <button class="sign-in-register-button" @click="handleSignInWithNewPassword">Sign In with New Password</button>
        </template>
        <template v-else>
          <input type="email" placeholder="Enter your email" v-model="resetEmail" />
          <button class="reset-password-button" :disabled="!resetEmail || isResettingPassword" @click="handleResetPassword">
            {{ isResettingPassword ? "Resetting..." : "Reset Password" }}
          </button>
        </template>
      </template>

      <template v-else>
        <button class="create-account-button" @click="resetPasswordMode = true">Forgot Password? Reset Your Password</button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase'; 
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import backgroundImage from '../assets/background1.jpg'; 

export default defineComponent({
  name: 'HomeView',
  setup() {
    const email = ref('');
    const password = ref('');
    const isRegistering = ref(false);
    const registerInformation = ref({
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: ''
    });
    const resetEmail = ref('');
    const resetPasswordSent = ref(false);
    const isResettingPassword = ref(false);
    const resetPasswordMode = ref(false);
    const router = useRouter();

    // Check if user is authenticated
    onMounted(() => {
      auth.onAuthStateChanged(user => {
        if (user) {
          router.push('/homepage');
        }
      });
    });

    const handleSignIn = () => {
      signInWithEmailAndPassword(auth, email.value, password.value)
        .then(() => {
          router.push('/homepage');
        })
        .catch(err => alert(err.message));
    };

    const handleRegister = () => {
      if (registerInformation.value.email !== registerInformation.value.confirmEmail) {
        alert('Please confirm that emails are the same');
        return;
      } else if (registerInformation.value.password !== registerInformation.value.confirmPassword) {
        alert('Please confirm that passwords are the same');
        return;
      }
      createUserWithEmailAndPassword(auth, registerInformation.value.email, registerInformation.value.password)
        .then(() => {
          router.push('/homepage');
        })
        .catch(err => alert(err.message));
    };

    const handleResetPassword = () => {
      isResettingPassword.value = true;
      sendPasswordResetEmail(auth, resetEmail.value)
        .then(() => {
          resetPasswordSent.value = true;
        })
        .catch(error => {
          console.error('Error sending reset password email:', error.message);
        })
        .finally(() => {
          isResettingPassword.value = false;
        });
    };

    const handleSignInWithNewPassword = () => {
      signInWithEmailAndPassword(auth, resetEmail.value, password.value)
        .then(() => {
          router.push('/homepage');
        })
        .catch(err => alert(err.message));
    };

    return {
      email,
      password,
      isRegistering,
      registerInformation,
      resetEmail,
      resetPasswordSent,
      isResettingPassword,
      resetPasswordMode,
      handleSignIn,
      handleRegister,
      handleResetPassword,
      handleSignInWithNewPassword,
      backgroundImage
    };
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap");

.welcome {
    height: 100vh;
    width: 100vw;
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
    background-color: #282c34; 
}

.welcome > h1 {
    font-family: "Roboto", sans-serif; 
    font-weight: bold;
    font-size: 120px;
    position: absolute;
    top: 5px;
    left: 18.5%;
    transform: translateX(-50%);
    color: #ffcc00;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); 
}

.login-register-container {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 30px 40px;
    left: 55%;
    top: 55%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px; 
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

.login-register-container > input {
    height: 40px;
    width: 85%; 
    border: 2px solid #4CAF50; 
    outline: none;
    margin-bottom: 15px;
    font-size: 20px; 
    padding: 10px; 
    border-radius: 5px; 
}

.login-register-container > button {
    padding: 10px 25px;
    border: none;
    margin-bottom: 5px;
    cursor: pointer;
    transition: transform 0.2s;
}

.sign-in-register-button {
    background: linear-gradient(135deg, #0077ff 0%, #00bfff 100%);
    font-size: 22px;
    margin-top: 10px;
    font-family: "Roboto", sans-serif;
    font-weight: bold;
    color: white;
    border-radius: 5px;
}

.create-account-button {
    background: linear-gradient(135deg, #ff0080 0%, #ff6f00 100%);
    font-size: 22px;
    margin-top: 10px;
    font-family: "Roboto", sans-serif; 
    font-weight: bold; 
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px; 
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8); 
}

.reset-password-button {
    background-color: #ff4081; 
    color: white;
    font-size: 18px; 
    font-weight: bold;
    padding: 12px 25px; 
    border: none;
    border-radius: 5px; 
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s; 
}

.reset-password-button:hover {
    background-color: #c51162; 
    transform: scale(1.05); 
}

@media screen and (max-width: 768px) {
    .login-register-container {
        padding: 15px; 
    }
    .login-register-container > input {
        width: 100%; 
        font-size: 18px; 
    }
    .create-account-button {
        font-size: 18px; 
    }
    .reset-password-button {
        font-size: 16px; 
    }
    .welcome > h1 {
        font-size: 70px; 
    }
}
</style>

