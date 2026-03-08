import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { verifyOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { email, method } = (location.state as { email: string; method: string }) || {};

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No session found. Please login first.</p>
          <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otp, method);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-accent mb-6">
          <Shield className="h-7 w-7 text-primary-foreground" />
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground">Verify OTP</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to your {method === "email" ? "email" : "phone"}{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>

        <div className="mt-8 flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="mt-8 w-full bg-gradient-accent text-primary-foreground hover:opacity-90 shadow-hero"
          size="lg"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? "Verifying..." : "Verify & Sign In"}
        </Button>

        <p className="mt-4 text-sm text-muted-foreground">
          Didn't receive it?{" "}
          <button className="font-medium text-primary hover:underline">Resend OTP</button>
        </p>
        <Link to="/login" className="mt-2 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← Back to Login
        </Link>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
