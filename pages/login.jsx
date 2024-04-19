import { signIn } from "next-auth/react";

const Login = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <p className="text-4xl font-bold mb-4">Welcome to Amassify</p>
      <button
        className="text-white px-8 py-2 rounded-full bg-green-500 font-bold text-lg"
        onClick={() => signIn("spotify", { callbackUrl: "/" })}
      >
        Login with Spotify
      </button>
    </div>
  );
};

export default Login;
