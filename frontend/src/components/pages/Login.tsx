import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function Login() {
  const { login, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Driver");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, role });
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{isLogin ? "Login" : "Sign Up"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your email below to login to your account."
              : "Create an account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Driver">Driver</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Mechanic">Mechanic</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading
                ? (isLogin ? "Signing in..." : "Signing up...")
                : (isLogin ? "Sign in" : "Sign up")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
