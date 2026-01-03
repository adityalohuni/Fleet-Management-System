import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent } from "../ui/card";
import { toast, formatApiError } from "../../lib/toast";
import { AuthBackground } from "../auth/AuthBackground";
import { ThemeToggleButton } from "../auth/ThemeToggleButton";
import { AuthHeader } from "../auth/AuthHeader";
import { EmailInput } from "../auth/EmailInput";
import { PasswordInput } from "../auth/PasswordInput";
import { RoleSelect } from "../auth/RoleSelect";
import { AuthSubmitButton } from "../auth/AuthSubmitButton";
import { AuthToggle } from "../auth/AuthToggle";
import { AuthFooter } from "../auth/AuthFooter";

export function Login() {
  const { login, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Driver");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check system preference or localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemPreference;
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(isLogin ? "Signing in..." : "Creating account...");
    
    try {
      if (isLogin) {
        await login({ email, password });
        toast.update(toastId, 'success', "Welcome back!");
      } else {
        await register({ email, password, role });
        toast.update(toastId, 'success', "Account created successfully!");
      }
    } catch (err: any) {
      const errorMessage = formatApiError(err, isLogin ? "Login failed" : "Registration failed");
      toast.update(toastId, 'error', errorMessage);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-background transition-colors duration-300">
      <AuthBackground />
      
      <ThemeToggleButton theme={theme} onToggle={toggleTheme} />

      {/* Main Content - Perfectly Centered */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          <Card className="w-full glass relative z-10 p-3 sm:p-4" style={{ boxShadow: 'var(--shadow-xl)' }}>
            <AuthHeader isLogin={isLogin} />

            <CardContent className="space-y-10 px-12 pb-14">
              <form onSubmit={handleSubmit} className="space-y-6">
                <EmailInput value={email} onChange={setEmail} />
                
                <PasswordInput value={password} onChange={setPassword} />

                {!isLogin && <RoleSelect value={role} onChange={setRole} />}

                <AuthSubmitButton isLoading={isLoading} isLogin={isLogin} />
              </form>

              <AuthToggle isLogin={isLogin} onToggle={handleToggleMode} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-auto pb-6 px-4 sm:px-6">
        <AuthFooter />
      </div>
    </div>
  );
}
