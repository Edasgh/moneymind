import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import SignUpModal from "./SignUpModal";
import { Eye, EyeOffIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";

const SignInModal = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [typePassword, setTypePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [country, setCountry] = useState("India");

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        name.trim().length === 0 ||
        email.trim().length === 0 ||
        country.trim().length === 0 ||
        password.trim().length === 0 ||
        cPassword.trim().length === 0
      ) {
        toast.error("Please fill all the fields!");
        setLoading(false);
        return;
      }

      if (!email.trim().includes("@")) {
        toast.error("Invalid email address!");
        setLoading(false);
        return;
      }

      if (password.trim() !== cPassword.trim()) {
        toast.error("Password & Confirm password should match!");
        setLoading(false);
        return;
      }

      const body = {
        name,
        email,
        password,
        country,
      };
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.status != 201) {
        toast.error(data.error);
        return;
      }
      const resp = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      setLoading(false);
      if (resp?.error) {
        toast.error(resp.error);
        return;
      } else {
        toast.success("Signed in 🎉!");
        setShow(false);
        router.refresh();
        router.push("/analyze");
      }
    } catch (error) {
      toast.error("Sign in Failed! Please try again later.");
      setLoading(false);
    }
  };

  if (show) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-99999999 flex items-center justify-center bg-black/70 text-white backdrop-blur-md text-sm md:text-base"
        >
          {/* MODAL */}
          <div
            className="relative w-full max-w-lg p-8 rounded-3xl 
    bg-linear-to-br from-[#020617] to-[#0f172a] 
    border border-white/10 shadow-2xl overflow-hidden"
          >
            <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
            {/* ✨ BACKGROUND GLOW */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 blur-3xl"></div>

            {/* CLOSE */}
            <button
              onClick={() => {
                setShow(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            {/* HEADER */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🚀</div>
              <h2 className="text-xl font-semibold text-white">
                Create Your AI Finance Account
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Start tracking, improving & automating your money habits
              </p>
            </div>

            {/* FORM */}
            <form className="space-y-4" onSubmit={handleSignIn}>
              {/* NAME */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* EMAIL */}
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* Password */}
              <div
                className="w-full mx-auto flex gap-3 bg-black/40 p-1.5 rounded-xl border border-white/10 group 
  focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200"
              >
                <input
                  type={typePassword ? "password" : "text"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none p-2"
                  required
                />

                <button
                  title={typePassword ? "Hide" : "Show"}
                  onClick={() => {
                    setTypePassword(!typePassword);
                  }}
                  className="bg-gray-900 transition p-3 md:px-5 md:py-2 rounded-xl text-sm font-medium hover:bg-gray-800"
                >
                  {typePassword ? (
                    <Eye className="w-4 h-4 md:w-6 md:h-6" />
                  ) : (
                    <EyeOffIcon className="w-4 h-4 md:w-6 md:h-6" />
                  )}
                </button>
              </div>
              {/* Confirm password */}
              <div
                className="w-full mx-auto flex gap-3 bg-black/40 p-1.5 rounded-xl border border-white/10 group 
  focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200"
              >
                <input
                  type={typePassword ? "password" : "text"}
                  placeholder="Confirm Password"
                  value={cPassword}
                  onChange={(e) => setCPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none p-2"
                  required
                />

                <button
                  title={typePassword ? "Hide" : "Show"}
                  onClick={() => {
                    setTypePassword(!typePassword);
                  }}
                  className="bg-gray-900 transition p-3 md:px-5 md:py-2 rounded-xl text-sm font-medium hover:bg-gray-800"
                >
                  {typePassword ? (
                    <Eye className="w-4 h-4 md:w-6 md:h-6" />
                  ) : (
                    <EyeOffIcon className="w-4 h-4 md:w-6 md:h-6" />
                  )}
                </button>
              </div>

              {/* COUNTRY */}
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option>Select Country</option>
                <option className="text-white" value={"India"}>
                  India
                </option>
                <option className="text-white" value={"United States"}>
                  United States
                </option>
                <option className="text-white" value={"United Kingdom"}>
                  United Kingdom
                </option>
                <option className="text-white" value={"Canada"}>
                  Canada
                </option>
                <option className="text-white" value={"Austrailia"}>
                  Australia
                </option>
              </select>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl 
          bg-linear-to-r from-blue-500 to-purple-500 
          hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
              >
                {loading ? "Creating account.." : "🚀 Create Account"}
              </button>
            </form>

            {/* FOOTER */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setShow(false);
                  setShowModal(true);
                }}
                className="text-blue-400 cursor-pointer hover:underline"
              >
                Sign up
              </span>
            </p>

            {/* <p className="text-[10px] text-gray-600 text-center mt-2">
              By continuing, you agree to our{" "}
              <span className="text-blue-400 cursor-pointer hover:underline">
                Terms & Privacy Policy{" "}
              </span>
            </p> */}
          </div>
        </motion.div>
      </>
    );
  } else if (showModal) {
    return <SignUpModal show={showModal} setShow={setShowModal} />;
  }
};

export default SignInModal;
