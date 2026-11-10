const SUPABASE_URL = "https://ma-du-an-cua-ban.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_khoa-cua-ban";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authHint = document.getElementById("authHint");
const authMessage = document.getElementById("authMessage");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const confirmWrap = document.getElementById("confirmWrap");
const confirmInput = document.getElementById("confirmInput");
const submitBtn = document.getElementById("submitBtn");
const modeBtn = document.getElementById("modeBtn");
const accountBox = document.getElementById("accountBox");
const accountEmail = document.getElementById("accountEmail");
const logoutBtn = document.getElementById("logoutBtn");

let isSignUpMode = false;

function setMode(signUpMode) {
  isSignUpMode = signUpMode;

  authTitle.textContent = isSignUpMode ? "TẠO TÀI KHOẢN" : "ĐĂNG NHẬP";
  authHint.textContent = isSignUpMode
    ? "Tạo tài khoản Captain Gunpla bằng email của bạn."
    : "Đăng nhập để tiếp tục.";

  submitBtn.textContent = isSignUpMode ? "ĐĂNG KÝ" : "ĐĂNG NHẬP";
  confirmWrap.hidden = !isSignUpMode;
  confirmInput.required = isSignUpMode;
  confirmInput.value = "";
  passwordInput.autocomplete = isSignUpMode
    ? "new-password"
    : "current-password";

  modeBtn.textContent = isSignUpMode
    ? "Đã có tài khoản? Đăng nhập"
    : "Chưa có tài khoản? Đăng ký";

  authMessage.textContent = "";
}

function showSession(session) {
  const user = session?.user;

  authForm.hidden = Boolean(user);
  modeBtn.hidden = Boolean(user);
  accountBox.hidden = !user;

  if (user) {
    authTitle.textContent = "TÀI KHOẢN";
    authHint.textContent = "Bạn đã đăng nhập.";
    accountEmail.textContent = user.email || "";
  } else {
    setMode(isSignUpMode);
  }
}

modeBtn.addEventListener("click", () => {
  setMode(!isSignUpMode);
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authMessage.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (isSignUpMode && password !== confirmInput.value) {
    authMessage.textContent = "Hai mật khẩu chưa khớp.";
    return;
  }

  submitBtn.disabled = true;

  try {
    if (isSignUpMode) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + window.location.pathname
        }
      });

      if (error) throw error;

      if (data.session) {
        authMessage.textContent = "Tạo tài khoản thành công.";
      } else {
        authMessage.textContent =
          "Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.";
      }
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      authMessage.textContent = "Đăng nhập thành công.";
    }
  } catch (error) {
    authMessage.textContent = error.message || "Có lỗi xảy ra. Hãy thử lại.";
  } finally {
    submitBtn.disabled = false;
  }
});

logoutBtn.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  authMessage.textContent = "Bạn đã đăng xuất.";
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
  showSession(session);
});

supabaseClient.auth.getSession().then(({ data, error }) => {
  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  showSession(data.session);
});
