interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

export function AuthToggle({ isLogin = true, onToggle }: AuthToggleProps) {
  return (
    <div className="text-center pt-10 mt-4 border-t border-border">
      <p className="text-sm leading-relaxed">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button
          type="button"
          onClick={onToggle}
          className="ml-2 font-bold text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          {isLogin ? "Sign Up" : "Sign In"}
        </button>
      </p>
    </div>
  );
}
