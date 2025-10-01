"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface HomeButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "floating" | "minimal" | "mobile" | "mobile-white";
  pulse?: boolean;
}

export default function HomeButton({ 
  className = "", 
  size = "md", 
  variant = "default",
  pulse = false
}: HomeButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard');
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const variantClasses = {
    default: "bg-gradient-to-r from-accenttext to-accenttext/80 hover:from-accenttext/90 hover:to-accenttext/70 text-white shadow-lg hover:shadow-xl",
    floating: "bg-white/90 backdrop-blur-sm border border-accenttext/20 text-accenttext hover:bg-white hover:border-accenttext/40 shadow-lg hover:shadow-xl",
    minimal: "bg-transparent border-2 border-accenttext text-accenttext hover:bg-accenttext hover:text-white",
    mobile: "bg-gradient-to-r from-accenttext to-accenttext/80 hover:from-accenttext/90 hover:to-accenttext/70 text-white shadow-lg hover:shadow-xl fixed bottom-6 right-6 z-50 rounded-full p-4",
    "mobile-white": "bg-white/90 backdrop-blur-sm border border-white/20 text-accenttext hover:bg-white hover:border-white/40 shadow-lg hover:shadow-xl rounded-full p-3"
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        font-semibold rounded-xl transition-all duration-300 
        transform hover:scale-[1.02] active:scale-[0.98] 
        flex items-center gap-2 group
        ${className}
      `}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: pulse ? [1, 1.05, 1] : 1
      }}
      transition={{ 
        duration: 0.3,
        scale: pulse ? { repeat: Infinity, duration: 2 } : undefined
      }}
    >
      <motion.div
        className="flex items-center gap-2"
        whileHover={{ x: -2 }}
        transition={{ duration: 0.2 }}
      >
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:scale-110"
          whileHover={{ rotate: -10 }}
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </motion.svg>
        {variant !== "mobile" && variant !== "mobile-white" && <span>Главная страница</span>}
      </motion.div>
      
      {/* Декоративные элементы */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />
      
      {/* Блестящий эффект при наведении */}
      <motion.div
        className="absolute inset-0 rounded-xl overflow-hidden"
        initial={false}
      >
        <motion.div
          className="absolute -top-1 -left-1 w-0 h-0 bg-white/30 rounded-full"
          whileHover={{
            width: "100%",
            height: "100%",
            transition: { duration: 0.6, ease: "easeOut" }
          }}
        />
      </motion.div>
    </motion.button>
  );
}
