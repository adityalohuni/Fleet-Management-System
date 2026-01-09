import { CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AuthLogo } from "./AuthLogo";

interface AuthHeaderProps {
  isLogin: boolean;
}

export function AuthHeader({ isLogin = true }: AuthHeaderProps) {
  return (
    <CardHeader className="space-y-10 pb-8 pt-14 px-12">
      <AuthLogo />
      
      <div className="text-center space-y-5">
        <CardTitle className="text-4xl font-semibold tracking-tight">
          Fleet Management
        </CardTitle>
        <CardDescription className="text-base font-medium px-6">
          {isLogin
            ? "Welcome back! Sign in to continue"
            : "Create your account to get started"}
        </CardDescription>
      </div>
    </CardHeader>
  );
}
