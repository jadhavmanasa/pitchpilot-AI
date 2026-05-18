import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock, LogIn, Mail, User, UserPlus, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loginUser, signUpUser } = useAuth();
  const isSignUp = location.pathname === "/signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      if (isSignUp) {
        signUpUser(name, email, password);
      } else {
        loginUser(email, password);
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div className="app-bg min-h-screen px-5 py-8 text-slate-950">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition-colors hover:text-slate-950">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>

      <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-6xl items-center gap-10 py-10 md:grid-cols-[0.95fr_1.05fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold tracking-tight">PitchPilot</p>
              <p className="eyebrow">Founder workspace</p>
            </div>
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-tight tracking-tight">
            {isSignUp ? "Create your pitch command center." : "Welcome back to your pitch command center."}
          </h1>
          <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
            Demo accounts are stored locally in your browser. Sign up, generate decks, review scores, and export presentations.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["AI slides", "Scripts", "Exports"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm font-bold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-teal-700" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="panel p-6 md:p-8">
          <div className="mb-8">
            <p className="eyebrow">{isSignUp ? "New workspace" : "Secure access"}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950">
              {isSignUp ? "Create account" : "Log in"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400 focus:border-teal-300"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400 focus:border-teal-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400 focus:border-teal-300"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {error}
              </div>
            )}

            <button type="submit" className="glow-btn w-full">
              {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {isSignUp ? "Create account" : "Log in"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm font-medium text-slate-500">
              {isSignUp ? "Already have an account?" : "New to PitchPilot AI?"}{" "}
              <Link to={isSignUp ? "/login" : "/signup"} className="font-extrabold text-teal-700 hover:text-teal-900">
                {isSignUp ? "Log in" : "Create one"}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
