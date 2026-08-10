import { SignUpForm } from "../../components/SignUpForm";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-black">Join The Yard</h2>
        <p className="mt-2 text-sm font-semibold text-black/70">
          Sign up for show updates, news, and release info.
        </p>
      </div>

      <div className="rounded-3xl border border-black/20 bg-yellow-300/25 p-6 shadow-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
