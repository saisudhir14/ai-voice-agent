import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function VoiceIcon({ className, ...props }: React.ComponentProps<typeof motion.svg>) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
      {...props}
    >
      <motion.path
        d="M2 10v3"
        animate={{ d: ["M2 10v3", "M2 8v7", "M2 10v3"] }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0 }}
      />
      <motion.path
        d="M6 6v11"
        animate={{ d: ["M6 6v11", "M6 4v15", "M6 6v11"] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.1 }}
      />
      <motion.path
        d="M10 3v18"
        animate={{ d: ["M10 3v18", "M10 2v20", "M10 3v18"] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.2 }}
      />
      <motion.path
        d="M14 8v7"
        animate={{ d: ["M14 8v7", "M14 6v11", "M14 8v7"] }}
        transition={{ duration: 0.9, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.15 }}
      />
      <motion.path
        d="M18 5v13"
        animate={{ d: ["M18 5v13", "M18 3v17", "M18 5v13"] }}
        transition={{ duration: 1.1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.05 }}
      />
      <motion.path
        d="M22 10v4"
        animate={{ d: ["M22 10v4", "M22 9v6", "M22 10v4"] }}
        transition={{ duration: 1.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.25 }}
      />
    </motion.svg>
  )
}