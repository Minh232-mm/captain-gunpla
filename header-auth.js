
const HEADER_SUPABASE_URL = "https://cskfurtcvqomyvitcfua.supabase.co";
const HEADER_SUPABASE_KEY = "sb_publishable_6vkQOLH_jEQq_oPhz9aN8Q_6qLj8RYa";

// Dùng chung Supabase client trên toàn website
const headerSupabase =
  window.CAPTAIN_SUPABASE_CLIENT ||
  window.supabase.createClient(
    HEADER_SUPABASE_URL,
    HEADER_SUPABASE_KEY
  );

window.CAPTAIN_SUPABASE_CLIENT = headerSupabase;

const headerLogin = document.getElementById("headerLogin");
const headerUser = document.getElementById("headerUser");
const headerUserButton = document.getElementById("headerUserButton");
const headerUserName = document.getElementById("headerUserName");
const headerUserEmail = document.getElementById("headerUserEmail");
const headerUserMenu = document.getElementById("headerUserMenu");
const headerSignOut = document.getElementById("headerSignOut");

function showHeaderUser(user) {
  if (!headerLogin || !headerUser) return;

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

  if (headerUserName) headerUserName.textContent = displayName;
  if (headerUserEmail) headerUserEmail.textContent = user.email || "";

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
  if (!headerUserMenu) return;

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

  if (headerUserMenu) headerUserMenu.hidden = true;

  showHeaderUser(null);
  window.location.reload();
});

headerSupabase.auth.onAuthStateChange((_event, session) => {
  showHeaderUser(session?.user || null);
});

updateHeaderAuth();
