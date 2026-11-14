
const HEADER_SUPABASE_URL = "https://cskfurtcvqomyvitcfua.supabase.co";
const HEADER_SUPABASE_KEY = "sb_publishable_6vkQOLH_jEQq_oPhz9aN8Q_6qLj8RYa";

const headerSupabase = window.supabase.createClient(
  HEADER_SUPABASE_URL,
  HEADER_SUPABASE_KEY
);

const headerLogin = document.getElementById("headerLogin");
const headerUser = document.getElementById("headerUser");
const headerUserButton = document.getElementById("headerUserButton");
const headerUserName = document.getElementById("headerUserName");
const headerUserEmail = document.getElementById("headerUserEmail");
const headerUserMenu = document.getElementById("headerUserMenu");
const headerSignOut = document.getElementById("headerSignOut");

function showHeaderUser(user) {
  if (!user) {
    headerLogin.hidden = false;
    headerUser.hidden = true;
    return;
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.username ||
    user.email?.split("@")[0] ||
    "TÀI KHOẢN";

  headerUserName.textContent = displayName;
  headerUserEmail.textContent = user.email || "";

  headerLogin.hidden = true;
  headerUser.hidden = false;
}

async function updateHeaderAuth() {
  const { data, error } = await headerSupabase.auth.getUser();

  if (!error) {
    showHeaderUser(data.user);
  }
}

headerUserButton?.addEventListener("click", () => {
  headerUserMenu.hidden = !headerUserMenu.hidden;
  headerUserButton.setAttribute(
    "aria-expanded",
    String(!headerUserMenu.hidden)
  );
});

headerSignOut?.addEventListener("click", async () => {
  const { error } = await headerSupabase.auth.signOut();

  if (error) {
    alert("Đăng xuất chưa thành công. Vui lòng thử lại.");
    return;
  }

  headerUserMenu.hidden = true;
  showHeaderUser(null);
  window.location.reload();
});

headerSupabase.auth.onAuthStateChange((_event, session) => {
  showHeaderUser(session?.user || null);
});

updateHeaderAuth();
