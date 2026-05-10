import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";

/** Public LottieFiles asset — “Successful” animation (success / checkmark style). */
const SUCCESS_LOTTIE_URL =
  "https://assets2.lottiefiles.com/packages/lf20_jbrw3hcz.json";

export const RegisterSuccessful = () => {
  const navigate = useNavigate();
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(SUCCESS_LOTTIE_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load animation");
        return res.json() as Promise<object>;
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FAFAFB] px-6 py-10 font-sans text-center antialiased"
      aria-labelledby="registration-success-heading"
    >
      <div className="flex w-full max-w-md flex-col items-center">
        <div
          className="flex h-[250px] w-[250px] shrink-0 items-center justify-center"
          role="img"
          aria-label="Success animation"
        >
          {animationData && !loadError ? (
            <Lottie
              animationData={animationData}
              loop
              style={{ width: 250, height: 250 }}
              aria-hidden
            />
          ) : loadError ? (
            <div className="flex h-full w-full items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-white text-sm text-slate-400">
              Animation unavailable
            </div>
          ) : (
            <div
              className="h-[250px] w-[250px]"
              aria-busy="true"
              aria-hidden
            />
          )}
        </div>

        <h1
          id="registration-success-heading"
          className="mt-6 text-[32px] font-bold leading-tight tracking-tight text-[#34A853]"
        >
          Registered successfully!
        </h1>

        <p className="mt-2 max-w-sm text-lg font-normal leading-snug text-[#4B5563]">
          Confirm your email address in your mailbox
        </p>

        <button
          type="button"
          className="mt-8 rounded-md border-2 border-[#5A52FF] bg-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-[#5A52FF] transition-colors duration-200 ease-out hover:bg-[#5A52FF] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A52FF]"
          onClick={() => navigate("/", { replace: true })}
        >
          Go home
        </button>
      </div>
    </main>
  );
};
