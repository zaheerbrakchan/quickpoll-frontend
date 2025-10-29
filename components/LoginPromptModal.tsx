"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

type LoginPromptModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function LoginPromptModal({ open, onClose }: LoginPromptModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-[90%] max-w-md text-center"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              You’re not logged in
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please log in or register to like or vote on polls.
            </p>

            <div className="flex justify-center gap-3">
              <Button onClick={() => (window.location.href = "/login")}>Login</Button>
              <Button
                onClick={() => (window.location.href = "/register")}
                variant="outline"
              >
                Register
              </Button>
              <Button onClick={onClose} variant="ghost">
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
