import { Button } from "../ui/button";

interface AuthSubmitButtonProps {
  isLoading: boolean;
  isLogin: boolean;
}

export function AuthSubmitButton({ isLoading, isLogin }: AuthSubmitButtonProps) {
  return (
    <Button 
      className="w-full h-14 rounded-xl font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-10 disabled:opacity-70 disabled:cursor-not-allowed" 
      type="submit" 
      disabled={isLoading}
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
        </div>
      ) : (
        isLogin ? "Sign In" : "Create Account"
      )}
    </Button>
  );
}
