import { motion } from "framer-motion";

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      transition={{
        duration: 0.45,
        ease: "easeInOut"
      }}
      style={{
        width: "100%"
      }}
    >
      {children}
    </motion.div>
  );
}